import { JsonDB } from "node-json-db";
import { User } from '../bot/user/user';
import { check } from '../utils/check';

export class Database implements db.Base {
    users: UsersDB;
    times: TimesDB;
    notifications: NotificationsDB;

    constructor(path: string) {
        this.users = new UsersDB(path);
        this.times = new TimesDB(path);
        this.notifications = new NotificationsDB(path);
    }
}

export abstract class DB implements db.DB {
    data: JsonDB;
    constructor(path: string, name: string) {
        this.data = new JsonDB(`${path}/${name}`, true, true);
    }
}

export class UsersDB extends DB implements db.UsersDB {
    constructor(path: string) {
        super(path, "users");
    }

    get list(): user.User[] {
        try {
            const users = this.data.getData("/users");
            return Object.keys(users).map(key => users[key]);
        } catch (err) {
            return []
        }
    }

    update(user: User) {
        this.data.push(`/users/${user.id}`, user);
    }

    getByName(username: string): User | undefined {
        return this.list.find(user => user.username === username);
    }

}

export class TimesDB extends DB implements db.TimesDB {
    constructor(path: string) {
        super(path, "times");
    }

    add(time: time.Record) {
        this.data.push("/times[]", time);
    }

    get list(): time.Record[] {
        try {
            return this.data.getData("/times");
        } catch (err) {
            return []
        }
    }

    generateID(mission?: string, boss?: string): string {
        if (check.assassination(mission || "") && boss) {
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

export class NotificationsDB extends DB implements db.NotificationsDB {
    constructor(path: string) {
        super(path, "notifications")
    }

    generateID(obj: any, command?: string): string {
        if (obj) {
            return (obj.id || command + (obj.start || obj.end || obj.activation || obj.expiry))
        } return ""
    }

    add(notificationID: string | number): boolean {
        if (!this.exists(notificationID)) {
            this.data.push("/notifications[]", notificationID);
            return true;
        }
        return false;
    }

    get list(): (string | number)[] {
        try {
            return this.data.getData("/notifications");
        } catch (err) {
            return []
        }
    }

    exists(notificationID: string | number): boolean {
        if (!notificationID) return false;
        return this.list.includes(notificationID);
    }
}