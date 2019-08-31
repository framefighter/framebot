import TelegramBot, { InlineQueryResult, InlineQuery } from "node-telegram-bot-api";
import { Active } from './active/active';
import { suffix, sep } from './command/definitions';
import { Database } from '../database/database';
import { User } from "./user/user";
import { CONFIG } from '../utils/config';
import { World } from '../warframe/state/world';
import StateCheck from './checker/stateCheck';
import { Commands } from './command/commands';
import { Keyboard } from './keyboard/keyboard';
import { Formatter } from '../utils/formatter';
import { Searchable } from '../warframe/state/searchable';
import { Extra } from '../warframe/state/extra';
import { Command } from './command/command';


export class Bot implements bot.Bot {
    token: string;
    api: TelegramBot;
    commands: Commands;
    database: Database;
    state: World;
    ws: wf.Ws;
    info: Searchable;
    extra: Extra;
    defaults: bot.Defaults;
    checker: StateCheck;

    constructor(botConstructor: bot.Constructor) {
        this.token = CONFIG.token;
        this.api = new TelegramBot(this.token, { polling: true });
        this.commands = botConstructor.commands;
        this.database = new Database("./data");
        this.state = new World(60000);
        this.extra = new Extra(61000);
        this.info = new Searchable(602000);
        this.ws = {};
        this.defaults = {
            parse_mode: "Markdown",
        };
        this.initEmitters();
        this.database.users.list.forEach(user => {
            if (user.admin) {
                this.api.sendMessage(user.id, "Bot started and ready!")
            }
        });
        this.checker = new StateCheck();
    }

    private initEmitters() {
        this.stateEmitter();
        this.initMessageEmitter();
        this.initCallbackQueryEmitter();
        this.initInlineQueryEmitter();
    }

    private getUser(from: TelegramBot.User): User {
        if (this.database.users.db.exists(`/users/${from.id}`)) {
            return this.database.users.db.getData(`/users/${from.id}`);
        } else {
            const newUser = new User({
                admin: false,
                ...from
            });
            this.database.users.update(newUser);
            return newUser;
        }
    }

    private stateEmitter() {
        this.state.on("state",
            (data) => {
                this.ws = data;
                this.checker.check();
            });
        this.extra.on("extra",
            data => {
                this.checker.checkExtra();
            })
    }

    private initMessageEmitter() {
        this.api.on("message",
            async msg => {
                if (msg.from
                    && msg.chat
                    && msg.text
                    && msg.text.charAt(0) === "/") {
                    const parsedCmd = this.commands.parse(msg.text);
                    if (parsedCmd) {
                        const { command, args } = parsedCmd;
                        const user = this.getUser(msg.from);
                        const active = new Active({
                            user,
                            command,
                            args,
                            chatID: msg.chat.id,
                        })
                        active.execute()
                        active.send();
                        this.database.users.update(user);
                    }
                }
            }
        );
    }

    private initCallbackQueryEmitter() {
        this.api.on("callback_query",
            async cbq => {
                if (cbq.from
                    && cbq.data) {
                    const user = this.getUser(cbq.from);
                    const ids = {
                        CbqID: cbq.id,
                        inlineMsgID: cbq.inline_message_id,
                        chatID: cbq.message
                            ? cbq.message.chat.id
                            : user.id,
                        msgID: cbq.message
                            ? cbq.message.message_id
                            : undefined
                    };

                    const split = cbq.data.split(sep);
                    const cbqPrefix = split[0]
                    const cbqSuffix = split[1]
                    let args: string[] = [cbqPrefix];
                    let find: command.ID = "none";

                    switch (cbqSuffix) {
                        case suffix().askRemoveItem:
                            if (user.settings.filter.includes(cbqPrefix)) {
                                find = "askRemove"
                            }
                            break;
                        case suffix().addItem:
                            find = "add"
                            break;
                        case suffix().removeItem:
                            if (user.settings.filter.includes(cbqPrefix)) {
                                find = "remove"
                            }
                            break;
                        case suffix().executeCheck:
                            if (user.settings.filter.includes(cbqPrefix)) {
                                find = "check"
                            }
                            break;
                        case suffix().arbitrationRemove:
                            if (user.settings.arbitration.includes(cbqPrefix)) {
                                find = "arbitrationFilter"
                            }
                            break;
                        case suffix().addMenuButton:
                            const pos = cbqPrefix.split(".").clean()
                            if (pos.length === 2
                                && pos[0] !== undefined
                                && pos[1] !== undefined) {
                                args = pos;
                                find = "configSelection"
                            }
                            break;
                        case suffix().removeMenuButton:
                        case suffix().selectMenuButton:
                            find = "config"
                            break;
                        case suffix().showSong:
                            find = "showSong"
                            break;
                        case suffix().removeSong:
                            find = "songs"
                            break;
                        default:
                            break;
                    }
                    const pc = this.commands.parse(cbqPrefix)
                    if (find === "none" && pc) {
                        args = pc.args
                        find = pc.command.id
                    }
                    const command = this.commands.find(find)
                    if (command) {
                        const active = new Active({
                            user, command, args, chatID: ids.chatID,
                        })
                        active.execute();
                        active.edit(ids);
                    }

                    this.database.users.update(user);
                }
            }
        );
    }


