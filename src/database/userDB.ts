import { User } from '../bot/user/user';
import { DB } from './db';

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
