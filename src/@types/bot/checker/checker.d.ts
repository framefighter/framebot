declare namespace checker {
    class Checker {
        constructor(bot: bot.Bot);
        check(ws: wf.Ws): void;
        checkCmd<T extends any>(command: command.ID, obj?: T | null): void;
        sendToUser(commandID: command.ID, newObjs: any[]): void;
    }
}