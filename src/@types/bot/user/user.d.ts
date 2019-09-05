declare namespace user {
    type ID = number
    interface Constructor {
        admin?: boolean
        settings?: Settings
    }

    class User implements Constructor {
        id: number
        username?: string | undefined
        admin: boolean
        _settings: Settings
        settings: Settings
        lastActive?: active.Active
        from: From
    }

    interface From {
        id: number
        admin: boolean
        is_bot: boolean
        first_name: string
        last_name?: string | undefined
        username?: string | undefined
        language_code?: string | undefined
        settings: Settings
    }

    interface Settings {
        alert: AlertSettings
        arbitration: string[]
        filter: string[]
        menu: command.ID[][]
        convertedSong: string
    }

    interface AlertSettings {
        [key: string]: boolean
    }
}