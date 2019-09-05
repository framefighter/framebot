import { Parser } from './parser'
import { EventEmitter } from 'events'
import axios from "axios"

export class Extra extends EventEmitter implements wf.Extra {
    arbitration?: wf.extra.Arbitration
    kuva?: wf.extra.Arbitration[]
    constructor(frequency?: number) {
        super()
        this.update()
        setInterval(() => this.update(), frequency || 10000)
    }

    async update() {
        axios("https://10o.io/kuvalog.json")
            .then((res) => {
                const parsed = Parser.parseExtra(res.data)
                if (parsed.arbitration && parsed.kuva) {
                    this.arbitration = parsed.arbitration
                    this.kuva = parsed.kuva
                    this.emit("extra", parsed)
                }
            })
    }
}