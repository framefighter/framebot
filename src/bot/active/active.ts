import { InlineKeyboardMarkup, InlineQuery, InlineQueryResult, Message } from 'node-telegram-bot-api'
import { Generator } from '../../utils/generator'
import { User } from '../user/user'
import { STATE, DEFAULTS } from '../static'

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
            settings: {
                alert: {},
                arbitration: [],
                convertedSong: "",
                filter: [],
                menu: []
            }
        })
        this.command = c.command
        this.args = c.args
        this.ws = STATE.ws || {}
        this.executed = false
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
                inline = [{
                    id: Generator.ID(),
                    title: this.command.id + " | No inline results!",
                    description: "Click to execute command!",
                    type: "article",
                    input_message_content: {
                        message_text: this.message || "No Text",
                        parse_mode: DEFAULTS.parse_mode,
                    },
                    reply_markup: this.keyboard
                }]
            } else {
                inline = [{
                    id: Generator.ID(),
                    title: this.command.id + " | Start typing to get results!",
                    description: "Or click to execute command!",
                    type: "article",
                    input_message_content: {
                        message_text: this.message || "No Text",
                        parse_mode: DEFAULTS.parse_mode,
                    },
                    reply_markup: this.keyboard
                }]
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