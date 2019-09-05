declare namespace utils {
    interface Config {
        token: string
        password: string
    }
    class Command {
        command: command.Command
        matches?: command.Command[]
        args: string[]
    }

    interface Time {
        min: number
        sec: number
    }

    interface Format {
        position: number | string
        caption: string
        addCaption: string
        subCaption: string
        description: string
        standing: number | string
        list: (string | undefined)[]
        chance: number | string
        time: string | number
        faction: string
        boss: string
        start: string | number
        end: string | number
        link: { url?: string, text?: string }
        text: string
    }
    class Check {
        static string(any: any): any is string
        static array(any: any): any is Array<any>
        static assassination(mission?: string): boolean
        static rewards(rewards: message.Reward[], items: string[]): message.Reward[]
    }

    class Compare {
        static loose(a: any, b: any): boolean
        static exact(a: any, b: any): boolean
        static compare(a: any, b: any, comparator: (a: string, b: string) => boolean): boolean
        static includes(a: string, b: string): boolean
    }

    class Formatter {
        static MAX_WIDTH: number
        static IDEAL_WIDTH: number
        static nightwave(challenge?: wf.ActiveChallenge): string
        static nightwaveType(challenge?: wf.ActiveChallenge): string
        static sortie(sortie?: wf.Sortie): string
        static sortieLevel(stage?: number): string
        static fissure(fissure?: wf.Fissure): string
        static invasion(invasion?: wf.Invasion): string
        static invasionRewards(invasion?: wf.Invasion): string[]
        static event(event?: wf.Event): string
        static arbitration(arbitration?: wf.extra.Arbitration): string
        static newsEvent(newsEvent?: wf.News): string
        static alert(alert?: wf.Alert): string
        static timesString(args?: string[]): string
        static sortieTime(average: time.AvgTime): string
        static trader(trader?: wf.VoidTrader): string
        static weapon(weapon?: wf.searchable.ExportWeaponsEntity): string
        static dmgTypes(dmgTypes: number[]): string[]
        static camelToString(str?: string): string
        static warframe(warframe?: wf.searchable.ExportWarframesEntity): string
        static sentinel(sentinel?: wf.searchable.ExportSentinelsEntity): string
        static mod(mod?: wf.searchable.ExportUpgradesEntity): string
        static polarity(polarityID: string): string
        static price(price?: wf.searchable.Price): string
        static drop(drop?: wf.searchable.GroupedDrop): string
        static dropInfo(dropInfo?: wf.searchable.DropInfo): string
        static place(place?: wf.searchable.GroupedPlace): string
        static placeInfo(placeInfo?: wf.searchable.PlaceInfo): string
        static warframeTitle(warframe: wf.searchable.ExportWarframesEntity): string
        static sentinelTitle(sentinel: wf.searchable.ExportSentinelsEntity): string
        static weaponTitle(weapon: wf.searchable.ExportWeaponsEntity): string
        static modTitle(mod: wf.searchable.ExportUpgradesEntity): string
        static priceTitle(price: wf.searchable.Price): string
        static dropTitle(drop: wf.searchable.GroupedDrop): string
        static placeTitle(drop: wf.searchable.GroupedPlace): string
        static format(format: Partial<utils.Format>): string
        static link(link?: string): string
        static clock(seconds?: number): string
        static position(position?: string | number): string
        static caption(caption?: string): string
        static subCaption(subCaption?: string): string
        static description(description?: string): string
        static standing(standing?: string | number): string
        static chance(chance?: string | number): string
        static faction(faction?: string): string
        static boss(boss?: string): string
        static time(time?: string | number): string
        static end(end?: string | number): string
        static start(start?: string | number): string
        static list(rs?: (string | undefined)[]): string
        static cut(str?: string): string[]
    }

    class Generator {
        static ID(): string
    }

    class Parse {
        static time(raw: string): utils.Time
        static thumbUrl(uniqueName: string): string | undefined
    }
}