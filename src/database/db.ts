import { JsonDB } from "node-json-db"
import { spawn } from 'child_process'

export abstract class DB<T> implements db.DB {
    db: JsonDB
    key: string
    timeout?: NodeJS.Timeout
    constructor(path: string, name: string) {
        this.db = new JsonDB(`${path}/${name}`, true, true)
        this.key = name
    }
    data(): T {
        return this.db.getData(`/${this.key}`)
    }

    push() {
        if (!this.timeout) {
            const spawnPush = () => {
                console.log("PUSHING")
                const spw = spawn("bash bash/push.sh", { shell: true })
                spw.stdout.on("data", (data) => console.log(data))
            }
            this.timeout = setTimeout(spawnPush, 6000)
        }
    }
}