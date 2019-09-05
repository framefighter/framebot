import { InlineKeyboardMarkup, InlineQuery, InlineQueryResult, Message } from 'node-telegram-bot-api'
import { BOT } from '../..'
import { Generator } from '../../utils/generator'
import { User } from '../user/user'

export class Active implements active.Active {
    user: User
    chatID: number | string
    execute_return?: any
    command: command.Command
    matches?: command.Command[]
    args: string[]
    ws: wf.Ws
    inline: InlineQueryResult[]
    message: string
    keyboard: InlineKeyboardMarkup
    executed: boolean

    constructor(activeConstructor: Readonly<active.Constructor>) {
        this.user = activeConstructor.user
        this.command = activeConstructor.command
        this.args = activeConstructor.args
        this.chatID = activeConstructor.chatID
        this.ws = BOT.ws
        this.executed = false
        this.inline = this.command.inline(this).map(result => result.toInline(this))
        this.message = this.command.message(this).toString(this.user)
        this.keyboard = this.command.keyboard(this).toInline(this)
    }

    updateText() {
        this.inline = this.command.inline(this).map(result => result.toInline(this))
        this.message = this.command.message(this).toString(this.user)
        this.keyboard = this.command.keyboard(this).toInline(this)
    }

    send(msg?: string) {
        const message = msg || this.message

        const onErr = (err: any) => { console.warn(err) }

        if (message) {
            BOT.api.sendMessage(
                this.chatID,
                message,
                {
                    parse_mode: BOT.defaults.parse_mode,
                    reply_markup: this.keyboard,
                }
            ).catch(onErr)
        }
    }

    edit(IDs: active.IDs, msg?: string) {
        const message = msg || this.message

        const onErr = (err: any) => { console.warn(err) }
        let options = {}

        if (message) {
            if (IDs.inlineMsgID) {
                options = {
                    inline_message_id: IDs.inlineMsgID,
                    parse_mode: BOT.defaults.parse_mode,
                    reply_markup: this.keyboard,
                }
            } else if (IDs.msgID) {
                options = {
                    message_id: IDs.msgID,
                    chat_id: this.chatID,
                    parse_mode: BOT.defaults.parse_mode,
                    reply_markup: this.keyboard,
                }
            } else {
                options = {
                    parse_mode: BOT.defaults.parse_mode,
                    reply_markup: this.keyboard,
                }
            }
            BOT.api.editMessageText(message, options).catch(onErr)
        } else if (this.keyboard) {
            if (this.chatID && IDs.msgID) {
                BOT.api.editMessageReplyMarkup(this.keyboard, {
                    message_id: IDs.msgID,
                    chat_id: this.chatID,
                    inline_message_id: IDs.inlineMsgID
                })
            }
        }
        if (IDs.CbqID) {
            BOT.api.answerCallbackQuery(IDs.CbqID).catch(onErr)
        }
    }

    execute() {
        if (this.command.action && !this.executed) {
            if (this.command.privileged(this.user.from)) {
                this.executed = true
                this.execute_return = this.command.action(this)
                this.updateText()
            }
        }
    }

    results(iq: InlineQuery) {
        const onErr = (err: any) => { console.warn(err) }

        const offset = parseInt(iq.offset || "0")
        const inlineResults: InlineQueryResult[] = this.inline.slice(offset, 10 + offset)

        if (inlineResults.length > 0) {
            BOT.api.answerInlineQuery(iq.id,
                inlineResults,
                {
                    cache_time: 1,
                    next_offset: (offset + inlineResults.length)
                        .toString(),
                    is_personal: true,
                }
            ).catch(onErr)
        } else if (offset === 0) {
            if (this.args.length > 0) {
                this.inline = [{
                    id: Generator.ID(),
                    title: this.command.id + " | No inline results!",
                    description: "Click to execute command!",
                    type: "article",
                    input_message_content: {
                        message_text: this.message || "No Text",
                        parse_mode: BOT.defaults.parse_mode,
                    },
                    reply_markup: this.keyboard
                }]
            } else {
                this.inline = [{
                    id: Generator.ID(),
                    title: this.command.id + " | Start typing to get results!",
                    description: "Or click to execute command!",
                    type: "article",
                    input_message_content: {
                        message_text: this.message || "No Text",
                        parse_mode: BOT.defaults.parse_mode,
                    },
                    reply_markup: this.keyboard
                }]
            }
            BOT.api.answerInlineQuery(iq.id,
                this.inline,
                {
                    cache_time: 1,
                    is_personal: true,
                }
            ).catch(onErr)
        }
    }

}