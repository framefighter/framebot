import { Check } from '../../utils/check'
import { Active } from '../active/active'

export class Message implements message.Message {
    title: string
    text: string
    showUser?: boolean
    constructor(messageConstructor: Readonly<message.Constructor | string>, active?: Active) {
        if (Check.string(messageConstructor)) {
            this.title = ""
            this.text = messageConstructor
        } else {
            this.title = messageConstructor.title || ""
            this.text = messageConstructor.text
            this.showUser = messageConstructor.showUser
        }
        if (active) {
            this.title = active.command.buttonText(active)
        }
    }
    toString(user?: user.User): string {
        if (this.title) {
            let msg = (this.title.toUpperCase()
                .bold().concat(user && this.showUser
                    ? " from @" + (user.username || user.from.first_name).clean()
                    : "")
                .nl().nl()
                + (this.text || "").concat("⠀"))
            if (msg.length > 4096) {
                const subS = msg.substr(0, 4090)
                const rMsg = subS.split("").reverse().join("")
                for (let c of rMsg) {
                    const mc = ["*", "`", "_"]
                    const fo = mc.indexOf(c)
                    if (fo !== -1) {
                        const mcCount = (subS.split(mc[fo]).length - 1)
                        if (mcCount % 2 !== 0) {
                            msg = subS + mc[fo] + "..."
                        } else {
                            msg = subS + "..."
                        }
                        break
                    }
                }
            }
            return msg
        } 
        return this.text || ""
    }

}

