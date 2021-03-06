
declare namespace keyboard {
    interface Constructor {
        layout: Button[][]
        add?: Button[][]
    }

    class Board implements Constructor {
        layout: Button[][]
        add?: Button[][]
        toInline(active?: active.Active): any
    }

    class Button {
        callback_data?: command.ID
        text?: string
        switch_inline_query_current_chat?: string
        url?: string
        alwaysShow?: boolean
        args?: (string | number)[]
    }

}