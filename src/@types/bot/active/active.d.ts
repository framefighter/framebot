
declare namespace active {
    interface Constructor {
        command: command.Command
        args: string[]
        user: user.User
        chatID: number | string
    }

    class Active {
        constructor(c: Constructor)
        user: user.User
        command: command.Command
        ws: wf.Ws
        chatID: number | string
        execute_return?: any
        matches?: command.Command[]
        args: string[]
        keyboard: any
        alreadySend?: any
        message: string
        inline: any[]
        executed: boolean
        send(msg?: string): void
        edit(IDs: active.IDs, msg?: string): void
        execute(): void
        results(iq: any): void
        updateText(): void
    }

    interface IDs {
        CbqID?: string
        chatID?: string | number
        msgID?: number
        inlineMsgID?: string
    }

}