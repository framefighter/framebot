declare namespace command {

    // add new command (camelCase) to list below

    type ID =
        | "none"
        | "sortie"
        | "cycles"
        | "sortieTimes"
        | "fissures"
        | "invasions"
        | "events"
        | "news"
        | "updates"
        | "trader"
        | "boosters"
        | "nightwave"
        | "cetus"
        | "vallis"
        | "earth"
        | "arbitration"
        | "alerts"
        | "filter"
        | "remove"
        | "askRemove"
        | "settings"
        | "alertSettings"
        | "admin"
        | "time"
        | "arbitrationFilter"
        | "findWeapon"
        | "findWarframe"
        | "findMod"
        | "findSentinel"
        | "price"
        | "drop"
        | "place"
        | "find"
        | "check"
        | "start"
        | "help"
        | "restart"
        | "all"
        | "search"
        | "config"
        | "configSelection"
        | "clearConfig"
        | "songs"
        | "showSong"

    type Suffix = {
        setting: string,
        askRemoveItem: string,
        removeItem: string,
        executeCheck: string,
        arbitrationRemove: string,
        addItem: string,
        addMenuButton: string,
        removeMenuButton: string,
        selectMenuButton: string,
        showSong: string,
        removeSong: string
    }
}
