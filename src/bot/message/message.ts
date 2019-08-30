import { check } from '../../utils/check';

export class Message implements message.Message {
    title: string;
    text?: string;
    showUser?: boolean;
    constructor(messageConstructor?: Readonly<message.Constructor | string>) {
        if (check.string(messageConstructor)) {
            this.title = "";
            this.text = messageConstructor;
        } else if (messageConstructor) {
            this.title = messageConstructor.title;
            this.text = messageConstructor.text;
            this.showUser = messageConstructor.showUser;
        } else {
            this.title = ""
        }
    }
    toString(user?: user.User): string {
        if (this.title) {
            return this.title.toUpperCase()
                .bold().concat(user && this.showUser
                    ? " from @" + (user.username || user.first_name).clean()
                    : "")
                .nl().nl()
                + (this.text || "").concat("⠀");
        }
        return ""
    }

}

