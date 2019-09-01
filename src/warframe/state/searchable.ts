import { Parser } from './parser';
import axios from "axios"
import { Compare } from '../../utils/compare';

export class Searchable implements wf.Searchable {
    weapons?: wf.searchable.ExportWeaponsEntity[];
    warframes?: wf.searchable.ExportWarframesEntity[];
    mods?: wf.searchable.ExportUpgradesEntity[];
    prices?: wf.searchable.Price[];
    drops?: wf.searchable.GroupedDrop[];
    places?: wf.searchable.GroupedPlace[];
    sentinels?: wf.searchable.ExportSentinelsEntity[];
    manifest?: wf.searchable.Manifest;
    baseUrl: string = "http://content.warframe.com/MobileExport";
    path: string = "/Manifest";
    constructor(frequency?: number) {
        this.update();
        setInterval(() => this.update(), frequency || 10000);
    }
    async update() {
        axios(`${this.baseUrl}${this.path}/ExportManifest.json`)
            .then((res) => this.manifest =
                Parser.parse<wf.searchable.Manifest>(res.data));
        axios(`${this.baseUrl}${this.path}/ExportWeapons.json`)
            .then((res) => this.weapons =
                (Parser.parse<wf.searchable.Weapons>(res.data).ExportWeapons || [])
                    .sort((a, b) => Compare.alphabet(a.name, b.name)));
        axios(`${this.baseUrl}${this.path}/ExportWarframes.json`)
            .then((res) => this.warframes =
                (Parser.parse<wf.searchable.Warframes>(res.data).ExportWarframes || [])
                    .sort((a, b) => Compare.alphabet(a.name, b.name)));
        axios(`${this.baseUrl}${this.path}/ExportUpgrades.json`)
            .then((res) => this.mods =
                (Parser.parse<wf.searchable.Mods>(res.data).ExportUpgrades || [])
                    .sort((a, b) => Compare.alphabet(a.name, b.name)));
        axios(`${this.baseUrl}${this.path}/ExportSentinels.json`)
            .then((res) => this.sentinels =
                (Parser.parse<wf.searchable.Sentinels>(res.data).ExportSentinels || [])
                    .sort((a, b) => Compare.alphabet(a.name, b.name)));
        axios('https://nexus-stats.com/api').then(res => this.prices =
            Parser.parse<wf.searchable.Price[]>(res.data));
        axios('https://drops.warframestat.us/data/all.slim.json').then(res => {
            const drops = Parser.parse<wf.searchable.Drop[]>(res.data)
            this.drops = Parser.groupDrops(drops);
            this.places = Parser.groupPlaces(drops);
        });
    }
}