    private initInlineQueryEmitter() {
        this.api.on("inline_query",
            async iq => {
                if (iq.from) {
                    const offset = parseInt(iq.offset || "0")
                    const query = iq.query;
                    const user = this.getUser(iq.from);
                    const parsedCmd = this.commands.parse(query, true);

                    const commandsGroupInline: InlineQueryResult = {
                        id: iq.id,
                        title: `Commands:`,
                        type: "article",
                        input_message_content: {
                            message_text: `commands group header!`,
                            parse_mode: this.defaults.parse_mode,
                        },
                    };

                    if (parsedCmd) {
                        const { command, args, matches } = parsedCmd;
                        if (matches && matches.length > 0) {
                            const inlineResults: InlineQueryResult[] =
                                matches
                                    .slice(offset, 10 + offset)
                                    .map(cmd => {
                                        const active = new Active({
                                            user,
                                            command: cmd,
                                            args: args,
                                            chatID: user.id,
                                        });
                                        return {
                                            id: cmd.id,
                                            title: cmd.id + cmd.alt.join(" | ").start(" |"),
                                            description: cmd.help,
                                            type: "article",
                                            input_message_content: {
                                                message_text: Formatter.format({
                                                    caption: cmd.id,
                                                    addCaption: cmd.alt.join(" | "),
                                                    subCaption: "/" + cmd.id.space() + args.join(", "),
                                                    description: "Click below to execute!"
                                                }),
                                                parse_mode: this.defaults.parse_mode,
                                            },
                                            reply_markup: new Keyboard({
                                                layout: [[{ id: cmd.id, text: "Execute!" }]]
                                            }).toInline(active)
                                        }
                                    });
                            this.api.answerInlineQuery(iq.id,
                                [
                                    ...(offset === 0 ? [commandsGroupInline] : []),
                                    ...inlineResults
                                ],
                                {
                                    cache_time: 1,
                                    next_offset: (offset
                                        + inlineResults.length
                                        + (offset === 0 ? 1 : 0))
                                        .toString(),
                                    is_personal: true,
                                }
                            );
                        } else if (command) {
                            const active = new Active({
                                user,
                                command,
                                args,
                                chatID: user.id,
                            })
                            // this.inlineResult(active, iq)
                            active.results(iq);
                        }

                    } else if (!query) {
                        const inlineResults: InlineQueryResult[] =
                            this.commands.list
                                .slice(offset, 10 + offset)
                                .map(cmd => {
                                    const active = new Active({
                                        user,
                                        command: cmd,
                                        args: [],
                                        chatID: user.id,
                                    });
                                    return {
                                        id: cmd.id,
                                        title: cmd.id + cmd.alt.join(" | ").start(" |"),
                                        description: cmd.help,
                                        type: "article",
                                        input_message_content: {
                                            message_text: Formatter.format({
                                                caption: cmd.id,
                                                addCaption: cmd.alt.join(" | "),
                                                subCaption: "/" + cmd.id,
                                                description: "Click below to execute!"
                                            }),
                                            parse_mode: this.defaults.parse_mode,
                                        },
                                        reply_markup: new Keyboard({
                                            layout: [[{ id: cmd.id, text: "Execute!" }]]
                                        }).toInline(active)
                                    }
                                });

                        this.api.answerInlineQuery(iq.id,
                            [
                                ...(offset === 0 ? [commandsGroupInline] : []),
                                ...inlineResults
                            ],
                            {
                                cache_time: 1,
                                next_offset: (offset
                                    + inlineResults.length
                                    + (offset === 0 ? 1 : 0))
                                    .toString(),
                                is_personal: true,
                            }
                        )
                    } else if (offset === 0) {
                        this.api.answerInlineQuery(iq.id,
                            [{
                                id: iq.id,
                                title: `No command ${iq.query} found!`,
                                description: "Please try a different query!\nIf you want to search for items type \"find\" first.",
                                type: "article",
                                input_message_content: {
                                    message_text: `No command ${iq.query.clean()} found!`,
                                    parse_mode: this.defaults.parse_mode,
                                },
                            }],
                            {
                                cache_time: 1,
                                is_personal: true,
                            }
                        );
                    }
                    this.database.users.update(user);
                }
            }
        );
    }
}
