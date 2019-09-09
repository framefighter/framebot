import { JsonDB } from "node-json-db"

export abstract class DB<T> implements db.DB {
    db: JsonDB
    key: string
    constructor(path: string, name: string) {
        this.db = new JsonDB(`${path}/${name}`, true, true)
        this.key = name
    }
    get data(): T {
        return this.db.getData(`/${this.key}`)
    }
}