import { InlineKeyboardButton, InlineKeyboardMarkup } from 'node-telegram-bot-api';
import { Compare } from '../../utils/compare';
import { BOT } from '../..';
import { Formatter } from '../../utils/formatter';
import { Active } from '../active/active';
import { Command } from '../command/command';

export class Keyboard implements keyboard.Board {
    layout: keyboard.Button[][];
    add?: keyboard.Button[][];

    constructor(keyboardConstructor?: Readonly<keyboard.Constructor>) {
        if (keyboardConstructor) {
            this.add = keyboardConstructor.add;
            this.layout = keyboardConstructor.layout.concat(this.add || []);
        } else {
            this.layout = [[]]
        }
    }

    buttonText(active: Active, cmd: Command): string {
        return cmd.emoji.space()
            + (Formatter.camelToString(cmd.name(active)))
            + (cmd.count(active) > 0 ? " [" + cmd.count(active) + "]" : "")
            + (cmd.adminOnly ? " [Admin]" : "")
    }

    toInline(active: Active): InlineKeyboardMarkup {
        let inlineLayout: InlineKeyboardButton[][] = [];
        for (let row of this.layout) {
            let inlineRow: InlineKeyboardButton[] = []
            for (let btn of row) {
                if (!btn) continue;
                const cmd = BOT.commands.find(btn.callback_data || "none");
                if (btn.callback_data && cmd && cmd.hidden && !btn.args) continue;
                const selected = Compare.exact(btn.callback_data, active.command.id);
                let name = Formatter.camelToString(btn.text) || "-";
                if (cmd && !btn.text) {
                    if (selected && !btn.alwaysShow) continue;
                    name = this.buttonText(active, cmd);
                }
                const text = name;
                let inlineBtn: InlineKeyboardButton;
                if (btn.callback_data) {
                    if (btn.args && btn.args.length > 0) {
                        const cbD = `/${btn.callback_data} ${btn.args.join(",")}`;
                        inlineBtn = {
                            text,
                            callback_data: cbD
                        }
                    } else {
                        inlineBtn = {
                            text,
                            callback_data: btn.callback_data
                        }
                    }

                } else if (btn.switch_inline_query_current_chat !== undefined) {
                    inlineBtn = {
                        text,
                        switch_inline_query_current_chat: btn.switch_inline_query_current_chat
                    }
                } else if (btn.url !== undefined) {
                    inlineBtn = {
                        text,
                        url: btn.url
                    }
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