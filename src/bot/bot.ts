import TelegramBot, { EditMessageReplyMarkupOptions, EditMessageTextOptions } from "node-telegram-bot-api"
import { Active } from './active/active'
import { User } from "./user/user"
import { Keyboard } from './keyboard/keyboard'
import { Inline } from './message/inline'
import { Button } from './keyboard/button'
import { DB, COMMANDS, DEFAULTS } from './static'
import { CONFIG } from '../utils/config'
import StateCheck from './checker/stateCheck'



export class Bot implements bot.Bot {
    api = new TelegramBot(CONFIG.token, { polling: true })
    checker = new StateCheck(this.api, 60000);
    users: { [key: number]: User }

    constructor() {
        this.initEmitters()
        DB.users.list.forEach(user => {
            if (user.admin) {
                this.api.sendMessage(user.id, "Bot started and ready!")
            }
        })
        this.users = {}
    }

    private initEmitters() {
        this.initMessageEmitter()
        this.initCallbackQueryEmitter()
        this.initInlineQueryEmitter()
    }

    private getUser(from: TelegramBot.User): User {
        if (this.users[from.id]) {
            return this.users[from.id]
        } else if (DB.users.db.exists(`/users/${from.id}`)) {
            const fromDB = DB.users.db.getData(`/users/${from.id}`)
            const user = new User(fromDB)
            this.users[user.id] = user
            return user
        } else {
            const newUser = new User({
                ...from,
                admin: false,
                settings: User.default.settings
            })
            this.users[newUser.id] = newUser
            DB.users.update(newUser.from)
            return newUser
        }
    }

    private initMessageEmitter() {
        this.api.on("message",
            async msg => {
                if (msg.from
                    && msg.chat
                    && msg.text
                    && msg.text.charAt(0) === "/") {
                    const parsedCmd = COMMANDS.parse(msg.text)
                    if (parsedCmd) {
                        const { command, args } = parsedCmd
                        const user = this.getUser(msg.from)
                        const active = new Active({ user, command, args })
                        active.execute()
                        this.api.sendMessage(msg.chat.id, active.message, {
                            parse_mode: DEFAULTS.parse_mode,
                            reply_markup: active.keyboard
                        })
                        DB.users.update(user.from)
                    }
                }
            }
        )
    }

    private initCallbackQueryEmitter() {
        this.api.on("callback_query",
            async cbq => {
                if (cbq.from && cbq.data) {
                    const user = this.getUser(cbq.from)
                    let options: EditMessageTextOptions = {
                        parse_mode: DEFAULTS.parse_mode
                    }
                    if (cbq.inline_message_id) {
                        options.inline_message_id = cbq.inline_message_id
                    } else if (cbq.message) {
                        options.chat_id = cbq.message.chat.id
                        options.message_id = cbq.message.message_id
                    } else {
                        options.chat_id = user.id
                    }

                    console.log(options)

                    const pc = COMMANDS.parse(cbq.data)
                    if (pc) {
                        const args = pc.args
                        const find = pc.command.id
                        const command = COMMANDS.find(find)
                        if (command) {
                            const active = new Active({ user, command, args })
                            active.execute()
                            if (active.message) {
                                this.api.editMessageText(active.message, {
                                    ...options,
                                    reply_markup: active.keyboard,
                                })
                            } else if (active.keyboard) {
                                this.api.editMessageReplyMarkup(active.keyboard, options)
                            }
                        }
                        DB.users.update(user.from)
                    }

                }
            }
        )
    }


    private initInlineQueryEmitter() {
        this.api.on("inline_query",
            async iq => {
                if (iq.from) {
                    const offset = parseInt(iq.offset || "0")
                    const query = iq.query
                    const user = this.getUser(iq.from)
                    const parsedCmd = COMMANDS.parse(query || "help")
                    if (parsedCmd) {
                        const { command, args } = parsedCmd
                        if (command && !command.hidden) {
                            const active = new Active({ user, command, args })
                            const results = active.inline(offset).slice(offset, 10 + offset)
                            this.api.answerInlineQuery(iq.id,
                                results,
                                {
                                    cache_time: 1,
                                    next_offset: (offset + results.length)
                                        .toString(),
                                    is_personal: true,
                                }
                            )
                        }
                    } else if (offset === 0) {
                        const results = [new Inline({
                            title: `No command "${iq.query}" found!`,
                            description: "Please try a different query!".nl()
                            + "If you want to search for items type \"find\" first.",
                            text: `No command ${iq.query.clean()} found!`,
                        }).toInline()]
                        const nearest = COMMANDS.parse(query, true)
                        if (nearest) {
                            const active = new Active({
                                user,
                                command: nearest.command,
                                args: nearest.args,
                            })
                            results.push(new Inline({
                                title: `Did you mean "${nearest.command.id}" ?`,
                                description: nearest.matches
                                    ? `Others: ${nearest.matches.map(cmd => cmd.id).join(", ")}`
                                    : undefined,
                                text: `Click below to execute ${nearest.command.id}!`,
                                keyboard: new Keyboard({
                                    layout: [[new Button({
                                        callback_data: nearest.command.id,
                                        alwaysShow: true,
                                    })]]
                                })
                            }).toInline(active))
                        }
                        this.api.answerInlineQuery(iq.id, results, { cache_time: 1 }
                        )
                    }
                    DB.users.update(user.from)
                }
            }
        )
    }

}
