import { DB } from './db'

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
            this.db.push(`/${this.key}[]`, notificationID)
            return true
        }
        return false
    }

    get list(): (string | number)[] {
        try {
            return this.data()
        } catch (err) {
            return []
        }
    }

    exists(notificationID: string | number): boolean {
        if (!notificationID) return false
        return this.list.includes(notificationID)
    }
}