declare namespace time {
    interface Record {
        mission: string
        minutes: number
        seconds: number
        boss?: string
        date?: number
        stage?: number
        reward?: string;
        mod?: string;
    }

    interface Avg {
        [key: string]: AvgTime
    }
    interface AvgTime {
        mission: string,
        seconds: number,
        stage: number,
        count: number,
        max: number,
        min: number
    }

}