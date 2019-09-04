import { Check } from './check';
import { BOT } from '..';
import moment from 'moment';
import striptags from "striptags"
import { Compare } from './compare';

export class Formatter implements utils.Formatter {
    static MAX_WIDTH = 50;
    static IDEAL_WIDTH = 40;

    static nightwave(challenge?: wf.ActiveChallenge): string {
        if (challenge) {
            return Formatter.format({
                caption: challenge.title,
                subCaption: Formatter.nightwaveType(challenge),
                description: challenge.desc,
                standing: challenge.reputation,
                end: challenge.expiry
            })
        } return "No Nightwave found!"
    }

    static nightwaveType(challenge?: wf.ActiveChallenge): string {
        if (challenge) {
            return (challenge.isDaily ? "Daily " : "Weekly ")
                + (challenge.isElite ? "Elite " : "")
        } return ""
    }

    static sortie(sortie?: wf.Sortie): string {
        if (sortie && sortie.variants) {
            let avgT: number = 0
            const missions = sortie.variants.map((mission, i) => {
                const time = BOT.database.times.missionInSeconds(mission.missionType, sortie.boss);
                avgT += time
                return Formatter.format({
                    caption: mission.node,
                    addCaption: Formatter.sortieLevel(i + 1),
                    text: "Mission:".end(mission.missionType).bold()
                        .space()
                        .concat(Check.assassination(mission.missionType)
                            ? (sortie.boss || "") : ""),
                    description: (mission.modifier || "").replace(/:/g, ":\n"),
                    time: Formatter.clock(time),
                    position: i + 1
                })
            }
            ).join("\n")
            const expiry = Formatter.end(sortie.expiry);
            const sortieTime = Formatter.time(Formatter.clock(avgT));
            const faction = Formatter.faction(sortie.faction);
            return `${expiry}${sortieTime}\n${missions}\n${faction}`;
        }
        return "No Sortie found!"
    }

    static sortieLevel(stage?: number): string {
        switch (stage) {
            case 1:
                return "Level 50-60";
            case 2:
                return "Level 65-80";
            case 3:
                return "Level 80-100"
            default:
                return ""
        }
    }

    static fissure(fissure?: wf.Fissure): string {
        if (fissure) {
            if (!fissure.active) return ""
            return Formatter.format({
                caption: fissure.node,
                text: (fissure.missionType || "").bold().end("-").end(fissure.enemy).toUpperCase(),
                subCaption: (fissure.tier || "").end("fissure").toUpperCase(),
                end: fissure.expiry
            })
        } return "Fissure not Found!"
    }

    static invasion(invasion?: wf.Invasion): string {
        if (invasion) {
            if (invasion.completed) return ""
            const completionAtt = (Math.round((invasion.completion || 0) * 10) / 10);
            const completionDef = (Math.round((100 - (invasion.completion || 0)) * 10) / 10);
            const vs = `${invasion.attackingFaction} ${completionAtt}% | ${completionDef}% ${invasion.defendingFaction}`
            const rewards = Formatter.invasionRewards(invasion)
            return Formatter.format({
                caption: (invasion.node || "").concat(":").end(invasion.desc),
                subCaption: vs,
                description: "Rewards:",
                start: invasion.activation,
                time: (invasion.eta || "").toUpperCase().includes("INF") ? "" : invasion.eta,
                list: rewards
            });
        }
        return "Invasion not found!"
    }

    static invasionRewards(invasion?: wf.Invasion): string[] {
        if (!invasion) return [];
        return [
            (invasion.attackerReward ? invasion.attackerReward.asString : ""),
            (invasion.defenderReward ? invasion.defenderReward.asString : "")
        ].clean()
    }

    static event(event?: wf.Event): string {
        if (event) {
            return Formatter.format({
                caption: event.description,
                subCaption: event.affiliatedWith || event.node,
                description: event.tooltip,
                end: event.expiry,
                list: (event.rewards || []).map(reward => reward.asString),
                faction: event.faction,
                chance: "Completion:".end((event.currentScore || "").toString()),
            })
        }
        return "Event not found!"
    }

