declare namespace wf {
    class Searchable {
        constructor(frequency?: number);
        weapons?: searchable.ExportWeaponsEntity[];
        mods?: searchable.ExportUpgradesEntity[];
        warframes?: searchable.ExportWarframesEntity[];
        prices?: searchable.Price[];
        drops?: searchable.GroupedDrop[];
        sentinels?: searchable.ExportSentinelsEntity[];
        manifest?: searchable.Manifest;
        baseUrl: string;
        places?: searchable.GroupedPlace[];
        update(): Promise<void>;
    }

    namespace searchable {
        interface Weapons {
            ExportWeapons?: (ExportWeaponsEntity)[] | null;
        }

        interface ExportWeaponsEntity {
            name: string;
            uniqueName: string;
            codexSecret: boolean;
            secondsPerShot?: number | null;
            /**
             * `[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]`
             * `[i,p,s,h,c,e,t,b,r,g,m,v,c,?,?,?,?,?,?,?]`
             * 
             * index | type
             * 0. impact
             * 1. puncture
             * 2. slash
             * 3. heat
             * 4. cold
             * 5. electricity
             * 6. toxic
             * 7. blast
             * 8. radiation
             * 9. gas
             * 10. magnetic
             * 11. viral
             * 12. corrosive
             * 13. ? (true)
             * 14. ? (void)
             * 15. ?
             * 16. ?
             * 17. ?
             * 18. ?
             * 19. ?
             */
            damagePerShot?: (number)[] | null;
            magazineSize?: number | null;
            reloadTime?: number | null;
            totalDamage?: number | null;
            damagePerSecond?: number | null;
            trigger?: string | null;
            description?: string | null;
            accuracy?: number | null;
            criticalChance?: number | null;
            criticalMultiplier?: number | null;
            procChance?: number | null;
            fireRate?: number | null;
            chargeAttack?: number | null;
            spinAttack?: number | null;
            leapAttack?: number | null;
            wallAttack?: number | null;
            slot?: number | null;
            noise?: string | null;
            sentinel?: boolean | null;
            masteryReq?: number | null;
            omegaAttenuation?: number | null;
            channelingDrain?: number | null;
            channelingDamageMultiplier?: number | null;
        }
        interface Warframes {
            ExportWarframes?: (ExportWarframesEntity)[] | null;
        }
        interface ExportWarframesEntity extends ExportSentinelsEntity {
            sprintSpeed: number;
            abilities?: (AbilitiesEntity)[] | null;
            passiveDescription?: string | null;
        }
        interface AbilitiesEntity {
            abilityUniqueName: string;
            abilityName: string;
            description: string;
        }
        interface Sentinels {
            ExportSentinels?: (ExportSentinelsEntity)[] | null;
        }
        interface ExportSentinelsEntity {
            uniqueName: string;
            name: string;
            description: string;
            longDescription: string;
            health: number;
            shield: number;
            armor: number;
            stamina: number;
            power: number;
            codexSecret: boolean;
        }

        interface Price {
            Title: string;
            Type?: string | null;
            SupDem?: (number)[] | null;
            SupDemNum?: (number)[] | null;
            Components?: (ComponentsEntity | null)[] | null;
            id: string;
        }
        interface ComponentsEntity {
            name: string;
            avg: string;
            comp_val_rt: string;
            data?: (number | null)[] | null;
            visible: boolean;
        }
        interface Mods {
            ExportUpgrades?: (ExportUpgradesEntity)[] | null;
        }

        interface ExportUpgradesEntity {
            uniqueName: string;
            name: string;
            /**
             * POLARITIES
             * 
             * AP_POWER: Zenurik
             * AP_DEFENSE: Vazarin
             * AP_TACTIC: Naramon
             * AP_ATTACK: Madurai 
             * AP_WARD: Unairu
             * AP_PRECEPT: Penjaga
             * AP_UMBRA: Umbra
             * 
             */
            polarity: string;
            rarity: string;
            codexSecret: boolean;
            baseDrain: number;
            fusionLimit: number;
            description?: (string)[] | null;
            type?: string | null;
            subtype?: string | null;
            upgradeEntries?: (UpgradeEntriesEntity)[] | null;
            availableChallenges?: (AvailableChallengesEntity)[] | null;
        }

        interface UpgradeEntriesEntity {
            tag: string;
            prefixTag: string;
            suffixTag: string;
            upgradeValues?: (UpgradeValuesEntity)[] | null;
        }

        interface UpgradeValuesEntity {
            value: number;
            locTag?: string | null;
        }

        interface AvailableChallengesEntity {
            fullName: string;
            description: string;
            complications?: (ComplicationsEntity)[] | null;
        }

        interface ComplicationsEntity {
            fullName: string;
            description: string;
            overrideTag?: string | null;
        }
        interface Manifest {
            Manifest?: (ManifestEntity)[] | null;
        }
        interface ManifestEntity {
            uniqueName: string;
            textureLocation: string;
            fileTime: number;
        }
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