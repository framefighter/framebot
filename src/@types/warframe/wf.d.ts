
declare namespace wf {
    class Searchable {
        constructor(frequency?: number);
        weapons?: weapons.Weapons;
        mods?: mods.Mods;
        warframes?: warframes.Warframes;
        prices?: prices.Price[];
        drops?: drops.GroupedDrop[];
        sentinels?: warframes.Sentinels;
        manifest?: manifest.Manifest;
        baseUrl: string;
        places?: drops.GroupedPlace[];
        update(): Promise<void>;
    }

    class World {
        ws?: wf.Ws;
        update(): Promise<void>;
    }

    class Extra {
        arbitration?: wf.extra.Arbitration;
        kuva?: wf.extra.Arbitration[];
        update(): Promise<void>;
    }

    class Parser {
        static state(state: any): wf.Ws
        static parse(jsonStr: any): any
        static groupDrops(drops?: wf.drops.Drop[]): wf.drops.GroupedDrop[]
        static groupPlaces(drops?: wf.drops.Drop[]): wf.drops.GroupedPlace[]
        static cleanJSON(json: string): string
        static parseExtra(data: wf.extra.RawKuva[]): ParsedExtra
    }

    interface ParsedExtra {
        kuva: wf.extra.Arbitration[];
        arbitration: wf.extra.Arbitration;
    }
}