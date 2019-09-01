
declare namespace keyboard {
    interface Constructor {
        layout: Button[][];
        add?: Button[][];
    }

    class Board implements Constructor {
        layout: Button[][];
        add?: Button[][];
        buttonText(active: active.Active, cmd: command.Command): string
        toInline(active: active.Active): any;
    }

    interface Button {
        id?: command.ID;
        text?: string;
        search?: string;
        url?: string;
        args?: string[]
    }

}