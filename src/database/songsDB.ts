import { Song } from '../bot/song/song'
import { DB } from './db'

export class SongsDB extends DB<Song[]> implements db.SongsDB {
    constructor(path: string) {
        super(path, "songs")
    }

    get list(): Song[] {
        try {
            return this.data
        } catch (err) {
            return []
        }
    }

    add(song: Song) {
        if (this.exists(song.name)) {
            this.update(song)
        } else {
            this.db.push(`/${this.key}[]`, song)
        }
    }

    remove(song: Song) {
        const ind = this.data.map(s => s.name).indexOf(song.name)
        if (ind !== -1) {
            if (this.data[ind].user === song.user) {
                this.data.splice(ind, 1)
            }
        }
        this.db.save()
    }

    update(song: Song): boolean {
        const ind = this.data.findIndex(s => s.name === song.name)
        if (this.exists(song.name) && ind !== -1) {
            if (this.data[ind].user === song.user) {
                this.db.push(`/${this.key}[${ind}]`, song)
                return true
            }
        }
        return false
    }

    getByName(songname: string): song.Song | undefined {
        return this.list.find(song => song.name === songname)
    }

    exists(songname: string | number): boolean {
        if (!songname) return false
        return this.list.findIndex(song => song.name === songname) !== -1
    }

}