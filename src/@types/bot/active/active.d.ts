
declare namespace active {
    interface Constructor {
        command: command.Command
        args: string[]
        user?: user.User
    }

    class Active {
        constructor(c: Constructor)
        user: user.User
        command: command.Command
        ws: wf.Ws
        execute_return?: any
        matches?: command.Command[]
        args: string[]
        keyboard: any
        alreadySend?: any
        message: string
        inline(offset: number): any[]
        executed: boolean
        execute(): void
    }

    interface IDs {
        CbqID?: string
        chatID?: string | number
        msgID?: number
        inlineMsgID?: string
    }

}