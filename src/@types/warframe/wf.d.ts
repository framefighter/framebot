
declare namespace wf {
    class Parser {
        static state(state: any): Ws
        static parse(jsonStr: any): any
        static groupDrops(drops?: searchable.Drop[]): searchable.GroupedDrop[]
        static groupPlaces(drops?: searchable.Drop[]): searchable.GroupedPlace[]
        static cleanJSON(json: string): string
        static parseExtra(data: extra.RawKuva[]): ParsedExtra
    }

    interface ParsedExtra {
        kuva: Arbitration[]
        arbitration: Arbitration
    }
}