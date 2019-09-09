declare namespace checker {
    class StateCheck {
        constructor(api: any, interval?: number)
        check(ws: wf.Ws): void
        checkCmd<T extends any>(command: command.ID, obj?: T | null): void
        sendToUser(commandID: command.ID, newObjects: any[]): void
    }
}