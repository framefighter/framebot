import { Commands } from './command/commands'
import { Database } from '../database/database'
import { World } from '../warframe/state/world'
import { Searchable } from '../warframe/state/searchable'
import { Keyboard } from './keyboard/keyboard'
import { btn } from './command/definitions'

export const COMMANDS = new Commands()
export const DB = new Database("./data")
export const STATE = new World(60000)
export const INFO = new Searchable(602000)
export const DEFAULTS: bot.Defaults = {
    parse_mode: "HTML",
    user: {
        settings: {
            alert: {},
            filter: [],
            menu: [],
            arbitration: [],
            convertedSong: "",
            last: []
        }
    },
    keyboard: ((active) => {
        if (active.user.settings.menu.length > 0) {
            return new Keyboard({
                layout: active.user.settings.menu.map(row =>
                    row.map(config => ({ callback_data: config })))
            })
        }
        return new Keyboard({
            layout: [[btn("sortie"), btn("nightwave")],
            [btn("arbitration"),btn("news")],
            [btn("events"),btn("check")],
            [btn("cycles"), btn("trader")],
            [btn("all"), btn("search")],
            [btn("settings"), { text: "🔎 Find", switch_inline_query_current_chat: "find " },
            ...(active.user.admin ? [{ text: "⏱️ Time", switch_inline_query_current_chat: "time " }] : []),]],
        })
    })
}