declare namespace wf {
    class Extra {
        arbitration?: wf.extra.Arbitration
        kuva?: wf.extra.Arbitration[]
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

        interface Arbitration {
            activation?: string
            expiry?: string
            solnode?: string
            node?: string
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