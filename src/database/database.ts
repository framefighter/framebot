import { UsersDB } from './userDB'
import { TimesDB } from './timesDB'
import { NotificationsDB } from './notificationsDB'
import { SongsDB } from './songsDB'


export class Database implements db.Base {
    users: UsersDB
    times: TimesDB
    notifications: NotificationsDB
    songs: SongsDB

    constructor(path: string) {
        this.users = new UsersDB(path)
        this.times = new TimesDB(path)
        this.notifications = new NotificationsDB(path)
        this.songs = new SongsDB(path)
    }
}
