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

export class Extra extends EventEmitter implements wf.Extra {
    arbitration?: wf.extra.Arbitration;
    kuva?: wf.extra.Arbitration[];
    constructor(frequency?: number) {
        super();
        this.update();
        setInterval(() => this.update(), frequency || 10000);
    }

    async update() {
        axios("https://10o.io/kuvalog.json")
            .then((res) => {
                const parsed = Parser.parseExtra(res.data);
                if (parsed.arbitration && parsed.kuva) {
                    this.arbitration = parsed.arbitration;
                    this.kuva = parsed.kuva;
                    this.emit("extra", parsed);
                }
            });
    }
}

export class Searchable implements wf.Searchable {
    weapons?: wf.weapons.Weapons;
    warframes?: wf.warframes.Warframes;
    mods?: wf.mods.Mods;
    prices?: wf.prices.Price[];
    drops?: wf.drops.GroupedDrop[];
    places?: wf.drops.GroupedPlace[];
    sentinels?: wf.warframes.Sentinels;
    manifest?: wf.manifest.Manifest;
    baseUrl: string = "http://content.warframe.com/MobileExport";
    path: string = "/Manifest";
    constructor(frequency?: number) {
        this.update();
        setInterval(() => this.update(), frequency || 10000);
    }
    async update() {
        axios(`${this.baseUrl}${this.path}/ExportManifest.json`)
            .then((res) => this.manifest = Parser.parse(res.data));
        axios(`${this.baseUrl}${this.path}/ExportWeapons.json`)
            .then((res) => this.weapons = Parser.parse(res.data));
        axios(`${this.baseUrl}${this.path}/ExportWarframes.json`)
            .then((res) => this.warframes = Parser.parse(res.data));
        axios(`${this.baseUrl}${this.path}/ExportUpgrades.json`)
            .then((res) => this.mods = Parser.parse(res.data));
        axios(`${this.baseUrl}${this.path}/ExportSentinels.json`)
            .then((res) => this.sentinels = Parser.parse(res.data));
        axios('https://nexus-stats.com/api').then(res => this.prices = Parser.parse(res.data));
        axios('https://drops.warframestat.us/data/all.slim.json').then(res => {
            this.drops = Parser.groupDrops(Parser.parse(res.data));
            this.places = Parser.groupPlaces(Parser.parse(res.data));
        });
    }
}