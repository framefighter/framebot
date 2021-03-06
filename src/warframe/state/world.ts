import { Parser } from './parser'
import { EventEmitter } from 'events'
import axios from "axios"
import { Check } from '../../utils/check'
import { DB } from '../../bot/static'

export class World implements wf.World {
    ws: wf.Ws
    constructor(frequency?: number) {
        this.ws = {}
        this.update()
        setInterval(() => this.update(), frequency || 10000)
    }

    filteredByID<T>(ids: string[], jsonKey?: keyof wf.Ws): T[] {
        if (this.ws && jsonKey) {
            const el = this.ws[jsonKey] || []
            if (Check.array(el)) {
                return el.filter(fissure => ids.length > 0
                    ? ids.includes(fissure.id
                        || DB.notifications.generateID(fissure))
                    : true)
            }
        }
        return []
    }

    async update() {
        axios('http://content.warframe.com/dynamic/worldState.php')
            .then((res) => {
                const parsed = Parser.state(res.data)
                this.ws =  {...this.ws, ...parsed}
            }).catch(err => console.error(err))

        axios('https://10o.io/kuvalog.json')
            .then((res) => {
                const parsed = Parser.parseExtra(res.data)
                this.ws = {...this.ws, ...parsed}
            }).catch(err => console.error(err))
    }
}
