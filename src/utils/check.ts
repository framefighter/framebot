import { compare } from './compare';

export class check {
    static string(any: any): any is string {
        return typeof any === 'string' || any instanceof String;
    }

    static array(any: any): any is Array<any> {
        return Array.isArray(any);
    }

    static assassination(mission?: string): boolean {
        if (!mission) return false
        return mission.toUpperCase() === "ASSASSINATION"
            || mission.toUpperCase() === "ASSASSINATE";
    }

    static rewards(rewards: message.Reward[], items: string[]): message.Reward[] {
        return rewards
            .filter(reward => !!reward.text)
            .filter(reward =>
                items.some(item =>
                    compare.loose(item, reward.rewards))
            )
    }
}