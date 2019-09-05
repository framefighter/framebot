import { InlineQueryResultArticle, InlineKeyboardMarkup } from 'node-telegram-bot-api'
import { BOT } from '../..'
import { Message } from './message'
import { Keyboard } from '../keyboard/keyboard'
import { Generator } from '../../utils/generator'
import { Active } from '../active/active'

export class Inline implements message.Inline {
    title: string
    showUser?: boolean
    description?: string
    thumb_url?: string
    keyboard?: keyboard.Board
    url?: string
    item?: string
    text?: string
    id: string

    constructor(inlineConstructor: Readonly<message.InlineConstructor>) {
        this.title = inlineConstructor.title
        this.text = inlineConstructor.text
        this.description = inlineConstructor.description
        this.thumb_url = inlineConstructor.thumb_url
        this.url = inlineConstructor.url
        this.keyboard = inlineConstructor.keyboard
        this.item = inlineConstructor.item
        this.id = Generator.ID()
    }

    toKeyboard(active: Active): InlineKeyboardMarkup {
        if (this.item) {
            return new Keyboard({
                layout: active.command.keyboard(active).layout,
                add: [[{
                    callback_data: "filter",
                    args: [this.item],
                    text: "Save"
                } as keyboard.Button]]
            }).toInline(active)
        }
        if (this.keyboard) {
            return this.keyboard.toInline(active)
        }
        return active.keyboard
    }

    toInline(active?: Active): InlineQueryResultArticle {
        let msg = this.text;
        if (!msg && active && active.command.message) {
            msg = active.command.message(active).toString(active.user)
        }
        const res: InlineQueryResultArticle = {
            id: this.id,
            title: this.title,
            description: this.description,
            type: "article",
            thumb_url: this.thumb_url,
            url: this.url,
            input_message_content: {
                message_text: msg || "No Text",
                parse_mode: BOT.defaults.parse_mode,
            },
            reply_markup: active ? this.toKeyboard(active) : undefined
        }
        return res
    }
}