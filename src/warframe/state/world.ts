import { Parser } from './parser';
import { EventEmitter } from 'events';
import axios from "axios"

export class World extends EventEmitter implements wf.World {
    ws?: wf.Ws;
    constructor(frequency?: number) {
        super();
        this.update();
        setInterval(() => this.update(), frequency || 10000);
    }

    async update() {
        axios('http://content.warframe.com/dynamic/worldState.php')
            .then((res) => {
                const parsed = Parser.state(res.data);
                this.ws = parsed;
                this.emit("state", parsed);
            }).catch(err => console.error(err));
    }
}