    static arbitration(arbitration?: wf.extra.Arbitration): string {
        if (arbitration) {
            return Formatter.format({
                caption: arbitration.node,
                addCaption: "Level 60-80",
                text: (arbitration.type || "").end("-")
                    .end(arbitration.enemy)
                    .end("(ARBITRATION)").toUpperCase().bold(),
                end: arbitration.expiry,
                description: "Reward: 50,000 Credits + VITUS ESSENCE"
            })
        }
        return "No Arbitration found"
    }

    static newsEvent(newsEvent?: wf.News): string {
        if (newsEvent
            && newsEvent.message
            && newsEvent.message.trim()) {
            return Formatter.format({
                caption: newsEvent.message,
                link: { text: "Click for more info!", url: newsEvent.link },
                time: newsEvent.eta
            })
        }
        return ""
    }

    static alert(alert?: wf.Alert): string {
        if (alert) {
            if (alert.mission) {
                return Formatter.format({
                    caption: alert.mission.type,
                    subCaption: alert.mission.node,
                    faction: alert.mission.faction,
                    list: (alert.mission.reward
                        ? (alert.mission.reward.asString || "")
                        : "").split(","),
                    end: alert.expiry
                })
            } else {
                return Formatter.format({
                    end: alert.expiry
                })
            }
        }
        return "Alert not found!"
    }

    static timesString(args?: string[]): string {
        const filter = args || [];
        const avg_times = BOT.database.times.avg()
        const total_avg_sec = Object.keys(avg_times).reduce((a, t) =>
            a += avg_times[t].seconds, 0) / Object.keys(avg_times).length
        const total_mis_avg = Formatter.clock(total_avg_sec)
        const total_avg = Formatter.clock(total_avg_sec * 3)
        return "Total Mission Average: " + total_mis_avg.code() + "\n"
            + "Total Sortie Average: " + total_avg.code() + "\n"
            + Object.keys(avg_times)
                .filter(key => filter.length > 0
                    ? Compare.loose(key, filter) : true)
                .sort((a, b) => avg_times[a].stage - avg_times[b].stage)
                .map(key => Formatter.sortieTime(avg_times[key])).join("\n")
    }

    static sortieTime(average: time.AvgTime): string {
        return `> ${Math.round(average.stage * 100) / 100}. ${average.mission}\n${(
            "AVG [" +
            Formatter.clock(average.seconds)
            + "]"
        ).code().indent(6)} | ${(
            "MIN [" +
            Formatter.clock(average.min)
            + "]"
        ).code()} | ${(
            "MAX [" +
            Formatter.clock(average.max)
            + "]"
        ).code()} | ${average.count}`
    }

    static trader(trader?: wf.VoidTrader): string {
        if (trader) {
            if (trader.active && trader.inventory) {
                return Formatter.format({
                    caption: (trader.character || "").end("is at").end(trader.location),
                    list: trader.inventory.map(inv =>
                        `${inv.item}: ${inv.ducats}d | ${inv.credits}c`),
                    time: "in".end(trader.endString),
                })
            } else {
                return Formatter.format({
                    caption: (trader.character || "").end("will be at").end(trader.location),
                    time: "in".end(trader.startString),
                })
            }
        }
        return "No void trader found!"
    }

