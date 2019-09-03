declare namespace db {
    class Base {
        users: db.UsersDB;
        times: db.TimesDB;
        notifications: db.NotificationsDB;
        songs: db.SongsDB;
    }

    class DB {
        db: any;
        key: string;
        data(): any;
    }

    class UsersDB extends DB {
        list: user.From[];
        update(user: user.From): void;
        getByName(username: string): user.From | undefined;
    }

    class SongsDB extends DB {
        list: song.Song[];
        add(song: song.Song): void;
        update(song: song.Song): boolean;
        getByName(songname: string): song.Song | undefined;
        exists(songname: string | number): boolean;
    }

    class TimesDB extends DB {
        list: time.Record[];
        add(time: time.Record): void;
        generateID(mission?: string, boss?: string): string;
        missionInSeconds(mission?: string, boss?: string): number;
        avg(): time.Avg;
    }

    class NotificationsDB extends DB {
        generateID(obj: any, command?: string): string;
        add(notificationID: string | number): boolean;
        exists(notificationID: string | number): boolean;
        list: (string | number)[]
    }
}