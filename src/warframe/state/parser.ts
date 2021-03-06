import WorldState from "warframe-worldstate-parser"
import { Check } from '../../utils/check'

export class Parser {
    static state(state: any): wf.Ws {
        const parsed = new WorldState(JSON.stringify(state), {
            kuvaCache: { getData: (() => new Promise(() => { })) },
            locale: 'en',
        })
        return parsed
    }

    static parse<T>(jsonStr: any): T {
        try {
            if (Check.string(jsonStr)) {
                return JSON.parse(this.cleanJSON(jsonStr)) || {}
            } else {
                return jsonStr || {}
            }
        } catch (error) {
            return {} as T
        }
    }

    static groupDrops(drops?: wf.searchable.Drop[]): wf.searchable.GroupedDrop[] {
        return (drops || [])
            .sort((a, b) => parseFloat(b.chance.toString()) - parseFloat(a.chance.toString()))
            .reduce((arr: wf.searchable.GroupedDrop[], drop) => {
                const ind = arr.findIndex(drop2 => drop2.item === drop.item)
                const dropInfo = {
                    chance: drop.chance,
                    place: drop.place.striptags(),
                    rarity: drop.rarity
                }
                if (ind === -1) {
                    arr.push({
                        item: drop.item,
                        group: [dropInfo]
                    })
                } else {
                    arr[ind].group.push(dropInfo)
                }

                return arr
            }, [])
    }

    static groupPlaces(drops?: wf.searchable.Drop[]): wf.searchable.GroupedPlace[] {
        return (drops || [])
            .sort((a, b) => parseFloat(b.chance.toString()) - parseFloat(a.chance.toString()))
            .reduce((arr: wf.searchable.GroupedPlace[], drop) => {
                const ind = arr.findIndex(drop2 => drop2.place === drop.place)
                const dropInfo = {
                    chance: drop.chance,
                    item: drop.item,
                    rarity: drop.rarity
                }
                if (ind === -1) {
                    arr.push({
                        place: drop.place.striptags(),
                        group: [dropInfo]
                    })
                } else {
                    arr[ind].group.push(dropInfo)
                }

                return arr
            }, [])
    }

    static cleanJSON(json: string): string {
        return json.replace(/[\r\n]/g, "")
    }

    static parseExtra(data: wf.extra.RawKuva[]) {
        const parsed: wf.ParsedExtra = {
            kuva: [],
            arbitration: {},
        }
        const now = new Date()
        data.forEach(mission => {
            const p = {
                activation: new Date(mission.start || ""),
                expiry: new Date(mission.end || ""),
                solnode: mission.solnode,
                node: `${mission?.solnodedata?.tile} (${mission?.solnodedata?.planet})`,
                ...mission.solnodedata,
            }
            p.activation.setMinutes(p.activation.getMinutes() + 5.1)
            if (p.activation < now && now < p.expiry) {
                if (mission.missiontype === 'EliteAlertMission') {
                    parsed.arbitration = {
                        ...p,
                        activation: mission.start,
                        expiry: mission.end,
                        id: mission.missiontype + mission.start
                    } as wf.Arbitration
                }
                if (mission.missiontype && mission.missiontype.startsWith('KuvaMission')) {
                    parsed.kuva.push({
                        ...p,
                        activation: mission.start,
                        expiry: mission.end,
                        id: mission.missiontype + mission.start
                    } as wf.Arbitration)
                }
            }
        })
        return parsed
    }
}