    static weapon(weapon?: wf.searchable.ExportWeaponsEntity): string {
        if (weapon) {
            const info = {
                speed: weapon.fireRate || "",
                ch_cost: weapon.channelingDrain || "",
                ch_dmg: weapon.channelingDamageMultiplier || "",
                crit_ch: weapon.criticalChance || "",
                crit_dmg: weapon.criticalMultiplier || "",
                leap: weapon.leapAttack || "",
                spin: weapon.spinAttack || "",
                status: weapon.procChance || "",
                wall: weapon.wallAttack || "",
                magazine: weapon.magazineSize || "",
                noise: weapon.noise || "",
                reload: weapon.reloadTime || "",
                trigger: weapon.trigger || "",
                dmg_types: weapon.damagePerShot || [],
                damage: weapon.totalDamage || "",
                dps: weapon.damagePerSecond || "",
            }


            return Formatter.format({
                caption: Formatter.weaponTitle(weapon),
                description: weapon.description || "",
                subCaption: info.speed.toString().start("SPEED:").nl()
                    + info.ch_cost.toString().start("CHANNELING COST:").nl()
                    + info.ch_dmg.toString().start("CHANNELING DMG:").nl()
                    + info.crit_ch.toString().start("CRITICAL CHANCE:").nl()
                    + info.crit_dmg.toString().start("CRITICAL MULTIPLIER:").nl()
                    + info.leap.toString().start("LEAP ATTACK:").nl()
                    + info.spin.toString().start("SPIN ATTACK:").nl()
                    + info.magazine.toString().start("MAGAZINE:").nl()
                    + info.noise.toString().start("NOISE:").nl()
                    + info.reload.toString().start("RELOAD:").nl()
                    + info.status.toString().start("STATUS:").nl()
                    + info.trigger.toString()
                        .start("TRIGGER:").nl()
                    + info.wall.toString().start("WALL ATTACK:").nl(),
                list: Formatter.dmgTypes(info.dmg_types),
                time: "DPS:".end(info.dps)
            })
        }
        return "No weapon found!"
    }

    static dmgTypes(dmgTypes: number[]): string[] {

        const lookup = [
            "Impact",
            "Puncture",
            "Slash",
            "Heat",
            "Cold",
            "Electricity",
            "Toxic",
            "Blast",
            "Radiation",
            "Gas",
            "Magnetic",
            "Viral",
            "Corrosive",
            "True",
            "Void"
        ]

        return dmgTypes.map((n, i) =>
            n > 0
                ? `${lookup[i] || "Unknown Damage Type"}:`.end(n.toString())
                : "")
            .clean()
    }

    static camelToString(str?: string): string {
        if (str) {
            return str.split(/(?=[A-Z])/g).join(" ").capitalize();
        } return ""
    }

    static warframe(warframe?: wf.searchable.ExportWarframesEntity): string {
        if (!warframe) return "Warframe not found!";
        return Formatter.format({
            caption: Formatter.warframeTitle(warframe),
            text: warframe.health.toString().code().start("Health:".bold()).nl()
                + warframe.shield.toString().code().start("Shield:".bold()).nl()
                + warframe.armor.toString().code().start("Armor:".bold()).nl()
                + warframe.power.toString().code().start("Power:".bold()).nl()
                + warframe.sprintSpeed.toString().code().start("Sprint Speed:".bold()).nl()
                + "Abilities:".bold().nl()
                + (warframe.abilities || [])
                    .map((ab, i) =>
                        `|${i + 1}| ${ab.abilityName.bold()}:\n`
                        + `${ab.description.replace(/[\r\n]+/g, "").clean()}`.indent(6, "|"))
                    .join("\n")
                    .indent(3).nl(),
            description: warframe.description || "",
        })
    }

    static sentinel(sentinel?: wf.searchable.ExportSentinelsEntity): string {
        if (!sentinel) return "Sentinel not found!";
        return Formatter.format({
            caption: Formatter.sentinelTitle(sentinel),
            description: sentinel.description || "",
            subCaption: sentinel.health.toString().start("HEALTH:").nl()
                + sentinel.shield.toString().start("SHIELD:").nl()
                + sentinel.armor.toString().start("ARMOR:").nl()
                + sentinel.power.toString().start("POWER:").nl()
        })
    }

    static mod(mod?: wf.searchable.ExportUpgradesEntity): string {
        if (!mod) return "Mod not found!";
        return Formatter.format({
            caption: Formatter.modTitle(mod),
            subCaption: (mod.description || []).join("\n"),
            description: mod.rarity.capitalize().space()
                + Formatter.polarity(mod.polarity).space()
                + (mod.type || "").capitalize().space()
                + "Mod"
        })
    }

