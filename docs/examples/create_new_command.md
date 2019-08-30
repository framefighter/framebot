# Creating a new Telegram command:

1. Start by adding the **ID** to the `ID` type in [commands.d.ts](https://github.com/framefighter/framebot/blob/master/src/%40types/commands.d.ts)
1. Add the `definition` of your command to the definitions variable in [definitions.ts](https://github.com/framefighter/framebot/blob/master/src/bot/command/definitions.ts)
1. Possible **properties** of a single definition:
```typescript 
    interface Constructor {
        alt?: string[];
        help?: string;
        emoji?: string;
        adminOnly?: boolean;
        jsonKey?: keyof wf.Ws;
        answerCbText?: (active: active.Active) => string | string;
        message?: (active: active.Active) => message.Message;
        inline?: (active: active.Active) => message.Inline[];
        keyboard?: (active: active.Active) => keyboard.Board;
        rewards?: (active: active.Active) => message.Reward[];
        action?: (active: active.Active) => any;
        name?: (active: active.Active) => string;
        count?: (active: active.Active) => number;
    }
```


