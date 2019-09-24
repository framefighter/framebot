declare namespace wf {
    class World {
        ws?: wf.Ws
        filteredByID<T>(ids: string[], jsonKey: keyof wf.Ws): T[]
        update(): Promise<void>
    }

    interface Ws {
        timestamp?: string
        news?: News[]
        events?: Event[]
        alerts?: Alert[]
        sortie?: Sortie
        syndicateMissions?: SyndicateMission[]
        fissures?: Fissure[]
        globalUpgrades?: GlobalUpgrade[]
        flashSales?: FlashSale[]
        invasions?: Invasion[]
        darkSectors?: DarkSector[]
        voidTrader?: VoidTrader
        dailyDeals?: DailyDeal[]
        simaris?: Simaris
        conclaveChallenges?: ConclaveChallenge[]
        persistentEnemies?: any[]
        earthCycle?: EarthCycle
        cetusCycle?: CetusCycle
        weeklyChallenges?: any[]
        constructionProgress?: ConstructionProgress
        vallisCycle?: VallisCycle
        nightwave?: Nightwave
        kuva?: Arbitration[]
        arbitration?: Arbitration
    }

    interface Arbitration {
        activation?: string;
        expiry?: string;
        solnode?: string;
        node?: string;
        name?: string;
        tile?: string;
        planet?: string;
        enemy?: string;
        type?: string;
        node_type?: string;
        archwing?: boolean;
        sharkwing?: boolean;
        id?: string;
    }


    interface Alert {
        mission?: Mission
        expired?: boolean
        eta?: string
        id?: string
        expiry?: string
        activation?: string
        rewardTypes?: (string)[] | null
    }

    interface Mission {
        reward?: AlertReward
        node?: string
        faction?: string
        maxEnemyLevel?: number
        minEnemyLevel?: number
        maxWaveNum?: number
        type?: string
        nightmare?: boolean
        archwingRequired?: boolean
        isSharkwing?: boolean
        enemySpec?: string
        levelOverride?: string
        advancedSpawners?: (string)[] | null
        requiredItems?: (string)[] | null
        consumeRequiredItems?: boolean
        leadersAlwaysAllowed?: boolean
        levelAuras?: (string)[] | null
    }

    interface AlertReward {
        countedItems?: (CountedItem)[] | null
        thumbnail?: string
        color?: number
        credits?: number
        asString?: string
        items?: (any)[] | null
        itemString?: string
    }

    interface CetusCycle {
        id?: string
        expiry?: string
        activation?: number
        isDay?: boolean
        state?: string
        timeLeft?: string
        isCetus?: boolean
        shortString?: string
    }

    interface ConclaveChallenge {
        id?: string
        description?: string
        expiry?: string
        activation?: string
        amount?: number
        mode?: string
        category?: string
        eta?: string
        expired?: boolean
        daily?: boolean
        rootChallenge?: boolean
        endString?: string
        asString?: string
    }

    export interface ConstructionProgress {
        id?: string
        fomorianProgress?: string
        razorbackProgress?: string
        unknownProgress?: string
    }

    export interface DailyDeal {
        item?: string
        expiry?: string
        activation?: string
        originalPrice?: number
        salePrice?: number
        total?: number
        sold?: number
        id?: string
        eta?: string
        discount?: number
    }

    export interface DarkSector {
        id?: string
        isAlliance?: boolean
        defenderName?: string
        defenderDeployemntActivation?: number
        defenderMOTD?: string
        deployerName?: string
        deployerClan?: string
        history?: any[]
    }

    export interface EarthCycle {
        id?: string
        expiry?: string
        activation?: string
        isDay?: boolean
        state?: string
        timeLeft?: string
    }

    export interface Event {
        id?: string
        activation?: string
        startString?: string
        expiry?: string
        active?: boolean
        maximumScore?: number
        currentScore?: number
        description?: string
        tooltip?: string
        node?: string
        concurrentNodes?: any[]
        scoreLocTag?: string
        rewards?: Reward[]
        expired?: boolean
        health?: string
        interimSteps?: InterimStep[]
        progressSteps?: any[]
        isPersonal?: boolean
        regionDrops?: any[]
        archwingDrops?: any[]
        asString?: string
        victimNode?: string
        affiliatedWith?: string
        jobs?: Job[]
        faction?: string
    }

    export interface InterimStep {
        goal?: number
        reward?: Reward
        message?: Message
    }

    export interface Message {
    }

    export interface Reward {
        items?: string[]
        countedItems?: CountedItem[]
        credits?: number
        asString?: string
        itemString?: string
        thumbnail?: string
        color?: number
    }

    export interface CountedItem {
        count?: number
        type?: string
    }

    export interface Job {
        id?: string
        rewardPool?: string[]
        type?: string
        enemyLevels?: number[]
        standingStages?: number[]
    }

    export interface Fissure {
        id?: string
        activation?: string
        startString?: string
        expiry?: string
        active?: boolean
        node?: string
        missionType?: string
        enemy?: string
        tier?: string
        tierNum?: number
        expired?: boolean
        eta?: string
    }

    export interface FlashSale {
        item?: string
        expiry?: string
        activation?: string
        discount?: number
        regularOverride?: number
        premiumOverride?: number
        isShownInMarket?: boolean
        isFeatured?: boolean
        isPopular?: boolean
        id?: string
        expired?: boolean
        eta?: string
    }

    export interface GlobalUpgrade {
        start?: string
        end?: string
        upgrade?: string
        operation?: string
        operationSymbol?: string
        upgradeOperationValue?: number
        expired?: boolean
        eta?: string
        desc?: string
    }

    export interface Invasion {
        id?: string
        activation?: string
        startString?: string
        node?: string
        desc?: string
        attackerReward?: Reward
        attackingFaction?: string
        defenderReward?: Reward
        defendingFaction?: string
        vsInfestation?: boolean
        count?: number
        requiredRuns?: number
        completion?: number
        completed?: boolean
        eta?: string
        rewardTypes?: string[]
    }

    export interface News {
        id?: string
        message?: string
        link?: string
        imageLink?: string
        priority?: boolean
        date?: string
        startDate?: string
        eta?: string
        update?: boolean
        primeAccess?: boolean
        stream?: boolean
        translations?: Translations
        asString?: string
    }

    export interface Translations {
        en?: string
        fr?: string
        it?: string
        de?: string
        es?: string
        pt?: string
        ru?: string
        pl?: string
        tr?: string
        ja?: string
        zh?: string
        ko?: string
        tc?: string
    }

    export interface Nightwave {
        id?: string
        activation?: string
        startString?: string
        expiry?: string
        active?: boolean
        season?: number
        tag?: string
        phase?: number
        params?: Params
        possibleChallenges?: any[]
        activeChallenges?: ActiveChallenge[]
        rewardTypes?: string[]
    }

    export interface ActiveChallenge {
        id?: string
        activation?: string
        startString?: string
        expiry?: string
        active?: boolean
        isDaily?: boolean
        isElite?: boolean
        desc?: string
        title?: string
        reputation?: number
    }

    export interface Params {
        zsr?: number
        hsr?: number
    }

    export interface Simaris {
        target?: string
        isTargetActive?: boolean
        asString?: string
    }

    export interface Sortie {
        id?: string
        activation?: string
        startString?: string
        expiry?: string
        active?: boolean
        rewardPool?: string
        variants?: Variant[]
        boss?: string
        faction?: string
        expired?: boolean
        eta?: string
    }

    export interface Variant {
        boss?: string
        planet?: string
        missionType?: string
        modifier?: string
        modifierDescription?: string
        node?: string
    }

    export interface SyndicateMission {
        id?: string
        activation?: string
        startString?: string
        expiry?: string
        active?: boolean
        syndicate?: string
        nodes?: string[]
        jobs?: Job[]
        eta?: string
    }

    export interface VallisCycle {
        id?: string
        expiry?: string
        isWarm?: boolean
        state?: string
        activation?: string
        timeLeft?: string
        shortString?: string
    }

    export interface VoidTrader {
        id?: string
        activation?: string
        startString?: string
        expiry?: string
        active?: boolean
        character?: string
        location?: string
        inventory?: any[]
        psId?: string
        endString?: string
    }

}