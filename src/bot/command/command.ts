import { Keyboard } from '../keyboard/keyboard'
import { Inline } from '../message/inline'
import { Message } from '../message/message'
import { Check } from '../../utils/check'
import { Formatter } from '../../utils/formatter'
import { Active } from '../active/active'
import { menuBtn } from './definitions'
import { COMMANDS, STATE, DEFAULTS } from '../static'

export class Command implements command.Command {
    emoji: string
    id: command.ID
    alt: string[]
    help: string
    adminOnly: boolean
    jsonKey?: keyof wf.Ws
    hidden: boolean
    message: (active: Active) => Message
    inline: (active: Active) => Inline[]
    keyboard: (active: Active) => keyboard.Board
    rewards: (active: Active) => message.Reward[]
    action: (active: Active) => any
    name: (active: Active) => string
    count: (active: Active) => number

    constructor(id: command.ID, c: Readonly<command.Constructor>) {
        this.id = id
        const anyMsg = c.message 
        if (Check.id(anyMsg)) {
            this.message = (active) =>  COMMANDS.fromID(anyMsg).message(active)
        } else {
            this.message = anyMsg || (() => new Message(""))
        }

        const anyBoard = c.keyboard
        if (Check.id(anyBoard)) {
            this.keyboard = (active) =>
                COMMANDS.fromID(anyBoard).keyboard(active)
        } else {
            this.keyboard = ((active) => {
                if (anyBoard && menuBtn(active) !== active.command.id) {
                    return anyBoard(active)
                }
                return DEFAULTS.keyboard(active)
            })
        }


        this.inline = c.inline
            || (() => [])
        this.rewards = c.rewards
            || (() => [])
        this.action = c.action
            || (() => null)
        this.emoji = c.emoji || ""
        this.jsonKey = c.jsonKey
        this.adminOnly = c.adminOnly || false
        this.help = c.help || ""
        this.alt = c.alt || []
        this.count = c.count !== undefined
            ? c.count
            : (() => {
                if (this.jsonKey) {
                    const obj = STATE.ws[this.jsonKey]
                    if (obj && Check.array(obj)) {
                        return obj.length || 0
                    }
                }
                return 0
            })
        this.name = c.name
            || (() => Formatter.camelToString(this.id))
        this.hidden = c.hidden || false
    }

    privileged(user?: user.From): boolean {
        if (user) {
            return !this.adminOnly || user.admin
        } return false
    }

    buttonText(active: Active): string {
        return this.emoji.space()
            + (Formatter.camelToString(this.name(active)))
            + (this.count(active) > 0 ? " [" + this.count(active) + "]" : "")
            + (this.adminOnly ? " [Admin]" : "")
    }
}

