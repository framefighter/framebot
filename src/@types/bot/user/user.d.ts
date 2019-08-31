declare namespace user {
    type ID = number;
    interface Constructor {
        id: ID;
        admin: boolean;
    }

    class User implements Constructor {
        id: number;
        admin: boolean;
        is_bot: boolean;
        first_name: string;
        last_name?: string | undefined;
        username?: string | undefined;
        language_code?: string | undefined;
        settings: Settings;
    }

    interface Settings {
        alert: AlertSettings;
        arbitration: string[];
        filter: string[];
        menu: command.ID[][];
    }

    interface AlertSettings {
        [key: string]: boolean;
    }
}