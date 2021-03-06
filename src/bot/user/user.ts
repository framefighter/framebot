import { DEFAULTS } from '../static'

export class User implements user.User {
    from: user.From
    id: number
    admin: boolean
    _settings: user.Settings
    username?: string

    constructor(from: user.From) {
        this.from = from
        this.id = this.from.id
        this.username = this.from.username
        this.admin = this.from.admin
        this._settings = this.from.settings
    }

    get settings(): user.Settings {
        return this._settings
    }

    set settings(settings: user.Settings) {
        this.from.settings = settings
        this._settings = settings
    }
}

export const noUser = new User({
    first_name: "Dummy",
    last_name: "User",
    id: -1,
    is_bot: true,
    language_code: "none",
    admin: false,
    settings: DEFAULTS.user.settings,
})
