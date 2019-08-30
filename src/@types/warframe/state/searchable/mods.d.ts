declare namespace wf {
    namespace mods {
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
    }
}