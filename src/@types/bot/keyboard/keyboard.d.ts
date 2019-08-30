
declare namespace keyboard {
    interface Constructor {
        layout: Button[][];
        add?: Button[][];
    }

    class Board implements Constructor  {
        layout: Button[][];
        add?: Button[][];
        toInline(active: active.Active): any;
    }

    interface Button {
        id?: command.ID;
        text?: string;
        search?: string;
        url?: string;
    }

}