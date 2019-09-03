declare namespace command {
    interface Constructor {
        alt?: string[];
        help?: string;
        emoji?: string;
        hidden?: boolean;
        adminOnly?: boolean;
        jsonKey?: keyof wf.Ws;
        message?: ((active: active.Active) => message.Message) | ID;
        keyboard?: ((active: active.Active) => keyboard.Board) | ID;
        inline?: (active: active.Active) => message.Inline[];
        rewards?: (active: active.Active) => message.Reward[];
        action?: (active: active.Active) => any;
        name?: (active: active.Active) => string;
        count?: (active: active.Active) => number;

    }

    type Definitions = {
        [id in command.ID]: Constructor;
    };

    type SettingsDefinitions = {
        [id: string]: Constructor;
    };

    class Command {
        constructor(c: Constructor);
        id: ID;
        alt: string[];
        help: string;
        emoji: string;
        hidden: boolean;
        adminOnly: boolean;
        jsonKey?: keyof wf.Ws;
        message: (active: active.Active) => message.Message;
        inline: (active: active.Active) => message.Inline[];
        keyboard: (active: active.Active) => keyboard.Board;
        rewards: (active: active.Active) => message.Reward[];
        action: (active: active.Active) => any;
        name: (active: active.Active) => string;
        count: (active: active.Active) => number;
        privileged(user: user.From): boolean;
    }

    class Commands {
        constructor();
        list: Command[];
        ids: ID[];
        triggers: string[];
        find(cmdID: command.ID): Command | undefined;
        find(cmd: string, match: true): Command[];
        parse(raw: string | undefined, match?: boolean): utils.Command | undefined;
        fromID(id: ID): Command;
    }
}