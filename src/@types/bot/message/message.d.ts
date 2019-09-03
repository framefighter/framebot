declare namespace message {
    interface Constructor {
        title: string;
        text?: string;
        showUser?: boolean;
        keyboard?: keyboard.Board;
    }

    interface InlineConstructor extends Constructor {
        title: string;
        description?: string | undefined;
        thumb_url?: string | undefined;
        url?: string | undefined;
        item?: string | undefined;
        text?: string;
    }

    class Message implements Constructor {
        title: string;
        text?: string | undefined;
        showUser?: boolean | undefined;
        keyboard?: keyboard.Board;
        toString(user?: user.User): string;
    }

    class Inline implements InlineConstructor {
        title: string;
        showUser?: boolean;
        keyboard?: keyboard.Board;
        description?: string;
        thumb_url?: string;
        url?: string;
        item?: string;
        text?: string;
        id: string;
        toInline(active: active.Active): any;
        toKeyboard(active: active.Active): any;
    }

    interface Reward {
        text: string;
        rewards: string[]
        id: string | number;
    }
}