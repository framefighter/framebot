import { Check } from '../../../utils/check'

/**
 * NOTES:
    |       C       [g]
    |----------B    [f]
    |       A       [e]
    |----------9    [d]
    |       8       [c]
    |----------7    [b]
    |       6       [a]
    |----------5    [g]
    |       4       [f]
    |----------3    [e]
    |       2       [d]
    |          1    [c]
 */

export class Converter {
    noteLookup: song.Lookup = {
        "1": "B",
        "2": "C",
        "3": "E",
        "4": "J",
        "5": "K",
        "6": "M",
        "7": "R",
        "8": "S",
        "9": "U",
        "A": "h",
        "B": "i",
        "C": "k"
    }
    maxLength: number = 64
    speed: number
    scale: number
    pos: number
    music: string

    constructor(music: string, scale?: number, speed?: number) {
        this.music = music
        this.speed = speed || 3
        this.scale = Math.min(Math.abs(scale || 5), 8)
        this.pos = 0
    }

    getNote(note: keyof song.Lookup): string {
        return this.noteLookup[note] || "B"
    }

    toChar(n: number): string {
        if (n > 25 && n < 52) {
            return String.fromCharCode(6 * 16 + 1 - 26 + n)
        } else if (n < 26) {
            return String.fromCharCode(4 * 16 + 1 + n)
        } else if (n > 51 && n < 62) {
            return (n - 52).toString()
        } else if (n === 62) {
            return "+"
        } else if (n === 63) {
            return "/"
        }
        return ""
    }

    posToString(pos: number): string {
        const s2 = pos % this.maxLength
        if (s2 > this.maxLength - 1) {
            return ""
        }
        const s1 = (pos - s2) / 64
        return this.toChar(s1) + this.toChar(s2)
    }

    convertPos(): string {
        let res = "",
            note = "",
            noteC = 0

        for (let c of this.music) {
            if (c === "#" || c === "") break
            if (c === "-") {
                if (noteC > 0) {
                    let i = this.getNote(note as keyof song.Lookup)
                    res += i
                    note = ""
                    noteC = 0
                    res += this.posToString(this.pos)
                }
                this.pos += this.speed
            } else if (c !== "|") {
                note += c
                noteC++
            }

        }
        if (note !== "") {
            res += this.getNote(note as keyof song.Lookup)
            res += this.posToString(this.pos)
        }

        return res
    }

    get sharable(): string {
        let res: string = this.scale.toString()
        if (Check.string(this.music)) {
            this.music.replace(/[\r\n]/g, "")
            res += this.convertPos()
        }
        return res
    }
}