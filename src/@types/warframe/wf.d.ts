
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
}