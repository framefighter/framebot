import idx from 'idx';
import { BOT } from '../..';
import { Compare } from '../../utils/compare';
import { Formatter } from '../../utils/formatter';
import { Inline } from '../message/inline';
import { Message } from '../message/message';
import { Keyboard } from '../keyboard/keyboard';
import { Parse } from '../../utils/parse';
import { spawn } from 'child_process';
import moment from 'moment';
import { Check } from '../../utils/check';
import { CONFIG } from '../../utils/config';
import { Active } from '../active/active';
import { Button } from '../keyboard/button';
import { Converter } from '../song/converter/converter';

export const back = "< Back"

export const btn = (id: command.ID): Button => new Button(id)

export const backTo = (id: command.ID): Button => new Button({
    callback_data: id,
    text: "< " + id,
    alwaysShow: true
})

export const menuBtn = (active: Active): Button => new Button({
    callback_data: active.user.settings.menu[0]
        ? active.user.settings.menu[0][0]
        : "sortie",
    text: back,
    alwaysShow: true,
})

export const moreBtn = (active: Active): Button => new Button({
    text: "More",
    switch_inline_query_current_chat: active.command.id.space().concat(active.args.join(", ")),
    alwaysShow: true
})

export const definitions: command.Definitions = {
    "none": {
        hidden: true,
    },
    "about": {
        emoji: "ℹ️",
        message: (active) => new Message({
            title: active.command.name(active),
            text: [Formatter.format({
                caption: "Creator",
                addCaption: "@ifyoureadthishaveagooddaysmile",
            }), Formatter.format({
                caption: "Bot",
                addCaption: "Source Code",
                link: { url: "https://github.com/framefighter/framebot", text: "GitHub Repo" }
            }), Formatter.format({
                caption: "Feedback",
                link: { url: "https://github.com/framefighter/framebot/issues", text: "Report Issues" }
            })].join("\n")
        })
    },
    "sortie": {
        alt: ["s"],
        help: "Get current Sortie with average completion time",
        jsonKey: "sortie",
        emoji: "💢",
        count: (active) => (idx(active, _ => _.ws.sortie.variants.length) || 0),
        message: (active) => new Message({
            title: active.command.name(active),
            text: Formatter.sortie(active.ws.sortie)
        }),
        inline: (active) => (idx(active, _ => _.ws.sortie.variants) || []).map(mission =>
            new Inline({
                title: mission.missionType || mission.boss || "",
                description: mission.modifier,
            }))
    },
    "fissures": {
        alt: ["fis"],
        help: "Get current Void Fissures",
        jsonKey: "fissures",
        emoji: "✨",
        message: (active) => new Message({
            title: active.command.name(active),
            text: (active.ws.fissures || []).length > 0
                ? BOT.state.filteredByID<wf.Fissure>(active.args, active.command.jsonKey)
                    .sort((a, b) => (a.tierNum || 0) - (b.tierNum || 0))
                    .map(Formatter.fissure)
                    .join("\n")
                : "No Fissures found!"
        }),
        inline: (active) => (idx(active, _ => _.ws.sortie.variants) || []).map(mission =>
            new Inline({
                title: mission.missionType || mission.boss || "",
                description: mission.modifier,
            }))
    },
    "invasions": {
        alt: ["inv"],
        help: "Lists all ongoing Invasions",
        jsonKey: "invasions",
        emoji: "✊",
        message: (active) => new Message({
            title: active.command.name(active),
            text: (active.ws.invasions || []).length > 0
                ? BOT.state.filteredByID<wf.Invasion>(active.args, active.command.jsonKey)
                    .map(Formatter.invasion)
                    .clean()
                    .join("\n\n")
                : "No Invasions found!"
        }),
        rewards: (active) => (active.ws.invasions || [])
            .map(invasion => ({
                id: invasion.id
                    || BOT.database.notifications.generateID(invasion),
                text: Formatter.invasion(invasion),
                rewards: Formatter.invasionRewards(invasion)
            })),
        keyboard: (active) => new Keyboard({
            layout: [[
                btn("invasions"),
                btn("events"),
                btn("alerts")],
            [menuBtn(active)]]
        })
    },
    "events": {
        alt: ["ev"],
        help: "Lists all ongoing Events",
        jsonKey: "events",
        emoji: "📅",
        message: (active) => new Message({
            title: active.command.name(active),
            text: (active.ws.events || []).length > 0
                ? BOT.state.filteredByID<wf.Event>(active.args, active.command.jsonKey)
                    .map(Formatter.event)
                    .clean()
                    .join("\n\n")
                : "No Events found!"
        }),
        rewards: (active) => (active.ws.events || [])
            .filter(event => event.rewards)
            .map(event => ({
                id: event.id
                    || BOT.database.notifications.generateID(event),
                text: Formatter.event(event),
                rewards: (event.rewards || []).map(reward => reward.asString).clean()
            })),
        keyboard: (active) => new Keyboard({
            layout: [[
                btn("invasions"),
                btn("events"),
                btn("alerts")],
            [menuBtn(active)]]
        })
    },
    "news": {
        alt: ["n"],
        help: "Lists recent news",
        jsonKey: "news",
        emoji: "💬",
        count: (active) => (idx(active, _ => _.ws.news.filter(n =>
            Object.keys(n.translations || {})
                .includes("en")).length) || 0),
        message: (active) => {
            const englishNews = BOT.state.filteredByID<wf.News>(active.args, active.command.jsonKey)
                .sort((a, b) => Compare.dates(a.date, b.date))
                .filter(n =>
                    Object.keys(n.translations || {})
                        .includes("en"));
            if (englishNews.length > 0) {
                return new Message({
                    title: active.command.name(active),
                    text: englishNews.clean()
                        .map(Formatter.newsEvent)
                        .clean()
                        .join("\n")
                });
            }
            return new Message("")
        },
        inline: (active) => (active.ws.news || []).length > 0
            ? (active.ws.news || [])
                .sort((a, b) => Compare.dates(a.date, b.date))
                .filter(n =>
                    Object.keys(n.translations || {})
                        .includes("en"))
                .map(n => new Inline({
                    title: n.message || n.asString || "",
                    description: n.eta,
                    thumb_url: n.imageLink,
                    url: n.link
                }))
            : [new Inline({
                title: "No News found!",
                description: "Try again later!"
            })],
        keyboard: (active) => new Keyboard({
            layout: [[btn("updates")], [menuBtn(active)]]
        })
    },
    "updates": {
        alt: ["u"],
        help: "Lists recent updates",
        jsonKey: "news",
        emoji: "📰",
        count: (active) => (idx(active, _ => _.ws.news.filter(n =>
            Object.keys(n.translations || {})
                .includes("en")
            && n.update).length) || 0),
        message: (active) => {
            const englishNews = BOT.state.filteredByID<wf.News>(active.args, active.command.jsonKey)
                .sort((a, b) => Compare.dates(a.date, b.date))
                .filter(n =>
                    Object.keys(n.translations || {})
                        .includes("en") && n.update);
            if (englishNews.length > 0) {
                return new Message({
                    title: active.command.name(active),
                    text: englishNews.clean()
                        .map(Formatter.newsEvent)
                        .clean()
                        .join("\n")
                });
            }
            return new Message("")
        },
        inline: (active) => (active.ws.news || []).length > 0
            ? (active.ws.news || [])
                .sort((a, b) => Compare.dates(a.date, b.date))
                .filter(n =>
                    Object.keys(n.translations || {})
                        .includes("en")
                    && n.update)
                .map(n => new Inline({
                    title: n.message || n.asString || "",
                    description: n.eta,
                    thumb_url: n.imageLink,
                    url: n.link
                }))
            : [new Inline({
                title: "No updates found!",
                description: "Try again later"
            })],
        keyboard: (active) => new Keyboard({
            layout: [[btn("news")], [menuBtn(active)]]
        })
    },
    "trader": {
        alt: ["tr"],
        help: "Get Baro Ki'Teer status",
        jsonKey: "voidTrader",
        emoji: "💱",
        count: (active) => (idx(active, _ => _.ws.voidTrader.inventory.length) || 0),
        message: (active) => new Message({
            title: active.command.name(active),
            text: Formatter.trader(active.ws.voidTrader)
        }),
        inline: active => idx(active, _ =>
            [new Inline({
                title: _.ws.voidTrader.character
                    .end(_.ws.voidTrader.active ? "is at" : "will be at")
                    .end(_.ws.voidTrader.location) || "",
                description: _.ws.voidTrader.active
                    ? "Departs in".end(_.ws.voidTrader.endString)
                    : "Arrives in".end(_.ws.voidTrader.startString),
                text: Formatter.trader(active.ws.voidTrader)
            })].concat((_.ws.voidTrader.inventory || [])
                .map(inv => new Inline({
                    title: inv.item,
                    description: `${inv.ducats}d | ${inv.credits}c`,
                    text: Formatter.trader(active.ws.voidTrader)
                })))
        ) || [],
        rewards: (active) => idx(active, _ =>
            [{
                id: _.ws.voidTrader.id,
                text: Formatter.trader(active.ws.voidTrader),
                rewards: (_.ws.voidTrader.inventory || []).map(inv => inv.item),
            }]
        ) || []
    },
    "boosters": {
        alt: ["boost"],
        help: "Show active global boosters",
        jsonKey: "globalUpgrades",
        emoji: "🚀",
        message: (active) => new Message({
            title: active.command.name(active),
            text: (active.ws.globalUpgrades || []).length > 0
                ? BOT.state.filteredByID<wf.GlobalUpgrade>(active.args, active.command.jsonKey)
                    .filter(boost => !boost.expired)
                    .map(boost =>
                        Formatter.format({
                            caption: (boost.upgradeOperationValue || "").toString()
                                .concat(boost.operationSymbol || "")
                                .end(boost.upgrade),
                            description: boost.desc,
                            end: boost.end
                        })).join("\n")
                : "No Boosters found!"
        }),
        inline: (active) => (active.ws.globalUpgrades || []).length > 0
            ? (active.ws.globalUpgrades || [])
                .filter(boost => !boost.expired)
                .map(boost =>
                    new Inline({
                        title: (boost.upgradeOperationValue || "").toString()
                            .concat(boost.operationSymbol || "")
                            .end(boost.upgrade),
                        description: boost.eta
                    }))
            : [new Inline({
                title: "No Boosters found!",
                description: "Try again later"
            })]
    },
    "nightwave": {
        alt: ["nw"],
        help: "Lists all active nightwave missions",
        jsonKey: "nightwave",
        emoji: "🌊",
        count: (active) => (idx(active, _ =>
            _.ws.nightwave.activeChallenges.length) || 0),
        message: (active) =>
            new Message({
                title: active.command.name(active),
                text: idx(active, _ => ("Season:".end(
                    _.ws.nightwave.season.toString()
                        .concat(".")
                        .concat(_.ws.nightwave.phase.toString())
                        .code()).nl()
                    + _.ws.nightwave.expiry.toString()
                        .fromNow()
                        .start("Ends")
                        .italics().nl().nl()
                    + (_.ws.nightwave.activeChallenges || [])
                        .filter(challenge => active.args.length > 0
                            ? active.args.includes(challenge.id)
                            : true)
                        .map(Formatter.nightwave).join("\n")))
                    || "No Nightwave found!"
            }),
        inline: (active) => (idx(active, _ => _.ws.nightwave.activeChallenges) || [])
            .map(ch => new Inline({
                title: Formatter.nightwaveType(ch).start("[" + ch.reputation + "]") + ch.title,
                description: ch.desc.nl() + ch.expiry.toString().fromNow().start("Ends"),
                text: Formatter.nightwave(ch)
            }))
    },
    "cetus": {
        alt: ["c"],
        help: "Get Cetus day/night cycle information",
        jsonKey: "cetusCycle",
        name: (active) => idx(active, _ => _.ws.cetusCycle.isDay)
            ? "☀️ Cetus"
            : "🌙 Cetus",
        message: (active) => {
            return new Message({
                title: active.command.name(active),
                text: idx(active, _ => Formatter.format({
                    caption: `It is currently ${_.ws.cetusCycle.state.toUpperCase()} on the Plains of Eidolon!`,
                    subCaption: _.ws.cetusCycle.shortString,
                    link: {
                        text: "Fishing Map",
                        url: "https://vignette.wikia.nocookie.net/warframe/images/4/4b/Fishingmap.png/revision/latest?cb=20181111120029"
                    }
                })) || "No Cetus Information Found!"
            })
        },
        keyboard: "cycles"
    },
    "vallis": {
        alt: ["v"],
        help: "Get Vallis warm/cold cycle information",
        jsonKey: "vallisCycle",
        name: (active) => idx(active, _ =>
            _.ws.vallisCycle.isWarm)
            ? "🔥 Vallis"
            : "❄️ Vallis",
        message: (active) => new Message({
            title: active.command.name(active),
            text: idx(active, _ => Formatter.format({
                caption: `It is currently ${_.ws.vallisCycle.state.toUpperCase()} in Orb Vallis!`,
                subCaption: _.ws.vallisCycle.shortString,
                link: {
                    text: "Fishing Map",
                    url: "https://vignette.wikia.nocookie.net/warframe/images/6/6f/FortunaFishingMap.jpg/revision/latest?cb=20181113071342"
                }
            })) || "No Vallis Information Found!"
        }),
        keyboard: "cycles"
    },
    "earth": {
        alt: ["e"],
        help: "Get Earth day/night cycle information",
        jsonKey: "earthCycle",
        name: (active) => idx(active, _ =>
            _.ws.earthCycle.isDay)
            ? "☀️️ Earth"
            : "🌙 Earth",
        message: (active) => new Message({
            title: active.command.name(active),
            text: idx(active, _ => Formatter.format({
                caption: `It is currently ${_.ws.earthCycle.state.toUpperCase()} on Earth!`,
            })) || "No Earth Information Found!"
        }),
        keyboard: "cycles"
    },
    "cycles": {
        emoji: "🌄",
        help: "Get All day/night cycle information",
        message: (active) => {
            const cetus = BOT.commands.fromID("cetus");
            const vallis = BOT.commands.fromID("vallis");
            const earth = BOT.commands.fromID("earth");
            const cetusMSg = cetus.message(active).text;
            const vallisMSg = vallis.message(active).text;
            const earthMSg = earth.message(active).text;
            return new Message({
                title: active.command.name(active),
                text: (cetusMSg || "").nl()
                    + (vallisMSg || "").nl()
                    + (earthMSg || "").nl()
            })
        },
        keyboard: (active) => new Keyboard({
            layout: [
                [btn("cetus"), btn("vallis"), btn("earth")],
                [menuBtn(active)]]
        })
    },
    "arbitration": {
        alt: ["arb"],
        help: "Get active arbitration mission",
        // jsonKey: "arbitration",
        emoji: "💀",
        message: (active) => {
            if (active.args.length > 0) {
                if (Compare.exact(active.user.settings.arbitration,
                    idx(BOT.extra, _ => _.arbitration.type) || "")) {
                    return new Message({
                        title: active.command.name(active),
                        text: Formatter.arbitration(BOT.extra.arbitration)
                    })
                } else {
                    return new Message("")
                }
            } else {
                return new Message({
                    title: active.command.name(active),
                    text: Formatter.arbitration(BOT.extra.arbitration)
                })
            }
        },
        rewards: (active) => [{
            id: BOT.database.notifications.generateID(BOT.extra.arbitration, active.command.id),
            text: Formatter.arbitration(BOT.extra.arbitration),
            rewards: [idx(BOT.extra, _ => _.arbitration.type),
                "Credits",
                "vitus essence"].clean()
        }]
    },
    "alerts": {
        alt: ["al"],
        help: "Get active alerts",
        jsonKey: "alerts",
        emoji: "❗",
        message: (active) => new Message({
            title: active.command.name(active),
            text: (active.ws.alerts || []).length > 0
                ? BOT.state.filteredByID<wf.Alert>(active.args, active.command.jsonKey)
                    .map(Formatter.alert).join("\n")
                : "No Alerts found!"
        }),
        inline: (active) => (active.ws.alerts || []).length > 0
            ? (active.ws.alerts || [])
                .map(alert =>
                    new Inline({
                        title: idx(alert, _ => _.mission.type) || "",
                        text: Formatter.alert(alert),
                    }))
            : [new Inline({
                title: "No Alerts found!",
                description: "Try again later"
            })],
        rewards: (active) => (active.ws.alerts || []).map(alert =>
            ({
                id: alert.id || BOT.database.notifications.generateID(alert),
                text: Formatter.alert(alert),
                rewards: idx(alert, _ => [_.mission.reward.asString]) || []
            })).clean(),
        keyboard: (active) => new Keyboard({
            layout: [[btn("invasions"), btn("events"), btn("alerts")],
            [menuBtn(active)]]
        })
    },
    "settings": {
        alt: ["options"],
        help: "Change all settings",
        emoji: "⚙️",
        count: (active) => BOT.commands.fromID("settings").keyboard(active).layout.length - 1,
        message: (active) => new Message({
            title: active.command.name(active),
            text: Formatter.format({
                caption: "Available settings",
                description: "Select which setting to change!",
            })
        }),
        keyboard: (active) => new Keyboard({
            layout: [
                [btn("alertSettings")],
                [btn("filter")],
                [btn("arbitrationFilter")],
                [btn("config")],
                [btn("songs")],
                [active.user.admin ? (btn("restart")) : btn("none")],
                [menuBtn(active)],
            ]
        })
    },
    "filter": {
        alt: ["items", "add"],
        help: "Lists all filter keywords",
        emoji: "💡",
        count: (active) => active.user.settings.filter.length,
        action: (active) =>
            active.args.filter(arg => {
                if (arg.length > 50) {
                    return false
                }
                if (active.user.settings.filter.includes(arg)) {
                    return false
                } else {
                    active.user.settings.filter.push(arg);
                    return true
                }
            }),
        message: (active) => new Message({
            title: active.command.name(active),
            text: Formatter.format({
                caption: "Stored filter keywords",
                description: (active.execute_return || []).length !== 0
                    ? "Newly added:"
                    : active.user.settings.filter.length > 0
                        ? "Add with /add <item>\nRemove with /remove <item>\n\nClick below to filter active happenings with selected keyword!"
                        : "No filter keywords to add",
                list: active.execute_return
            }),
        }),
        keyboard: (active) => new Keyboard({
            layout: active.user.settings.filter.map<keyboard.Button[]>(item => [
                new Button({
                    callback_data: "check",
                    args: [item],
                    text: item
                })]).concat([[
                    backTo("settings"),
                    btn("removeItems")]])
        })
    },
    "removeItems": {
        alt: ["rm", "remove"],
        help: "Remove filter keywords from your storage",
        emoji: "➖",
        name: () => "Remove Items",
        action: (active) =>
            active.args.filter(arg => {
                if (active.user.settings.filter.includes(arg)) {
                    active.user.settings.filter = active.user.settings.filter.filter(item => item !== arg)
                    return true
                } else {
                    return false
                }
            }),
        message: (active) => new Message({
            title: active.command.name(active),
            text: Formatter.format({
                description: (active.execute_return || []).length !== 0
                    ? "Removed:"
                    : active.user.settings.filter.length > 0
                        ? "Click below to delete filter keywords"
                        : "No filter keywords to delete",
                list: active.execute_return
            }),
        }),
        keyboard: (active) => new Keyboard({
            layout: active.user.settings.filter.map<keyboard.Button[]>(item => [
                new Button({
                    callback_data: "askRemove",
                    args: [item],
                    text: item
                })]).concat([[backTo("filter")]])
        })
    },
    "askRemove": {
        hidden: true,
        help: "Ask if you want to delete filter keyword",
        emoji: "🗑️",
        message: (active) => new Message({
            title: active.command.name(active),
            text: Formatter.format({
                caption: "Do you really want to remove this item!",
                list: active.args
            })
        }),
        keyboard: (active) => new Keyboard({
            layout: [[
                new Button({
                    callback_data: "removeItems",
                    args: [active.args[0]],
                    text: "🗑️️️️ Remove"
                }),
                new Button({
                    callback_data: "removeItems",
                    text: "❌ Cancel"
                })
            ]]
        })
    },
    "alertSettings": {
        alt: ["alertOptions"],
        help: "Change all alert settings",
        emoji: "🔔",
        count: (active) => BOT.commands.list
            .filter(c => c.jsonKey)
            .filter(c => active.user.settings.alert[c.id])
            .length,
        action: (active) => {
            const id = active.args[0];
            if (id) {
                active.user.settings.alert[id] = !active.user.settings.alert[id];
                return active.user.settings.alert[id];
            }
        },
        message: () => new Message({
            title: "Alert settings",
            text: Formatter.format({
                caption: "Available alert settings",
                description: "Use the buttons below to change your settings!",
            })
        }),
        keyboard: (active) => new Keyboard({
            layout: [
                [{ callback_data: "allAlertsSettingsOn", alwaysShow: true },
                { callback_data: "allAlertsSettingsOff", alwaysShow: true }],
                ...BOT.commands.list.filter(c => c.jsonKey).map<keyboard.Button[]>(cmd => {
                    const toggleBtn = btn(cmd.id);
                    return active.user.settings.alert[cmd.id]
                        ? [toggleBtn, new Button({
                            callback_data: "alertSettings",
                            args: [cmd.id],
                            text: ">"
                        })]
                        : [new Button({
                            callback_data: "alertSettings",
                            args: [cmd.id],
                            text: "<"
                        }), toggleBtn]
                }),
                [backTo("settings")]
            ]
        })
    },
    "allAlertsSettingsOn": {
        emoji: "🔊",
        name: () => "On",
        action: (active) => {
            BOT.commands.list.filter(c => c.jsonKey).forEach(cmd =>
                active.user.settings.alert[cmd.id] = true
            )
        },
        message: "alertSettings",
        keyboard: "alertSettings",
    },
    "allAlertsSettingsOff": {
        emoji: "🔈",
        name: () => "Off",
        action: (active) => {
            BOT.commands.list.filter(c => c.jsonKey).forEach(cmd =>
                active.user.settings.alert[cmd.id] = false
            )
        },
        message: "alertSettings",
        keyboard: "alertSettings",
    },
    "arbitrationFilter": {
        alt: ["adda", "rma"],
        help: "Filter arbitrations by mission type",
        emoji: "💀",
        count: (active) => active.user.settings.arbitration.length,
        action: (active) =>
            active.args.map(arg => {
                if (arg.clean().length > 50) {
                    return "Cannot add " + arg.clean() + " to long"
                }
                if (active.user.settings.arbitration.includes(arg)) {
                    active.user.settings.arbitration =
                        active.user.settings.arbitration.filter(item => item !== arg)
                    return "Removed " + arg.clean()
                } else {
                    active.user.settings.arbitration.push(arg);
                    return "Added " + arg.clean()
                }
            }),
        message: (active) => new Message({
            title: active.command.name(active),
            text: Formatter.format({
                caption: "Stored arbitration types",
                text: "Add/Remove with".nl() + `/${active.command.id} <missionType>`.code(),
                description: active.user.settings.arbitration.length > 0
                    ? "Click below to remove mission types!"
                    : "",
                list: active.execute_return
            }),
        }),
        keyboard: (active) => new Keyboard({
            layout: active.user.settings.arbitration.map<keyboard.Button[]>(item => [
                new Button({
                    callback_data: "arbitrationFilter",
                    args: [item],
                    text: item
                })]).concat([[backTo("settings")]])
        })
    },
    "sortieTimes": {
        alt: ["st"],
        help: "Get the average completion time for every Sortie mission",
        emoji: "🕒",
        count: () => BOT.database.times.list.length,
        message: (active) => new Message({
            title: active.command.name(active),
            text: Formatter.timesString(active.args)
        }),
        inline: (active) => Object.keys(BOT.database.times.avg())
            .filter(key => active.args.length > 0
                ? Compare.loose(key, active.args) : true)
            .map(key => {
                const avg = BOT.database.times.avg()[key];
                return new Inline({
                    title: avg.mission,
                    description: Formatter.clock(avg.seconds)
                })
            })
    },
    "findWeapon": {
        alt: ["weapon"],
        help: "Search for any weapon",
        emoji: "🔫",
        message: (active) => new Message({
            title: active.command.name(active),
            text: active.args.map(arg =>
                BOT.info.weapons
                    ? (BOT.info.weapons || [])
                        .filter(weapon =>
                            weapon.name.toUpperCase().includes(arg.toUpperCase()))
                        .slice(0, 2)
                        .map(Formatter.weapon)
                        .join("\n")
                    : ""
            ).slice(0, 2).join("\n") || "No Weapons found!"
        }),
        inline: (active) => active.args.map(arg =>
            BOT.info.weapons
                ? (BOT.info.weapons || [])
                    .filter(weapon =>
                        weapon.name.toUpperCase().includes(arg.toUpperCase()))
                    .map(weapon => new Inline({
                        title: Formatter.weaponTitle(weapon),
                        description: weapon.description || "",
                        text: Formatter.weapon(weapon),
                        thumb_url: Parse.thumbUrl(weapon.uniqueName),
                        item: weapon.name
                    }))
                : ""
        ).flat(),
        keyboard: (active) => new Keyboard({
            layout: [[moreBtn(active)]]
        })
    },
    "findWarframe": {
        alt: ["warframe"],
        help: "Search for any warframe",
        emoji: "🤖",
        message: (active) => new Message({
            title: active.command.name(active),
            text: active.args.map(arg =>
                BOT.info.warframes
                    ? (BOT.info.warframes || [])
                        .filter(warframe =>
                            warframe.name.toUpperCase().includes(arg.toUpperCase()))
                        .slice(0, 2)
                        .map(Formatter.warframe)
                        .join("\n")
                    : ""
            ).slice(0, 2).join("\n") || "No Warframes found!"
        }),
        inline: (active) => active.args.map(arg =>
            BOT.info.warframes
                ? (BOT.info.warframes || [])
                    .filter(warframe =>
                        warframe.name.toUpperCase().includes(arg.toUpperCase()))
                    .map(warframe => new Inline({
                        title: Formatter.warframeTitle(warframe),
                        description: warframe.description,
                        text: Formatter.warframe(warframe),
                        thumb_url: Parse.thumbUrl(warframe.uniqueName),
                        item: warframe.name
                    }))
                : ""
        ).flat(),
        keyboard: (active) => new Keyboard({
            layout: [[moreBtn(active)]]
        })
    },
    "findMod": {
        alt: ["mod"],
        help: "Search for any mod",
        emoji: "🃏",
        message: (active) => new Message({
            title: active.command.name(active),
            text: active.args.map(arg =>
                BOT.info.mods
                    ? (BOT.info.mods || [])
                        .filter(mod =>
                            mod.name.toUpperCase().includes(arg.toUpperCase()))
                        .slice(0, 2)
                        .map(Formatter.mod)
                        .join("\n")
                    : ""
            ).slice(0, 2).join("\n") || "No Mods found!"
        }),
        inline: (active) => active.args.map(arg =>
            BOT.info.mods
                ? (BOT.info.mods || [])
                    .filter(mod =>
                        mod.name.toUpperCase().includes(arg.toUpperCase()))
                    .map(mod => new Inline({
                        title: Formatter.modTitle(mod),
                        description: (mod.description || []).join(". "),
                        text: Formatter.mod(mod),
                        thumb_url: Parse.thumbUrl(mod.uniqueName),
                        item: mod.name
                    }))
                : ""
        ).flat(),
        keyboard: (active) => new Keyboard({
            layout: [[moreBtn(active)]]
        })
    },
    "findSentinel": {
        alt: ["sentinel"],
        help: "Search for any sentinel",
        emoji: "🐈",
        message: (active) => new Message({
            title: active.command.name(active),
            text: active.args.map(arg =>
                BOT.info.sentinels
                    ? (BOT.info.sentinels || [])
                        .filter(sentinel =>
                            sentinel.name.toUpperCase().includes(arg.toUpperCase()))
                        .slice(0, 2)
                        .map(Formatter.sentinel)
                        .join("\n")
                    : ""
            ).slice(0, 2).join("\n") || "No Sentinels found!"
        }),
        inline: (active) => active.args.map(arg =>
            BOT.info.sentinels
                ? (BOT.info.sentinels || [])
                    .filter(sentinel =>
                        sentinel.name.toUpperCase().includes(arg.toUpperCase()))
                    .map(sentinel => new Inline({
                        title: Formatter.sentinelTitle(sentinel),
                        description: sentinel.description,
                        text: Formatter.sentinel(sentinel),
                        thumb_url: Parse.thumbUrl(sentinel.uniqueName),
                        item: sentinel.name
                    }))
                : ""
        ).flat(),
        keyboard: (active) => new Keyboard({
            layout: [[moreBtn(active)]]
        })
    },
    "price": {
        alt: ["pc"],
        help: "Check a price for any tradable item",
        emoji: "💰",
        message: (active) => new Message({
            title: active.command.name(active),
            text: active.args.map(arg =>
                (BOT.info.prices || [])
                    .filter(price =>
                        price.Title.toUpperCase().includes(arg.toUpperCase()))
                    .slice(0, 2)
                    .map(Formatter.price)
                    .join("\n")
            ).slice(0, 2).join("\n") || "No Prices found!"
        }),
        inline: (active) => active.args.map(arg =>
            (BOT.info.prices || [])
                .filter(price =>
                    price.Title.toUpperCase().includes(arg.toUpperCase()))
                .map(price => new Inline({
                    title: Formatter.priceTitle(price),
                    description: (price.Components || []).map(comp =>
                        comp ? comp.name.concat(":").end(comp.avg || "Not for sale") : "")
                        .join(", "),
                    text: Formatter.price(price),
                    item: price.Title
                }))
        ).flat(),
        keyboard: (active) => new Keyboard({
            layout: [[moreBtn(active)]]
        })
    },
    "drop": {
        alt: ["chance"],
        help: "Search for any item drop chance",
        emoji: "💧",
        message: (active) => new Message({
            title: active.command.name(active),
            text: active.args.map(arg =>
                (BOT.info.drops || [])
                    .filter(drop =>
                        drop.item.toUpperCase().includes(arg.toUpperCase()))
                    .slice(0, 2)
                    .map(Formatter.drop)
                    .join("\n")
            ).slice(0, 2).join("\n") || "No Drops found!"
        }),
        inline: (active) => active.args.map(arg =>
            (BOT.info.drops || [])
                .filter(drop =>
                    drop.item.toUpperCase().includes(arg.toUpperCase())
                )
                .map(drop => new Inline({
                    title: Formatter.dropTitle(drop),
                    description: drop.group.slice(0, 1).map(Formatter.dropInfo).join("\n"),
                    text: Formatter.drop(drop),
                    item: drop.item
                }))
        ).flat(),
        keyboard: (active) => new Keyboard({
            layout: [[moreBtn(active)]]
        })
    },
    "place": {
        alt: ["location", "relic"],
        help: "Search for any mission, relic or enemy for dropped items",
        emoji: "🥇",
        message: (active) => new Message({
            title: active.command.name(active),
            text: active.args.map(arg =>
                (BOT.info.places || [])
                    .filter(drop =>
                        drop.place.toUpperCase().includes(arg.toUpperCase()))
                    .slice(0, 2)
                    .map(Formatter.place)
                    .join("\n")
            ).slice(0, 2).join("\n") || "No Places found!"
        }),
        inline: (active) => active.args.map(arg =>
            (BOT.info.places || [])
                .filter(place =>
                    place.place.toUpperCase().includes(arg.toUpperCase())
                )
                .map(place => new Inline({
                    title: Formatter.placeTitle(place),
                    description: place.group.slice(0, 1).map(Formatter.placeInfo).join("\n"),
                    text: Formatter.place(place),
                    item: place.place
                }))
        ).flat(),
        keyboard: (active) => new Keyboard({
            layout: [[moreBtn(active)]]
        })
    },
    "find": {
        alt: ["f"],
        help: "Universal search for warframes, weapons, mods, drops, prices",
        emoji: "🔎",
        message: (active) => new Message({
            title: active.command.name(active),
            text: "Only usable in inline Mode"
        }),
        inline: (active) => {
            const modCmd = BOT.commands.fromID("findMod")
            const warframeCmd = BOT.commands.fromID("findWarframe")
            const weaponCmd = BOT.commands.fromID("findWeapon")
            const priceCmd = BOT.commands.fromID("price")
            const dropCmd = BOT.commands.fromID("drop")
            const sentinelCmd = BOT.commands.fromID("findSentinel")
            const placeCmd = BOT.commands.fromID("place")
            return warframeCmd.inline(active)
                .concat(weaponCmd.inline(active))
                .concat(modCmd.inline(active))
                .concat(dropCmd.inline(active))
                .concat(priceCmd.inline(active))
                .concat(sentinelCmd.inline(active))
                .concat(placeCmd.inline(active))

        },
        keyboard: (active) => new Keyboard({
            layout: [[moreBtn(active)]]
        })
    },
    "check": {
        help: "Check if filter keywords are rewards from any active happenings",
        emoji: "☑️",
        count: (active) => {
            return BOT.commands.fromID("check").inline(active).length
        },
        message: (active) => new Message({
            title: active.command.name(active),
            text: BOT.commands.list
                .map(cmd => Check.rewards(cmd.rewards(active),
                    active.args.length > 0
                        ? active.args
                        : active.user.settings.filter
                            .concat(active.user.settings.arbitration))
                    .map(reward => ("Found " + cmd.name(active) + ":").bold()
                        .nl()
                        .concat(reward.text))
                    .clean()
                    .join("\n")
                )
                .clean()
                .join("\n\n")
                || Formatter.format({
                    caption: "Nothing found with active filter!",
                    list: (active.args.length > 0
                        ? active.args
                        : active.user.settings.filter.concat(active.user.settings.arbitration)),
                    text: "Add new keywords with /add <keyword> [, keyword...]",
                    description: "Keywords:"
                })
        }),
        inline: (active) => BOT.commands.list
            .map(cmd =>
                cmd.rewards(active)
                    .filter(reward => !!reward.text)
                    .filter(reward =>
                        active.args.length > 0
                            ? active.args.some(arg =>
                                Compare.loose(arg, reward.rewards))
                            : active.user.settings.filter
                                .concat(active.user.settings.arbitration)
                                .some(item =>
                                    Compare.loose(item, reward.rewards))
                    )
                    .map(reward => new Inline({
                        title: cmd.name(active),
                        description: reward.rewards.clean().join(", "),
                        text: cmd.name(active)
                            .nl()
                            .concat(reward.text)
                    }))
                    .clean()
            )
            .clean()
            .flat()
    },
    "admin": {
        alt: ["op"],
        help: "[PASSWORD PROTECTED] Make user to admin",
        emoji: "🔒",
        action: (active) => {
            const password = active.args[0];
            const username = active.args[1];
            if (password && username) {
                if (password === CONFIG.password) {
                    const userFromDB = BOT.database.users.getByName(username)
                    if (userFromDB) {
                        if (!userFromDB.admin) {
                            userFromDB.admin = true;
                            BOT.database.users.update(userFromDB);
                            return `${username} is now an admin!`
                        } else {
                            return `${username} already is an admin!`
                        }
                    } else {
                        return `${username} never used the bot before!`
                    }
                } else {
                    return `Incorrect password (${password})!`
                }
            } else {
                return `Please provide password and username!`
            }
        },
        message: (active) => new Message({
            title: active.command.name(active),
            text: active.execute_return || "Something went wrong, try again!"
        })
    },
    "time": {
        alt: ["t"],
        help: "[ADMIN] Record new time for Sortie",
        adminOnly: true,
        emoji: "⏱",
        action: (active) => {
            const sortie = active.ws.sortie;
            if (sortie) {
                return (sortie.variants || []).map((mission, i) => {
                    if (mission.missionType) {
                        const { min, sec } = Parse.time(active.args[i])
                        if (min || sec) {
                            const time: time.Record = {
                                mission: mission.missionType,
                                minutes: min,
                                seconds: sec,
                                boss: Check.assassination(mission.missionType)
                                    ? sortie.boss
                                    : undefined,
                                date: moment().unix(),
                                stage: i + 1
                            }
                            BOT.database.times.add(time);
                            return time;
                        }
                    }
                }).clean()
            }
        },
        message: (active) => new Message({
            title: active.command.name(active),
            text: (active.execute_return as time.Record[] || []).length > 0
                ? (active.execute_return as time.Record[] || [])
                    .map(Formatter.timeRecord)
                    .join("\n")
                : active.user.admin ? "No Times to add!" : "Admin rights required!"
        }),
        inline: (active) => {
            const missions = (idx(active, _ => _.ws.sortie.variants) || []);
            const recorded: boolean[] = []
            const recs: Inline[] = []
            missions.map((mission, i) => {
                const { min, sec } = Parse.time(active.args[i])
                const missionStr = " | "
                    + "Stage: " + (i + 1) + ": "
                    + mission.missionType
                    + (Check.assassination(mission.missionType)
                        ? idx(active, _ => " > " + _.ws.sortie.boss) || ""
                        : "");
                if (min || sec) {
                    const rec: time.Record = {
                        mission: mission.missionType,
                        minutes: min || 0,
                        seconds: sec || 0,
                        boss: Check.assassination(mission.missionType)
                            ? (idx(active, _ => _.ws.sortie.boss) || "")
                            : undefined,
                        date: moment().unix(),
                        stage: i + 1
                    }
                    const args: string[] = []
                    args[i] = active.args[i]
                    recs.push(new Inline({
                        title: Formatter.clock(rec.seconds + rec.minutes * 60) + missionStr,
                        description: "Click to save only this time!",
                        text: Formatter.timeRecord(rec),
                        keyboard: new Keyboard({
                            layout: [[{
                                callback_data: "time",
                                args: args,
                                text: "Save"
                            }], [menuBtn(active)]]
                        })
                    }));
                    recorded.push(true)
                } else {
                    recs.push(new Inline({
                        title: Formatter.clock() + missionStr,
                        description: mission.modifier,
                        text: `No Time for stage ${i + 1}!`,
                        keyboard: new Keyboard({
                            layout: [[{
                                switch_inline_query_current_chat: "time ",
                                text: "Go Again!"
                            }]]
                        })
                    }));
                    recorded.push(false)
                }
            })
            const saveAll = new Inline({
                title: "Save all times!",
                description: "Click here to save all recorded times!",
                text: Formatter.format({
                    caption: "Click below to Save these times to database!",
                    text: recs.map(inl => inl.text).join("\n")
                }),
                keyboard: new Keyboard({
                    layout: [[{
                        callback_data: "time",
                        args: active.args,
                        text: "Save All"
                    }], [menuBtn(active)]]
                })
            })
            if (recorded.every(r => r)) {
                recs.push(saveAll)
            }
            return recs;
        }
    },
    "restart": {
        help: "[ADMIN] Restart bot",
        adminOnly: true,
        emoji: "🔄",
        action: (active) => {
            const re = spawn(
                `bash bash/restart.sh`,
                { shell: true });
            re.stdout.on("data", o => active.send(`ℹ️ INFO`.bold().nl() + `${o}`.code()));
            re.stderr.on("data", o => active.send(`⚠️ WARNING`.bold().nl() + `${o}`.code()));
            re.on("exit", () =>
                active.send(`Finished Restarting Session!\nStarting Bot (Only takes a few seconds)`));
        },
        message: (active) => new Message({
            title: active.command.name(active),
            text: active.user.admin
                ? "Restarting..."
                : "You need admin rights to do this!"
        }),
        inline: () => [new Inline({
            title: "Not usable inline",
            description: "Click to execute with /restart",
            text: "/restart",
        })],
        keyboard: () => new Keyboard()
    },
    "start": {
        alt: ["hello"],
        help: "Get greetings and introduction from bot",
        emoji: "🏁",
        message: (active) => new Message({
            title: active.command.name(active),
            text: Formatter.format({
                caption: "Hello Tenno!",
                subCaption: "This bot 🤖 connect warframe happenings with telegram, so you'll never miss another event!\nGet a list of all commands with inline mode or click /help .\n",
                description: "Features:",
                list: [
                    "- Get automatic messages for nearly every happening (sortie, events, invasions, alerts, etc)",
                    "- Search for warframe, weapons, mods, drop chances, market prices with one simple command",
                    "- Save custom keywords and filter your notifications",
                    "- Average completion time of the current Sortie",
                    "- Fishing maps for open worlds directly in Telegram",
                    "- Every command also works inline, like @pic or @gif, for easy sharing",
                ],
            })
        }),
        keyboard: (active) => new Keyboard({
            layout: [[menuBtn(active), btn("help")],
            [btn("settings"), new Button({
                text: "Inline Mode",
                switch_inline_query_current_chat: ""
            })]]
        })
    },
    "help": {
        alt: ["h"],
        help: "Lists all commands and help text",
        emoji: "🆘",
        message: (active) => new Message({
            title: active.command.name(active),
            text: BOT.commands.list
                .map(cmd => Formatter.format({
                    caption: ["/" + cmd.id.clean(), ...cmd.alt].join(" | /"),
                    subCaption: cmd.help
                })).join("\n")
        })
    },
    "all": {
        emoji: "📑",
        help: "Lists all information",
        message: (active) => new Message({
            title: "All commands",
            text: "/" + BOT.commands.list
                .map(cmd => cmd.id).join(", /")
        }),
        keyboard: (active) => {
            const cmd_s = BOT.commands.list;
            const layout: keyboard.Button[][] = [];
            const width = 3;
            for (let cmd of cmd_s) {
                if (cmd.privileged(active.user.from)) {
                    const last = layout.pop()
                    const curr = btn(cmd.id);
                    if (!last) {
                        layout.push([curr]);
                    } else if (last.length === width) {
                        layout.push(last);
                        layout.push([curr]);
                    } else if (last.length < width) {
                        last.push(curr);
                        layout.push(last);
                    }
                }
            }
            layout.push([menuBtn(active)])
            return new Keyboard({ layout })
        }
    },
    "search": {
        help: "Shows all inline commands",
        emoji: "📊",
        message: (active) => new Message({
            title: active.command.name(active),
            text: "/" + BOT.commands.list
                .filter(cmd => cmd.inline(active).length > 0)
                .map(cmd => cmd.id)
                .join(", /")
        }),
        keyboard: (active) => new Keyboard({
            layout: [
                [{ text: "Find", switch_inline_query_current_chat: "find " }],
                [{ text: "Mod", switch_inline_query_current_chat: "findMod " }, { text: "Weapon", switch_inline_query_current_chat: "findWeapon " }],
                [{ text: "Warframe", switch_inline_query_current_chat: "findWarframe " }, { text: "Sentinel", switch_inline_query_current_chat: "findSentinel " }],
                [{ text: "Location", switch_inline_query_current_chat: "place " }, { text: "Drop", switch_inline_query_current_chat: "drop " }],
                [{ text: "Price Check", switch_inline_query_current_chat: "price " }, { text: "Check", switch_inline_query_current_chat: "check " }],
                ...[active.user.admin ? [{ text: "Time", switch_inline_query_current_chat: "time " }] : []],
                [menuBtn(active)]
            ]
        })
    },
    "config": {
        alt: ["configure"],
        emoji: "🔳",
        help: "Configure your menu layout",
        name: () => "Menu Config",
        count: (a) => a.user.settings.menu.flat().length,
        action: (active) => {
            let retStr: string[] = []
            if (active.args.length === 1) {
                const config = active.args[0];
                active.user.settings.menu = active.user.settings.menu.map(row =>
                    row.map(btn => {
                        if (btn === "none") {
                            retStr.push("Added " + config)
                            return config as command.ID
                        } else if (btn === config) {
                            retStr.push("Removed " + config)
                            return undefined
                        } else {
                            return btn
                        }
                    }).clean()).clean()
            } else {
                active.user.settings.menu = active.user.settings.menu.map(row =>
                    row.map(btn => {
                        if (btn === "none") {
                            return undefined
                        } else {
                            return btn
                        }
                    }).clean()).clean()
            }
            return retStr.join("\n")

        },
        message: (active) => new Message({
            title: active.command.name(active),
            text: Formatter.format({
                caption: "Your current menu configuration",
                text: ("Editing this will change your menu buttons.\n"
                    + "Use with caution if you don't know how to navigate the bot without buttons!\n\n"
                    + "No duplicates allowed!".bold()),
                subCaption: "\n➕ to add new buttons.\n➖ to remove this button.",
                description: active.execute_return
            })
        }),
        keyboard: (active) => new Keyboard({
            layout: active.user.settings.menu.map((row, y) =>
                row.map((btn, x) =>
                    new Button({
                        callback_data: "config",
                        args: [btn],
                        text: "➖ | " + btn
                    }))
                    .concat([new Button({
                        callback_data: "configSelection",
                        args: [y, row.length],
                        text: "➕"
                    })]))
                .concat([[new Button({
                    callback_data: "configSelection",
                    args: [active.user.settings.menu.length, 0],
                    text: "➕"
                })],
                [backTo("settings"),
                new Button(active.user.settings.menu.length > 0 ?
                    {
                        callback_data: "clearConfig",
                        text: "❌ Clear All"
                    } : undefined)
                ]])
        })

    },
    "configSelection": {
        hidden: true,
        emoji: "🆔",
        alt: ["select"],
        action: (active) => {
            const args = active.args;
            if (args.length === 2) {
                const x = parseInt(args[0]);
                const y = parseInt(args[1]);
                for (let i = 0; i <= x; i++) {
                    if (!active.user.settings.menu[i]) {
                        active.user.settings.menu[i] = [];
                    }
                }
                active.user.settings.menu[x][y] = "none"

            }
        },
        message: (active) => new Message({
            title: active.command.name(active),
            text: "Select Button to add to row " + (parseInt(active.args[0]) + 1),
        }),
        keyboard: (active) => {
            let cmd_s = BOT.commands.list;
            let layout: keyboard.Button[][] = []
            const width = 3;
            for (let cmd of cmd_s) {
                if (cmd.privileged(active.user.from) && cmd.id !== "none") {
                    const last = layout.pop()
                    const curr = new Button({
                        callback_data: "config",
                        args: [cmd.id],
                        text: cmd.id
                    });
                    if (!last) {
                        layout.push([curr]);
                    } else if (last.length === width) {
                        layout.push(last);
                        layout.push([curr]);
                    } else if (last.length < width) {
                        last.push(curr);
                        layout.push(last);
                    }
                }
            }
            layout.push([{ callback_data: "config", text: "< Cancel" }])
            return new Keyboard({ layout })
        }

    },
    "clearConfig": {
        emoji: "❌",
        action: (active) => {
            active.user.settings.menu = []
            return "Cleared all buttons, default keyboard will be used!"
        },
        message: "config",
        keyboard: "config"
    },
    "convert": {
        emoji: "🎛",
        action: (active) => {
            if (active.args[0]) {
                const converter = new Converter(
                    active.args[0],
                    parseInt(active.args[1]),
                    parseInt(active.args[2])
                )
                return converter.sharable
            }
        },
        message: (active) => {
            if (active.execute_return) {
                return new Message({
                    title: active.command.name(active),
                    text: Formatter.format({
                        caption: `Scale: ${active.args[1] || 5} | Speed ${active.args[2] || 3}`,
                        text: active.execute_return,
                    })
                })
            }
            return new Message({
                title: active.command.name(active),
                text: Formatter.format({
                    caption: "Usage:",
                    text: "/convert <song> [, scale, speed]".code(),
                    description: "For more info click on " + BOT.commands.find("convertInfo")!.name(active)
                })
            })
        },
        keyboard: (active) => new Keyboard({
            layout: [[
                new Button(backTo("songs")), btn("convertInfo")
            ]]
        })
    },
    "convertInfo": {
        emoji: "🎼",
        message: (active) => new Message({
            title: active.command.name(active),
            text: Formatter.format({
                caption: "Usage:",
                text: "/convert <song> [, scale, speed]".code(),
                description: "Parameter description below!"
            }) + Formatter.format({
                caption: "Song",
                addCaption: "(required)",
                text: ("Five line staff:\n"
                    + "C\n"
                    + "𝄖B𝄖\n"
                    + "A\n"
                    + "𝄖9𝄖\n"
                    + "8\n"
                    + "𝄖7𝄖\n"
                    + "6\n"
                    + "𝄖5𝄖\n"
                    + "4\n"
                    + "𝄖3𝄖\n"
                    + "2\n"
                    + "-1-").code().nl()
                    + "Simple Example of 9 notes:".nl()
                    + "A--A-7--7--A--A-7--7-9--".link("https://raw.githubusercontent.com/framefighter/framebot/master/docs/pics/note-example.jpg").nl()
                    + "Click to show notes or look below!".nl()
                    + "Dashes are pauses!",
            }) + Formatter.format({
                caption: "Scale",
                addCaption: "(optional)",
                text: ("1: Pentatonic Minor\n"
                    + "2: Pentatonic Major\n"
                    + "3: Chromatic\n"
                    + "4: Hexatonic\n"
                    + "5: Major (default)\n"
                    + "6: Minor\n"
                    + "7: Hirajoshi\n"
                    + "8: Phrygian").code()
            }) + Formatter.format({
                caption: "Speed",
                addCaption: "(optional)",
                description: "(default: 3)\nMultiplier for dashes, higher number means lower speed!"
            })
        }),
        keyboard: () => new Keyboard({
            layout: [[
                backTo("convert")
            ]]
        })
    },
    "songs": {
        alt: ["saveSong", "savedSongs", "allSongs", "listSongs"],
        help: "Show list of all saved songs",
        emoji: "🎶",
        count: () => BOT.database.songs.list.length,
        action: (active) => {
            const args = active.args;
            if (args[0] && args[0].length > 20) return "Song name to long!"
            const songs = BOT.database.songs.list;
            const found = songs.map(s => s.name).indexOf(args[0])
            const song = {
                name: args[0],
                string: args[1],
                user: active.user.id
            }
            if (args.length === 2) {
                if (found !== -1) {
                    const updated = BOT.database.songs.update(song);
                    if (updated) {
                        return `Song (${song.name}) already exists, updated string!`
                    } else {
                        return `Song (${song.name}) is not your song or does not exist!`
                    }
                } else {
                    BOT.database.songs.add(song)
                    return `Saved new song (${song.name})!`
                }
            } else if (args.length === 1) {
                if (found !== -1) {
                    BOT.database.songs.remove(song)
                    return "Removing song: " + song.name
                } else {
                    return "No song found to remove"
                }
            }
            return "Showing all saved songs"
        },
        message: (active) => new Message({
            title: active.command.name(active),
            text: Formatter.format({
                caption: active.execute_return,
                description: active.args.length > 0 ? "" : "Add songs to this songs list:\n/songs <name>, <string>"
            })
        }),
        keyboard: (active) => new Keyboard({
            layout: BOT.database.songs.list.map<keyboard.Button[]>(song => [new Button({
                callback_data: "showSong",
                args: [song.name],
                text: song.name
            })]).concat([[backTo("settings"), btn("convert")]])
        }),
        inline: (active) => BOT.database.songs.list.map(song =>
            new Inline({
                title: song.name,
                description: song.string.substr(0, 25) + "...",
                text: song.string,
            }))
    },
    "showSong": {
        hidden: true,
        alt: ["song"],
        help: "Show song string of a saved song",
        emoji: "🎵",
        message: (active) => {
            const found = BOT.database.songs.getByName(active.args[0])
            return new Message({
                title: found ? found.name : active.command.name(active),
                text: found ? found.string.clean() : ""
            })
        },
        keyboard: (active) => {
            const found = BOT.database.songs.getByName(active.args[0]);
            let remove: keyboard.Button[] = [];
            if (found && found.user === active.user.id) {
                remove = [new Button({
                    callback_data: "songs",
                    args: [active.args[0]],
                    text: "🗑️ Remove"
                })]
            };
            return new Keyboard({
                layout: [remove, [backTo("songs")]]
            })
        },
        inline: (active) => BOT.database.songs.list
            .filter(song =>
                Compare.loose(song.name, active.args[0]))
            .map(song =>
                new Inline({
                    title: song.name,
                    description: song.string.substr(0, 25) + "...",
                    text: song.string,
                }))
    }
}