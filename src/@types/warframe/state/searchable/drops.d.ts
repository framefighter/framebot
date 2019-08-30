declare namespace wf {
    namespace drops {
        interface Drop {
            place: string;
            item: string;
            rarity: Rarity;
            chance: number | string;
        }

        enum Rarity {
            Common = "Common",
            Legendary = "Legendary",
            Rare = "Rare",
            Uncommon = "Uncommon",
        }

        interface GroupedDrop {
            item: string;
            group: DropInfo[];
        }

        interface GroupedPlace {
            place: string;
            group: PlaceInfo[];
        }

        interface PlaceInfo {
            item: string;
            chance: number | string;
            rarity: Rarity;
        }

        interface DropInfo {
            place: string;
            chance: number | string;
            rarity: Rarity;
        }
    }
}