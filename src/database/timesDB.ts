import { Check } from '../utils/check'
import { DB } from './db'

export class TimesDB extends DB<time.Record[]> implements db.TimesDB {
    constructor(path: string) {
        super(path, "times")
    }

    add(time: time.Record) {
        this.db.push(`/${this.key}[]`, time)
    }

    get list(): time.Record[] {
        try {
            return this.data
        } catch (err) {
            return []
        }
    }

    generateID(mission?: string, boss?: string): string {
        if (Check.assassination(mission || "") && boss) {
            return boss.toUpperCase()
        }
        return (mission || "").toUpperCase()
    }

    missionInSeconds(mission?: string, boss?: string): number {
        const found = this.avg()[this.generateID(mission, boss)]
        return found ? found.seconds : 0
    }

    avg(): time.Avg {
        let allTimes: time.Avg = {}
        this.list.forEach(time => {
            const id = this.generateID(time.mission, time.boss)
            const found = allTimes[id]
            const newTime = time.seconds + time.minutes * 60
            if (found) {
                found.seconds += newTime
                found.count++
                if (time.stage) {
                    found.stage += time.stage
                }
                if (found.max < newTime) {
                    found.max = newTime
                }
                if (found.min > newTime) {
                    found.min = newTime
                }
            } else {
                allTimes[id] = {
                    mission: id.capitalize(),
                    count: 1,
                    max: newTime,
                    min: newTime,
                    seconds: newTime,
                    stage: time.stage || 0
                }
            }
        })
        Object.keys(allTimes).forEach(key => {
            allTimes[key].seconds /= allTimes[key].count
            allTimes[key].stage /= allTimes[key].count
        })
        return allTimes
    }
}