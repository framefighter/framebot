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
            let msg = (this.title.toUpperCase()
                .bold().concat(user && this.showUser
                    ? " from @" + (user.username || user.first_name).clean()
                    : "")
                .nl().nl()
                + (this.text || "").concat("⠀"))
            if (msg.length > 4096) {
                const subS = msg.substr(0, 4090);
                const rMsg = subS.split("").reverse().join("");
                for (let c of rMsg) {
                    const mc = ["*", "(", "[", "`", "_"]
                    const fo = mc.indexOf(c);
                    if (fo !== -1) {
                        const mcCount = (subS.split(mc[fo]).length - 1);
                        if (mcCount % 2 !== 0) {
                            msg = subS + mc[fo] + "...";
                        } else {
                            msg = subS + "...";
                        }
                        break;
                    }
                }
            }
            return msg;
        }
        return ""
    }

}