    static polarity(polarityID: string): string {
        switch (polarityID) {
            case "AP_POWER":
                return "Zenurik"
            case "AP_DEFENSE":
                return "Vazarin"
            case "AP_TACTIC":
                return "Naramon"
            case "AP_ATTACK":
                return "Madurai"
            case "AP_WARD":
                return "Unairu"
            case "AP_PRECEPT":
                return "Penjaga"
            case "AP_UMBRA":
                return "Umbra"
            default:
                return "Unknown Polarity"
        }
    }

    static price(price?: wf.searchable.Price): string {
        if (price) {
            return Formatter.format({
                caption: Formatter.priceTitle(price),
                subCaption: (price.Type || "").start("Type:"),
                list: (price.Components || []).map(comp =>
                    comp
                        ? price.Title.end(comp.name.concat(":").end(comp.avg || "Not for sale"))
                        : ""
                )
            })
        } return "No Price found!"
    }

    static drop(drop?: wf.searchable.GroupedDrop): string {
        if (drop) {
            return Formatter.format({
                caption: Formatter.dropTitle(drop),
                list: drop.group.slice(0, 5).map(Formatter.dropInfo)
            })
        } return "No Drop found!"
    }
    static dropInfo(dropInfo?: wf.searchable.DropInfo): string {
        if (dropInfo) {
            return "[".concat(dropInfo.chance.toString()).concat("%]")
                .end(dropInfo.place)
        } return "No Drop Info found!"
    }

    static place(place?: wf.searchable.GroupedPlace): string {
        if (place) {
            return Formatter.format({
                caption: Formatter.placeTitle(place),
                list: place.group.slice(0, 5).map(Formatter.placeInfo)
            })
        } return "No Place found!"
    }
    static placeInfo(placeInfo?: wf.searchable.PlaceInfo): string {
        if (placeInfo) {
            return "[".concat(placeInfo.chance.toString()).concat("%]")
                .end(placeInfo.item)
        } return "No Place Info found!"
    }



    static warframeTitle(warframe: wf.searchable.ExportWarframesEntity): string {
        return "WARFRAME |".end(warframe.name.replace("<ARCHWING>", "💸").clean().capitalize())
    }

    static sentinelTitle(sentinel: wf.searchable.ExportSentinelsEntity): string {
        return "SENTINEL |".end(sentinel.name.replace("<ARCHWING>", "💸").clean().capitalize())
    }

    static weaponTitle(weapon: wf.searchable.ExportWeaponsEntity): string {
        return "WEAPON |".end(weapon.name.replace("<ARCHWING>", "💸").clean().capitalize())
    }

    static modTitle(mod: wf.searchable.ExportUpgradesEntity): string {
        return "MOD |".end(mod.name.replace("<ARCHWING>", "💸").clean().capitalize())
    }

    static priceTitle(price: wf.searchable.Price): string {
        return "PRICE |".end(price.Title.replace("<ARCHWING>", "💸").clean().capitalize())
    }

    static dropTitle(drop: wf.searchable.GroupedDrop): string {
        return "DROP |".end(drop.item.replace("<ARCHWING>", "💸").clean().capitalize())
    }

    static placeTitle(drop: wf.searchable.GroupedPlace): string {
        return "PLACE |".end(drop.place)
    }

    static timeRecord(rec: time.Record): string {
        return Formatter.format({
            caption: rec.mission + ":",
            addCaption: Formatter.clock(rec.minutes * 60 + rec.seconds)
                .end(("[" + Formatter.clock(
                    (rec.minutes * 60 + rec.seconds)
                    - BOT.database.times.missionInSeconds(rec.mission, rec.boss)) + "]")
                    .code()),
            boss: rec.boss,
            subCaption: "Avg: " + Formatter.clock(
                BOT.database.times.missionInSeconds(
                    rec.mission, rec.boss)),
            position: rec.stage
        })
    }

