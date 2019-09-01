import { InlineQueryResultArticle, InlineKeyboardMarkup } from 'node-telegram-bot-api';
import { BOT } from '../..';
import { Message } from './message';
import { Keyboard } from '../keyboard/keyboard';
import { suffix, sep } from '../command/definitions';
import { Generator } from '../../utils/generator';
import { Active } from '../active/active';

export class Inline implements message.Inline {
    title: string;
    showUser?: boolean;
    description?: string;
    thumb_url?: string;
    url?: string;
    item?: string;
    text?: string;
    id: string;

    constructor(inlineConstructor: Readonly<message.InlineConstructor>) {
        this.title = inlineConstructor.title;
        this.text = inlineConstructor.text;
        this.description = inlineConstructor.description;
        this.thumb_url = inlineConstructor.thumb_url;
        this.url = inlineConstructor.url;
        this.item = inlineConstructor.item;
        this.id = Generator.ID();
    }

    keyboard(active: Active): any {
        if (this.item) {
            return new Keyboard({
                layout: active.command.keyboard(active).layout,
                add: [[{ id: (this.item + suffix(sep).addItem as command.ID), text: "Save" }]]
            }).toInline(active)
        }
        return active.keyboard
    }

    toInline(active: Active): any {
        const res: InlineQueryResultArticle = {
            id: this.id,
            title: this.title,
            description: this.description,
            type: "article",
            thumb_url: this.thumb_url,
            url: this.url,
            input_message_content: {
                message_text: this.text
                    || (active.command.message
                        ? active.command.message(active).toString(active.user)
                        : undefined)
                    || "No Text",
                parse_mode: BOT.defaults.parse_mode,
            },
            reply_markup: this.keyboard(active)
        }
        return res;
    }
}