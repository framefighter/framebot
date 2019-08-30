import { Keyboard } from '../keyboard/keyboard';
import { Inline } from '../message/inline';
import { Message } from '../message/message';
import { BOT } from '../..';
import { check } from '../../utils/check';
import { Formatter } from '../../utils/formatter';
import { Active } from '../active/active';

export class Command implements command.Command {
    emoji: string;
    id: command.ID;
    alt: string[];
    help: string;
    adminOnly: boolean;
    jsonKey?: keyof wf.Ws;
    message: (active: Active) => Message;
    inline: (active: Active) => Inline[];
    keyboard: (active: Active) => keyboard.Board;
    answerCbText: (active: Active) => string;
    rewards: (active: Active) => message.Reward[];
    action: (active: Active) => any;
    name: (active: Active) => string;
    count: (active: Active) => number;


    constructor(id: command.ID, cmdConstructor: Readonly<command.Constructor>) {
        this.id = id;
        this.message = cmdConstructor.message
            || (() => new Message({ title: "No Message" }));
        this.inline = cmdConstructor.inline
            || (() => []);
        this.keyboard = cmdConstructor.keyboard
            || ((active) => {
                if (active.user.settings.menu.length > 0) {
                    return new Keyboard({
                        layout: active.user.settings.menu.map(row =>
                            row.map(config => ({ id: config })))
                    })
                }
                return new Keyboard({
                    layout: [[{ id: "sortie" }, { id: "nightwave" }],
                    [{ id: "arbitration" }, { id: "news" }],
                    [{ id: "events", text: "🗞️ Happenings" }, { id: "check" }],
                    [{ id: "cycles" }, { id: "trader" }],
                    [{ id: "all" }, { id: "search" }],
                    [{ id: "settings" }, { text: "🔎 Find", search: "find " },
                    ...(active.user.admin ? [{ text: "⏱️ Time", search: "time " }] : []),]],
                })
            });
        this.answerCbText = cmdConstructor.answerCbText
            || (() => `Loading ${this.id.replace(/_/g, " ").clean()}...`);
        this.rewards = cmdConstructor.rewards
            || (() => []);
        this.action = cmdConstructor.action
            || (() => null);
        this.emoji = cmdConstructor.emoji || "";
        this.jsonKey = cmdConstructor.jsonKey;
        this.adminOnly = cmdConstructor.adminOnly || false;
        this.help = cmdConstructor.help || "";
        this.alt = cmdConstructor.alt || [];
        this.count = cmdConstructor.count !== undefined
            ? cmdConstructor.count
            : (() => {
                if (this.jsonKey) {
                    const obj = BOT.ws[this.jsonKey]
                    if (obj && check.array(obj)) {
                        return obj.length || 0
                    }
                }
                return 0
            });
        this.name = cmdConstructor.name
            || (() => Formatter.camelToString(this.id))

    }
}

