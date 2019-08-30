declare namespace wf {
    namespace warframes {
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

    }
}