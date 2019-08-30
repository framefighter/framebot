declare namespace wf {
    namespace weapons {
        interface Weapons {
            ExportWeapons?: (ExportWeaponsEntity)[] | null;
        }

        interface ExportWeaponsEntity {
            name: string;
            uniqueName: string;
            codexSecret: boolean;
            secondsPerShot?: number | null;
            /**
             * [0,1,2,3,4,5,6,7,8,9,1,2,3,4,5,6,7,8,9,2]
             * [i,p,s,h,c,e,t,b,r,g,m,v,c,0,0,0,0,0,0,0]
             * 
             * 0: impact
             * 1: puncture
             * 2: slash
             * 3: heat
             * 4: cold
             * 5: electricity
             * 6: toxic
             * 7: blast
             * 8: radiation
             * 9: gas
             * 10: magnetic
             * 11: viral
             * 12: corrosive
             * 13: ? (true)
             * 14: ? (void)
             * 15: ?
             * 16: ?
             * 17: ?
             * 18: ?
             * 19: ?
             * 20: ?
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
    }
}