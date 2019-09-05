export class Song implements song.Song {
    name: string
    string: string
    user: number
    constructor(c: Readonly<song.Constructor>) {
        this.name = c.name
        this.string = c.string
        this.user = c.user
    }
}