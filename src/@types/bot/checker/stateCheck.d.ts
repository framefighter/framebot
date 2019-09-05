declare namespace checker {
    class StateCheck {
        constructor(bot: bot.Bot)
        check(ws: wf.Ws): void
        checkCmd<T extends any>(command: command.ID, obj?: T | null): void
        sendToUser(commandID: command.ID, newObjects: any[]): void
    }
}