    static format(format: Partial<utils.Format>): string {
        let fixed: utils.Format = {
            boss: format.boss || "",
            caption: format.caption || "",
            addCaption: format.addCaption || "",
            chance: format.chance || "",
            description: format.description || "",
            end: format.end || "",
            faction: format.faction || "",
            list: (format.list || []).clean(),
            position: format.position || "",
            standing: format.standing || "",
            start: format.start || "",
            subCaption: format.subCaption || "",
            time: format.time || "",
            link: format.link || {},
            text: format.text || "",
        };

        return this.position(fixed.position)
            + this.caption(fixed.caption).space().concat(fixed.addCaption).nl()
            + this.link(fixed.link)
            + fixed.text.indent(6).nl()
            + this.subCaption(fixed.subCaption)
            + this.description(fixed.description)
            + this.standing(fixed.standing)
            + this.list(fixed.list)
            + this.chance(fixed.chance)
            + this.faction(fixed.faction)
            + this.boss(fixed.boss)
            + this.time(fixed.time)
            + this.start(fixed.start)
            + this.end(fixed.end)
    }

    static link(link?: { url?: string, text?: string }): string {
        if (!link) return "";
        return (link.text || "").link(link.url).indent(6).nl()
    }

    static clock(seconds?: number): string {
        if (seconds === undefined) return "--m --s";
        const v = seconds > 0 ? "" : "-"
        const min = Math.floor(Math.abs(seconds) / 60);
        const sec = Math.round(Math.abs(seconds) - Math.floor(min) * 60);
        if (min) {
            return `${v}${min}m ${sec}s`
        } else if (sec) {
            return `${v}${sec}s`
        }
        return "0s"
    }

    static position(position?: string | number): string {
        if (!position) return "";
        return position
            .toString()
            .bold()
            .end(".")
            .space();
    }

    static caption(caption?: string): string {
        if (!caption) return "";
        return caption
            .bold();
    }

    static subCaption(subCaption?: string): string {
        if (!subCaption) return "";
        return subCaption
            .clean()
            .limitWidth()
            .indent(6)
            .nl();
    }

    static description(description?: string): string {
        if (!description) return "";
        return description
            .limitWidth()
            .italics()
            .indent(12)
            .nl()
    }

    static standing(standing?: string | number): string {
        if (!standing) return "";
        return standing
            .toString()
            .code()
            .start("Standing:")
            .indent(6)
            .nl()
    }


    static chance(chance?: string | number): string {
        if (!chance) return "";
        return chance
            .toString()
            .end("%")
            .code()
            .nl()
    }

    static faction(faction?: string): string {
        if (!faction) return "";
        return faction
            .bold()
            .start("Faction:")
            .indent(6)
            .nl()
    }

    static boss(boss?: string): string {
        if (!boss) return "";
        return boss
            .bold()
            .start("Boss:")
            .indent(6)
            .nl()
    }

    static time(time?: string | number): string {
        if (!time) return "";
        return time
            .toString()
            .start("[")
            .end("]")
            .code()
            .nl()
    }

    static end(end?: string | number): string {
        if (!end) return "";
        return end
            .toString()
            .fromNow()
            .start("Ends")
            .italics()
            .nl()
    }

    static start(start?: string | number): string {
        if (!start) return "";
        return start
            .toString()
            .fromNow()
            .start("Started")
            .italics()
            .nl()
    }

    static list(rs?: (string | undefined)[]): string {
        if (!rs) return "";
        if (rs.clean().length === 0) return ""
        return rs
            .clean()
            .map(r => r ? r.toUpperCase().code().indent(6) : "")
            .join("\n").nl()
    }

    static cut(str?: string): string[] {
        if (!str) return []
        let idealSplit = this.IDEAL_WIDTH,
            maxSplit = this.MAX_WIDTH,
            lineCounter = 0,
            lineIndex = 0,
            lines = [""],
            ch, i

        for (i = 0; i < str.length; i++) {
            ch = str[i]
            if ((lineCounter >= idealSplit && ch === " ")
                || lineCounter >= maxSplit) {
                lineCounter = -1
                lineIndex++
                lines.push("")
            }
            lines[lineIndex] += ch
            lineCounter++
        }
        return lines.map(line => line.trim()).clean()
    }
}

