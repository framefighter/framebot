import { Compare } from './compare'
import { definitions } from '../bot/command/definitions'

export class Check implements utils.Check {
    static string(any: any): any is string {
        return typeof any === 'string' || any instanceof String
    }

    static id(any: any): any is command.ID {
        if (!any) return false
        const ids = Object.keys(definitions)
        if (Check.string(any)) {
            return ids.includes(any)
        }
        return false
    }

    static array(any: any): any is Array<any> {
        return Array.isArray(any)
    }

    static assassination(mission?: string): boolean {
        if (!mission) return false
        return mission.toUpperCase() === "ASSASSINATION"
            || mission.toUpperCase() === "ASSASSINATE"
    }

    static rewards(rewards: message.Reward[], items: string[]): message.Reward[] {
        return rewards
            .filter(reward => !!reward.text)
            .filter(reward =>
                items.some(item =>
                    Compare.loose(item, reward.rewards))
            )
    }
}