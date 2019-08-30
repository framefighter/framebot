
import TelegramBot from "node-telegram-bot-api";

export class User implements user.User, TelegramBot.User {
    id: number;
    admin: boolean;
    is_bot: boolean;
    first_name: string;
    last_name?: string | undefined;
    username?: string | undefined;
    language_code?: string | undefined;
    settings: user.Settings;
    constructor(userConstructor: Readonly<user.Constructor & TelegramBot.User>) {
        this.id = userConstructor.id;
        this.admin = userConstructor.admin;
        this.is_bot = userConstructor.is_bot;
        this.first_name = userConstructor.first_name;
        this.last_name = userConstructor.last_name;
        this.username = userConstructor.username;
        this.language_code = userConstructor.language_code;
        this.settings = {
            alert: {},
            filter: [],
            menu: [[]],
            arbitration: []
        };
    }
}

export const noUser = new User({
    admin: false,
    first_name: "Dummy",
    last_name: "User",
    id: -1,
    is_bot: true,
    language_code: "none",
});
