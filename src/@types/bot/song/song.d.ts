declare namespace song {
    interface Constructor {
        name: string;
        string: string;
        user: user.User["id"];
    }
    class Song implements Constructor {
        name: string;
        string: string;
        user: number;
    }
}