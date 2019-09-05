
declare namespace wf {
    class Parser {
        static state(state: any): wf.Ws
        static parse(jsonStr: any): any
        static groupDrops(drops?: wf.searchable.Drop[]): wf.searchable.GroupedDrop[]
        static groupPlaces(drops?: wf.searchable.Drop[]): wf.searchable.GroupedPlace[]
        static cleanJSON(json: string): string
        static parseExtra(data: wf.extra.RawKuva[]): ParsedExtra
    }

    interface ParsedExtra {
        kuva: wf.extra.Arbitration[]
        arbitration: wf.extra.Arbitration
    }
}