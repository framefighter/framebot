import { InlineQueryResultArticle } from 'node-telegram-bot-api';
import { BOT } from '../..';
import { Message } from './message';
import { Keyboard } from '../keyboard/keyboard';
import { suffix, sep } from '../command/definitions';
import { Generator } from '../../utils/generator';
import { Active } from '../active/active';

export class Inline extends Message implements message.Inline {
    description?: string | undefined;
    thumb_url?: string | undefined;
    url?: string | undefined;
    item?: string;
    id?: string;

    constructor(inlineConstructor: Readonly<message.InlineConstructor>) {
        super(inlineConstructor);
        this.description = inlineConstructor.description;
        this.thumb_url = inlineConstructor.thumb_url;
        this.url = inlineConstructor.url;
        this.item = inlineConstructor.item;
    }

    toInline(active: Active): any {
        let keyboard = active.keyboard;

        if (this.item) {
            keyboard =
                new Keyboard({
                    layout: active.command.keyboard(active).layout,
                    add: [[
                        {
                            id: (this.item + suffix(sep).addItem as command.ID),
                            text: "Save"
                        }
                    ]]
                }).toInline(active)
        }
        this.id = Generator.ID();
        const res: InlineQueryResultArticle = {
            id: this.id,
            title: this.title,
            description: this.url
                ? undefined
                : this.description,
            type: "article",
            thumb_url: this.thumb_url,
            url: this.url,
            input_message_content: {
                message_text: this.text
                    || active.command.message(active).toString(active.user) || "No Text",
                parse_mode: BOT.defaults.parse_mode,
            },
            reply_markup: keyboard
        }
        return res;
    }
}