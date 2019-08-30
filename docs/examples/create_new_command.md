# HOW TO CREATE A NEW COMMAND

## 0. (Optional) create new file for a new type
 Create new typescript file in:
 `./bot/command/definitions/<type>.ts`

## 1. Add new ID to cmd.IDs type

In `src/@types/bot/cmd.d.ts` add a new line to `IDs`
```ts
declare namespace cmd {
    type IDs = "sortie" | ... | "<newID>"
   [...]
```

## 2. create new command in list

One of:
 `./bot/command/definitions/*.ts`

```ts
 {
        id: "<ID>",
        alt: ["alternative", "triggers"],
        help: "Shown as help text",
        name: () => "ℹ️", // Shown in title and keyboard buttons
        message: (active) => new Message({
            title: active.command.name(active), // Title of message (defaults to the command name)
            text: "Text that will be displayed in message"
        }),
        keyboard: (active) => new Keyboard({
            layout: [[{ id: "<ID of another command this button will link to>" ]]
        }),
        inline: (active) => [new Inline({ title: "Title of the inline element" })]
    },
```

### properties

```ts
        id: IDs;
        alt?: string[];
        help?: string;
        adminOnly?: boolean;
        jsonKey?: keyof wf.Ws;
        answerCbText?: (active: active.Active) => string | string;
        message?: (active: active.Active) => msg.Message;
        inline?: (active: active.Active) => msg.Inline[];
        keyboard?: (active: active.Active) => key.Board;
        rewards?: (active: active.Active) => msg.Reward[];
        action?: (active: active.Active) => any;
        name?: (active: active.Active) => string;
```
