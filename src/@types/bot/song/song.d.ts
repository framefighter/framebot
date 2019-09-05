declare namespace song {
    interface Constructor {
        name: string
        string: string
        user: user.User["id"]
    }
    class Song implements Constructor {
        name: string
        string: string
        user: number
    }

    interface Music {
        name: string
        events: Array<Event>
        interpretation: Interpretation
    }

    type Event = [number, string, number | string, number | string, number]

    interface Interpretation {
        time_signature: string
        key: string
        transpose: number
    }

    interface Lookup {
        "1": "B",
        "2": "C",
        "3": "E",
        "4": "J",
        "5": "K",
        "6": "M",
        "7": "R",
        "8": "S",
        "9": "U",
        "A": "h",
        "B": "i",
        "C": "k"
    }

}