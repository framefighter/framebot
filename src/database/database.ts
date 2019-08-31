import { JsonDB } from "node-json-db";
import { User } from '../bot/user/user';
import { check } from '../utils/check';
import { Song } from '../bot/song/song';

export class Database implements db.Base {
    users: UsersDB;
    times: TimesDB;
    notifications: NotificationsDB;
    songs: SongsDB;

    constructor(path: string) {
        this.users = new UsersDB(path);
        this.times = new TimesDB(path);
        this.notifications = new NotificationsDB(path);
        this.songs = new SongsDB(path);
    }
}

export abstract class DB<T> implements db.DB {
    db: JsonDB;
    key: string;
    constructor(path: string, name: string) {
        this.db = new JsonDB(`${path}/${name}`, true, true);
        this.key = name;
    }
    data(): T {
        return this.db.getData(`/${this.key}`)
    }
}

export class SongsDB extends DB<Song[]> implements db.SongsDB {
    constructor(path: string) {
        super(path, "songs");
    }

    get list(): Song[] {
        try {
            return this.data();
        } catch (err) {
            return []
        }
    }

    add(song: Song) {
        if (this.exists(song.name)) {
            this.update(song);
        } else {
            this.db.push(`/${this.key}[]`, song);
        }
    }

    remove(song: Song) {
        const ind = this.data().map(s => s.name).indexOf(song.name)
        if (ind !== -1) {
            if (this.data()[ind].user === song.user) {
                this.data().splice(ind, 1)
            }
        }
        this.db.save()
    }

    update(song: Song): boolean {
        const ind = this.data().findIndex(s => s.name === song.name);
        if (this.exists(song.name) && ind !== -1) {
            if (this.data()[ind].user === song.user) {
                this.db.push(`/${this.key}[${ind}]`, song)
                return true
            }
        }
        return false
    }

    getByName(songname: string): song.Song | undefined {
        return this.list.find(song => song.name === songname);
    }

    exists(songname: string | number): boolean {
        if (!songname) return false;
        return this.list.findIndex(song => song.name === songname) !== -1;
    }

}

export class UsersDB extends DB<{ [key: string]: User }> implements db.UsersDB {
    constructor(path: string) {
        super(path, "users");
    }

    get list(): user.User[] {
        try {
            const users = this.data();
            return Object.keys(users).map(key => users[key]);
        } catch (err) {
            return []
        }
    }

    update(user: User) {
        user.settings.alert = user.settings.alert || {}
        user.settings.arbitration = user.settings.arbitration || []
        user.settings.filter = user.settings.filter || []
        user.settings.menu = user.settings.menu || []
        this.db.push(`/${this.key}/${user.id}`, user);
    }

    getByName(username: string): User | undefined {
        return this.list.find(user => user.username === username);
    }

}

export class TimesDB extends DB<time.Record[]> implements db.TimesDB {
    constructor(path: string) {
        super(path, "times");
    }

    add(time: time.Record) {
        this.db.push(`/${this.key}[]`, time);
    }

    get list(): time.Record[] {
        try {
            return this.data();
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

export class NotificationsDB extends DB<string[]> implements db.NotificationsDB {
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
            this.db.push(`/${this.key}[]`, notificationID);
            return true;
        }
        return false;
    }

    get list(): (string | number)[] {
        try {
            return this.data();
        } catch (err) {
            return []
        }
    }

    exists(notificationID: string | number): boolean {
        if (!notificationID) return false;
        return this.list.includes(notificationID);
    }
}