String.prototype.capitalize = function (this: string) {
    const str = this;
    if (!str) return ""
    return str.split(" ").map(s =>
        s.charAt(0).toUpperCase().concat(
            s.slice(1).toLowerCase()))
        .join(" ")

}

String.prototype.italics = function (this: string) {
    const str = this;
    if (!str) return "";
    switch (BOT.defaults.parse_mode) {
        case "HTML":
            return `<i>${str.clean()}</i>`;
        case "Markdown":
        default:
            return `_${str.clean()}_`;
    }
}

String.prototype.code = function (this: string) {
    const str = this;
    if (!str) return "";
    switch (BOT.defaults.parse_mode) {
        case "HTML":
            return `<code> ${str.clean()} </code>`;
        case "Markdown":
        default:
            return `\`${str.clean()}\``;
    }
}

String.prototype.bold = function (this: string) {
    const str = this;
    if (!str) return "";
    switch (BOT.defaults.parse_mode) {
        case "HTML":
            return `<b>${str.clean()}</b>`;
        case "Markdown":
        default:
            return `*${str.clean()}*`;
    }
}

String.prototype.link = function (this: string, url?: string) {
    const str = this;
    if (!str) return "";
    if (!url) return str;
    switch (BOT.defaults.parse_mode) {
        case "HTML":
            return `<a href="${url}">${str.clean()}</a>`;
        case "Markdown":
        default:
            return `[${str.clean()}](${url})`;
    }
}

String.prototype.clean = function (this: string) {
    const str = this;
    if (!str) return "";
    switch (BOT.defaults.parse_mode) {
        case "HTML":
            return str
                .trim()
                .replace(/</g, "˂")
                .replace(/>/g, "˃")
                .limitWidth();
        case "Markdown":
        default:
            return str
                .replace(/\*/g, "⋆")
                .replace(/`/g, "'")
                .replace(/_/g, "＿")
                .trim()
                .limitWidth();
    }
}

String.prototype.striptags = function (this: string) {
    const str = this;
    if (!str) return "";
    return striptags(str)
}

String.prototype.underline = function (this: string) {
    const str = this;
    if (!str) return "";
    return str.split("").map(c => c + "̲").join("")
}

String.prototype.limitWidth = function (this: string) {
    const str = this;
    if (!str) return "";
    return str
        .split("\n")
        .clean()
        .map(s => Formatter.cut(s))
        .flat()
        .join("\n");
}

String.prototype.alignRight = function (this: string) {
    const str = this;
    if (!str) return "";
    return String.fromCharCode(0x061C) + str;
}

String.prototype.nl = function (this: string) {
    const str = this;
    if (!str) return "";
    return str.concat("\n");
}

String.prototype.space = function (this: string) {
    const str = this;
    if (!str) return "";
    return str.concat(" ");
}

String.prototype.indent = function (this: string, tabs?: number, start?: string) {
    const str = this;
    if (!str) return "";

    const s = str
        .split("\n")
    const c = s.clean()
    const m = c.map(s => (start || "") + "\t".repeat(tabs || 0) + s)
    const f = m.join("\n");
    return f
}

String.prototype.start = function (this: string, start?: string | number) {
    const str = this;
    if (!(str && start)) return "";
    return start.toString().trim().space().end(str.trim())
}

String.prototype.end = function (this: string, end?: string | number) {
    const str = this;
    if (!(str && end)) return "";
    return str.trim().space().concat(end.toString().trim());
}


String.prototype.fromNow = function (this: string) {
    const str = this;
    if (!str) return "";
    return moment(new Date(str)).fromNow()
}

Array.prototype.diff = function (arr: any[]) {
    return this.filter(function (i) { return arr.indexOf(i) < 0; });
};

Array.prototype.clean = function () {
    return this.filter(e => Check.array(e)
        ? Boolean(e.length)
        : Boolean(e));
}
