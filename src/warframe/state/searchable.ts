import { Parser } from './parser';
import axios from "axios"

export class Searchable implements wf.Searchable {
    weapons?: wf.searchable.Weapons;
    warframes?: wf.searchable.Warframes;
    mods?: wf.searchable.Mods;
    prices?: wf.searchable.Price[];
    drops?: wf.searchable.GroupedDrop[];
    places?: wf.searchable.GroupedPlace[];
    sentinels?: wf.searchable.Sentinels;
    manifest?: wf.searchable.Manifest;
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