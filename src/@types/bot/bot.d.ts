declare namespace bot {
    interface Constructor {
        commands: command.Commands
    }

    class Bot implements Constructor {
        constructor(c: Constructor)
        token: string
        api: any
        commands: command.Commands
        ws: wf.Ws
        state: any
        extra: any
        database: db.Base
        info: wf.Searchable
        defaults: Defaults
        checker: checker.StateCheck
        users: { [key: number]: user.User }
    }

    interface Defaults {
        parse_mode: "HTML" | "Markdown"
    }

}