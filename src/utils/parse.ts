import { BOT } from '..'
import { Compare } from './compare'

export class Parse implements utils.Parse {
    static time(raw: string): utils.Time {
        let min = 0
        let sec = 0
        if (raw) {
            const timeRx = new RegExp("^([0-9]+)[:\.,]([0-5]?[0-9])$").exec(raw)
            if (timeRx) {
                min = parseInt(timeRx[1])
                sec = parseInt(timeRx[2])
            }
            if (isNaN(min) || isNaN(sec)) min = sec = 0
        } return { min: min, sec: sec }
    }

    static thumbUrl(uniqueName: string): string | undefined {
        const manifest = BOT.info.manifest
        if (manifest && manifest.Manifest) {
            const entry = manifest.Manifest.find((entry: wf.searchable.ManifestEntity) =>
                entry.uniqueName === uniqueName)
            if (entry) {
                return BOT.info.baseUrl + entry.textureLocation.replace(/\\/g, "/")
            }
        }
    }

    static sortieReward(raw: string): string {
        const rewards = (BOT.info.places || [])
            .find(drop => drop.place.toUpperCase().includes("SORTIES"))
        if (rewards) {
            const closest = rewards.group.find((a) => Compare.loose(a.item, raw))
            if (closest) {
                return closest.item
            }
        } return ""
    }
}