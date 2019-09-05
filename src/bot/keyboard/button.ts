import { Check } from '../../utils/check'

export class Button implements keyboard.Button {
    callback_data?: command.ID
    text?: string
    switch_inline_query_current_chat?: string
    url?: string
    alwaysShow?: boolean
    args?: (string | number)[]
    constructor(c: (keyboard.Button | command.ID | undefined)) {
        if (c === undefined) {
            this.callback_data = "none"
        } else if (Check.id(c)) {
            this.callback_data = c
        } else {
            this.callback_data = c.callback_data
            this.text = c.text
            this.switch_inline_query_current_chat = c.switch_inline_query_current_chat
            this.url = c.url
            this.alwaysShow = c.alwaysShow
            this.args = c.args
        }
    }
}