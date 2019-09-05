import TelegramBot, { InlineQueryResult, InlineQuery } from "node-telegram-bot-api"
import { Active } from './active/active'
import { Database } from '../database/database'
import { User } from "./user/user"
import { CONFIG } from '../utils/config'
import { World } from '../warframe/state/world'
import StateCheck from './checker/stateCheck'
import { Commands } from './command/commands'
import { Keyboard } from './keyboard/keyboard'
import { Formatter } from '../utils/formatter'
import { Searchable } from '../warframe/state/searchable'
import { Extra } from '../warframe/state/extra'
import { Inline } from './message/inline'
import { btn } from './command/definitions'
import { Button } from './keyboard/button'


export class Bot implements bot.Bot {
    token: string
    api: TelegramBot
    commands: Commands
    database: Database
    state: World
    ws: wf.Ws
    info: Searchable
    extra: Extra
    defaults: bot.Defaults
    checker: StateCheck
    users: { [key: number]: User }

    constructor(botConstructor: bot.Constructor) {
        this.token = CONFIG.token
        this.api = new TelegramBot(this.token, { polling: true })
        this.commands = botConstructor.commands
        this.database = new Database("./data")
        this.state = new World(60000)
        this.extra = new Extra(61000)
        this.info = new Searchable(602000)
        this.ws = {}
        this.defaults = {
            parse_mode: "Markdown",
        }
        this.initEmitters()
        this.database.users.list.forEach(user => {
            if (user.admin) {
                this.api.sendMessage(user.id, "Bot started and ready!")
            }
        })
        this.checker = new StateCheck()
        this.users = {}
    }

    private initEmitters() {
        this.stateEmitter()
        this.initMessageEmitter()
        this.initCallbackQueryEmitter()
        this.initInlineQueryEmitter()
    }

    private getUser(from: TelegramBot.User): User {
        if (this.users[from.id]) {
            return this.users[from.id]
        } else if (this.database.users.db.exists(`/users/${from.id}`)) {
            const fromDB = this.database.users.db.getData(`/users/${from.id}`)
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
            this.database.users.update(newUser.from)
            return newUser
        }
    }

    private stateEmitter() {
        this.state.on("state",
            (data) => {
                this.ws = data
                this.checker.check()
            })
        this.extra.on("extra",
            data => {
                this.checker.checkExtra()
            })
    }

    private initMessageEmitter() {
        this.api.on("message",
            async msg => {
                if (msg.from
                    && msg.chat
                    && msg.text
                    && msg.text.charAt(0) === "/") {
                    const parsedCmd = this.commands.parse(msg.text)
                    if (parsedCmd) {
                        const { command, args } = parsedCmd
                        const user = this.getUser(msg.from)
                        const active = new Active({
                            user,
                            command,
                            args,
                            chatID: msg.chat.id,
                        })
                        active.execute()
                        active.send()
                        user.lastActive = active
                        this.database.users.update(user.from)
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
                    const ids = {
                        CbqID: cbq.id,
                        inlineMsgID: cbq.inline_message_id,
                        chatID: cbq.message
                            ? cbq.message.chat.id
                            : user.id,
                        msgID: cbq.message
                            ? cbq.message.message_id
                            : undefined
                    }

                    const pc = this.commands.parse(cbq.data)
                    if (pc) {
                        const args = pc.args
                        const find = pc.command.id
                        const command = this.commands.find(find)
                        if (command) {
                            const active = new Active({
                                user, command, args, chatID: ids.chatID,
                            })
                            active.execute()
                            active.edit(ids)
                            user.lastActive = active
                        }
                        this.database.users.update(user.from)
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
                    const parsedCmd = this.commands.parse(query || "help")
                    if (parsedCmd) {
                        const { command, args } = parsedCmd
                        if (command && !command.hidden) {
                            const active = new Active({
                                user,
                                command,
                                args,
                                chatID: user.id,
                            })
                            active.results(iq)
                            user.lastActive = active
                        }
                    } else if (offset === 0) {
                        const results = [new Inline({
                            title: `No command "${iq.query}" found!`,
                            description: "Please try a different query!\nIf you want to search for items type \"find\" first.",
                            text: `No command ${iq.query.clean()} found!`,
                        }).toInline()]
                        const nearest = this.commands.parse(query, true)
                        if (nearest) {
                            const active = new Active({
                                user,
                                command: nearest.command,
                                args: nearest.args,
                                chatID: user.id,
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
                    this.database.users.update(user.from)
                }
            }
        )
    }

}
