declare namespace message {
    interface Constructor {
        title: string;
        text?: string;
        showUser?: boolean;
    }

    interface InlineConstructor extends Constructor {
        description?: string;
        thumb_url?: string;
        url?: string;
        item?: string;
    }

    class Message implements Constructor {
        title: string;
        text?: string | undefined;
        showUser?: boolean | undefined;
        keyboard?: keyboard.Board;
        toString(user?: user.User): string;
    }

    class Inline extends Message implements InlineConstructor {
        description?: string | undefined;
        thumb_url?: string | undefined;
        url?: string | undefined;
        item?: string | undefined;
        title: string;
        text?: string | undefined;
        showUser?: boolean | undefined;
        toInline(active: active.Active): any;
    }

    interface Reward {
        text: string;
        rewards: string[]
        id: string | number;
    }
}