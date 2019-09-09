import { InlineKeyboardMarkup, InlineQueryResult } from 'node-telegram-bot-api'
import { User } from '../user/user'
import { STATE, DEFAULTS } from '../static'
import { Inline } from '../message/inline'

export class Active implements active.Active {
    user: User
    execute_return?: any
    command: command.Command
    matches?: command.Command[]
    args: string[]
    ws: wf.Ws
    executed: boolean

    constructor(c: Readonly<active.Constructor>) {
        this.user = c.user || new User({
            id: 0,
            is_bot: true,
            first_name: "",
            admin: false,
            settings: DEFAULTS.user.settings
        })
        this.command = c.command
        this.args = c.args
        this.ws = STATE.ws || {}
        this.executed = false

        if (this.user.settings.last.length > 10) {
            this.user.settings.last.pop()
        }
        this.user.settings.last.unshift({ command: c.command.id, args: c.args })
    }

    get message(): string {
        return this.command.message(this).toString(this.user)
    }

    get keyboard(): InlineKeyboardMarkup {
        return this.command.keyboard(this).toInline(this)
    }

    inline(offset: number): InlineQueryResult[] {
        let inline = this.command.inline(this).map(result => result.toInline(this))
        if (offset === 0 && inline.length === 0) {
            if (this.args.length > 0) {
                inline = [new Inline({
                    title: this.command.id + " | No inline results!",
                    description: "Click to execute command!",
                    text: this.message || "No Text",
                    keyboard: this.command.keyboard(this)
                })]
            } else {
                inline = [new Inline({
                    title: this.command.id + " | Start typing to get results!",
                    description: "Or click to execute command!",
                    text: this.message || "No Text",
                    keyboard: this.command.keyboard(this)
                })]
            }
        }
        return inline
    }

    execute() {
        if (this.command.action && !this.executed) {
            if (this.user && this.command.privileged(this.user.from)) {
                this.executed = true
                this.execute_return = this.command.action(this)
            }
        }
    }
}