declare namespace bot {
    class Bot {
        constructor()
        users: { [key: number]: user.User }
    }

    interface Defaults {
        parse_mode: "HTML" | "Markdown",
        user: {
            settings: user.Settings
        },
        keyboard: (active: active.Active) => keyboard.Board
    }

}