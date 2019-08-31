import WorldState from "warframe-worldstate-parser"
import { Check } from '../../utils/check';
import idx from 'idx';

export class Parser {
    static state(state: any): wf.Ws {
        const parsed = new WorldState(JSON.stringify(state), {
            kuvaCache: { getData: (() => new Promise(() => { })) },
            locale: 'en',
        });
        return parsed
    }

    static parse(jsonStr: any): any {
        try {
            if (Check.string(jsonStr)) {
                return JSON.parse(this.cleanJSON(jsonStr)) || {};
            } else {
                return jsonStr || {};
            }
        } catch (error) {
            return {}
        }
    }

    static groupDrops(drops?: wf.drops.Drop[]): wf.drops.GroupedDrop[] {
        return (drops || [])
            .sort((a, b) => parseFloat(b.chance.toString()) - parseFloat(a.chance.toString()))
            .reduce((arr: wf.drops.GroupedDrop[], drop) => {
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
                    });
                } else {
                    arr[ind].group.push(dropInfo)
                }

                return arr;
            }, [])
    }

    static groupPlaces(drops?: wf.drops.Drop[]): wf.drops.GroupedPlace[] {
        return (drops || [])
            .sort((a, b) => parseFloat(b.chance.toString()) - parseFloat(a.chance.toString()))
            .reduce((arr: wf.drops.GroupedPlace[], drop) => {
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
                    });
                } else {
                    arr[ind].group.push(dropInfo)
                }

                return arr;
            }, [])
    }

    static cleanJSON(json: string): string {
        return json.replace(/[\r\n]/g, "");
    }

    static parseExtra(data: wf.extra.RawKuva[]) {
        const parsed: wf.ParsedExtra = {
            kuva: [],
            arbitration: {},
        };
        const now = new Date();
        data.forEach((mission) => {
            const p = {
                activation: new Date(mission.start || ""),
                expiry: new Date(mission.end || ""),
                solnode: mission.solnode,
                node: idx(mission, _ => `${_.solnodedata.tile} (${_.solnodedata.planet})`) || "",
                ...mission.solnodedata,
            };
            p.activation.setMinutes(p.activation.getMinutes() + 5.1);
            if (p.activation < now && now < p.expiry) {
                if (mission.missiontype === 'EliteAlertMission') {
                    parsed.arbitration = {
                        ...p,
                        activation: mission.start,
                        expiry: mission.end
                    };
                }
                if (idx(mission, _ => _.missiontype.startsWith('KuvaMission'))) {
                    parsed.kuva.push({
                        ...p,
                        activation: mission.start,
                        expiry: mission.end
                    });
                }
            }
        });
        return parsed;
    }
}