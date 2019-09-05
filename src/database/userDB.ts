import { DB } from './db'

export class UsersDB extends DB<{ [key: string]: user.From }> implements db.UsersDB {
    constructor(path: string) {
        super(path, "users")
    }

    get list(): user.From[] {
        try {
            const users = this.data()
            return Object.keys(users).map(key => users[key])
        } catch (err) {
            return []
        }
    }

    update(user: user.From) {
        user.settings.alert = user.settings.alert || {}
        user.settings.arbitration = user.settings.arbitration || []
        user.settings.menu = user.settings.menu || []
        user.settings.filter = user.settings.filter || []
        this.db.push(`/${this.key}/${user.id}`, user)
    }

    getByName(username: string): user.From | undefined {
        return this.list.find(user => user.username === username)
    }

}
