
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
        callback_data?: command.ID;
        text?: string;
        switch_inline_query_current_chat?: string;
        url?: string;
        alwaysShow?: boolean;
        args?: (string | number)[];
    }

}