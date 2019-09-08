declare namespace bot {
    class Bot {
        constructor()
        users: { [key: number]: user.User }
    }

    interface Defaults {
        parse_mode: "HTML" | "Markdown"
    }

}