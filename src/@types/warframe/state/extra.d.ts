declare namespace wf {
    class Extra {
        arbitration?: Arbitration
        kuva?: Arbitration[]
        update(): Promise<void>
    }
    namespace extra {
        interface RawKuva {
            start?: string
            end?: string
            missiontype?: string
            solnode?: string
            solnodedata?: RawSolnodedata
            realtime?: string
        }

        interface RawSolnodedata {
            name?: string
            tile?: string
            planet?: string
            enemy?: string
            type?: string
            node_type?: string
            archwing?: boolean
            sharkwing?: boolean
        }
    }
}