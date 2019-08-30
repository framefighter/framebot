import { InlineKeyboardButton, InlineKeyboardMarkup } from 'node-telegram-bot-api';
import { compare } from '../../utils/compare';
import { BOT } from '../..';
import { Formatter } from '../../utils/formatter';
import { Active } from '../active/active';

export class Keyboard implements keyboard.Board {
    layout: keyboard.Button[][];
    add?: keyboard.Button[][];

    constructor(keyboardConstructor: Readonly<keyboard.Constructor>) {
        this.add = keyboardConstructor.add;
        this.layout = keyboardConstructor.layout.concat(this.add || []);

    }

    toInline(active: Active): InlineKeyboardMarkup {
        let inlineLayout: InlineKeyboardButton[][] = [];
        for (let row of this.layout) {
            let inlineRow: InlineKeyboardButton[] = []
            for (let btn of row) {
                if (!btn) continue;
                const cmd = BOT.commands.find(btn.id || "none");
                if (btn.id && cmd && cmd.id === "none") continue;
                const selected = compare.exact(btn.id, active.command.id);
                let name = Formatter.camelToString(btn.text) || "-";
                if (cmd && !btn.text) {
                    if (selected) continue;
                    name = cmd.emoji.space()
                        + (Formatter.camelToString(cmd.name(active)))
                        + (cmd.count(active) > 0 ? " [" + cmd.count(active) + "]" : "")
                        + (cmd.adminOnly ? " [Admin]" : "")
                }
                const text = name;
                let inlineBtn: InlineKeyboardButton;
                if (btn.id) {
                    inlineBtn = { text, callback_data: btn.id }
                } else if (btn.search !== undefined) {
                    inlineBtn = { text, switch_inline_query_current_chat: btn.search }
                } else if (btn.url !== undefined) {
                    inlineBtn = { text, url: btn.url }
                } else {
                    continue;
                }
                inlineRow.push(inlineBtn);
            }
            inlineLayout.push(inlineRow);
        }
        return { inline_keyboard: inlineLayout }
    }

}