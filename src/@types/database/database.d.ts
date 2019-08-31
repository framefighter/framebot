declare namespace db {
    interface Base {
        users: db.UsersDB;
        times: db.TimesDB;
        notifications: db.NotificationsDB;
        songs: db.SongsDB;
    }

    interface DB {
        db: any;
        key: string;
        data(): any;
    }

    interface UsersDB extends DB {
        list: user.User[];
        update(user: user.User): void;
        getByName(username: string): user.User | undefined;
    }

    interface SongsDB extends DB {
        list: song.Song[];
        add(song: song.Song): void;
        update(song: song.Song): boolean;
        getByName(songname: string): song.Song | undefined;
    }

    interface TimesDB extends DB {
        list: time.Record[];
        add(time: time.Record): void;
        generateID(mission?: string, boss?: string): string;
        missionInSeconds(mission?: string, boss?: string): number;
        avg(): time.Avg;
    }

    interface NotificationsDB extends DB {
        generateID(obj: any, command?: string): string;
        add(notificationID: string | number): boolean;
        exists(notificationID: string | number): boolean;
        list: (string | number)[]
    }
}