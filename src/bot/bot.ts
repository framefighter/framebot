import TelegramBot, { InlineQueryResult, InlineQuery } from "node-telegram-bot-api";
import { Active } from './active/active';
import { check_suffix, item_suffix, remove_suffix, type_remove_suffix, add_suffix, add_config_suffix, select_config_suffix, remove_config_suffix, song_suffix, remove_song_suffix } from './command/definitions';
import { Database } from '../database/database';
import { User } from "./user/user";
import { CONFIG } from '../utils/config';
import { Searchable, World, Extra } from '../warframe/state/state';
import Checker from './checker/checker';
import { Commands } from './command/commands';
import { Keyboard } from './keyboard/keyboard';
import { Formatter } from '../utils/formatter';


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
    checker: Checker;

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
        this.checker = new Checker();
    }

    private initEmitters() {
        this.stateEmitter();
        this.initMessageEmitter();
        this.initCallbackQueryEmitter();
        this.initInlineQueryEmitter();
    }

    private getUser(from: TelegramBot.User): User {
        if (this.database.users.data.exists(`/users/${from.id}`)) {
            return this.database.users.data.getData(`/users/${from.id}`);
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
                    if (cbq.data.endsWith(item_suffix)) {
                        const item = cbq.data.replace(item_suffix, "");
                        if (user.settings.filter.includes(item)) {
                            const askRemoveCmd = this.commands.find("askRemove");
                            if (askRemoveCmd) {
                                const active = new Active({
                                    user,
                                    command: askRemoveCmd,
                                    args: [item],
                                    chatID: ids.chatID,
                                })
                                active.execute();
                                active.edit(ids);
                            }
                        }
                    } else if (cbq.data.endsWith(add_suffix)) {
                        const item = cbq.data.replace(add_suffix, "");
                        const addCmd = this.commands.find("add");
                        if (addCmd) {
                            const active = new Active({
                                user,
                                command: addCmd,
                                args: [item],
                                chatID: ids.chatID,
                            })
                            active.execute();
                            active.edit(ids);
                        }
                    } else if (cbq.data.endsWith(remove_suffix)) {
                        const item = cbq.data.replace(remove_suffix, "");
                        if (user.settings.filter.includes(item)) {
                            const removeCmd = this.commands.find("remove");
                            if (removeCmd) {
                                const active = new Active({
                                    user,
                                    command: removeCmd,
                                    args: [item],
                                    chatID: ids.chatID,
                                })
                                active.execute();
                                active.edit(ids);
                            }
                        }
                    } else if (cbq.data.endsWith(check_suffix)) {
                        const item = cbq.data.replace(check_suffix, "");
                        if (user.settings.filter.includes(item)) {
                            const checkCmd = this.commands.find("check");
                            if (checkCmd) {
                                const active = new Active({
                                    user,
                                    command: checkCmd,
                                    args: [item],
                                    chatID: ids.chatID,
                                })
                                active.execute();
                                active.edit(ids);
                            }
                        }
                    } else if (cbq.data.endsWith(type_remove_suffix)) {
                        const item = cbq.data.replace(type_remove_suffix, "");
                        if (user.settings.arbitration.includes(item)) {
                            const arbitrationCmd = this.commands.find("arbitrationFilter");
                            if (arbitrationCmd) {
                                const active = new Active({
                                    user,
                                    command: arbitrationCmd,
                                    args: [item],
                                    chatID: ids.chatID,
                                })
                                active.execute();
                                active.edit(ids);
                            }
                        }
                    } else if (cbq.data.endsWith(add_config_suffix)) {
                        const pos = cbq.data.replace(add_config_suffix, "").split(".");
                        if (pos[0] !== undefined && pos[1] !== undefined) {
                            const menuSelection = this.commands.find("configSelection");
                            if (menuSelection) {
                                const active = new Active({
                                    user,
                                    command: menuSelection,
                                    args: [pos[0], pos[1]],
                                    chatID: ids.chatID,
                                })
                                active.execute();
                                active.edit(ids);
                            }
                        }
                    } else if (cbq.data.endsWith(remove_config_suffix)) {
                        const config = cbq.data.replace(remove_config_suffix, "");
                        if (config) {
                            const menuSelection = this.commands.find("config");
                            if (menuSelection) {
                                const active = new Active({
                                    user,
                                    command: menuSelection,
                                    args: [config],
                                    chatID: ids.chatID,
                                })
                                active.execute();
                                active.edit(ids);
                            }
                        }
                    } else if (cbq.data.endsWith(select_config_suffix)) {
                        const selection = cbq.data.replace(select_config_suffix, "");
                        if (selection) {
                            const menuCmd = this.commands.find("config");
                            if (menuCmd) {
                                const active = new Active({
                                    user,
                                    command: menuCmd,
                                    args: [selection],
                                    chatID: ids.chatID,
                                })
                                active.execute();
                                active.edit(ids);
                            }
                        }
                    } else if (cbq.data.endsWith(song_suffix)) {
                        const song = cbq.data.replace(song_suffix, "");
                        if (song) {
                            const songCmd = this.commands.find("showSong");
                            if (songCmd) {
                                const active = new Active({
                                    user,
                                    command: songCmd,
                                    args: [song],
                                    chatID: ids.chatID,
                                })
                                active.execute();
                                active.edit(ids);
                            }
                        }
                    } else if (cbq.data.endsWith(remove_song_suffix)) {
                        const song = cbq.data.replace(remove_song_suffix, "");
                        if (song) {
                            const songsCmd = this.commands.find("songs");
                            if (songsCmd) {
                                const active = new Active({
                                    user,
                                    command: songsCmd,
                                    args: [song],
                                    chatID: ids.chatID,
                                })
                                active.execute();
                                active.edit(ids);
                            }
                        }
                    } else {
                        const parsedCmd = this.commands.parse(cbq.data);
                        if (parsedCmd) {
                            const { command, args } = parsedCmd
                            const active = new Active({
                                user,
                                command,
                                args,
                                chatID: ids.chatID,
                            })
                            active.execute();
                            active.edit(ids);
                        }
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
                                                    subCaption: "/" + cmd.id + " " + args.join(", "),
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
