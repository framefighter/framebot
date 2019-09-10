import idx from 'idx'
import moment from 'moment'
import { Compare } from '../../utils/compare'
import { Formatter } from '../../utils/formatter'
import { Inline } from '../message/inline'
import { Message } from '../message/message'
import { Keyboard } from '../keyboard/keyboard'
import { Parse } from '../../utils/parse'
import { spawn } from 'child_process'
import { Check } from '../../utils/check'
import { CONFIG } from '../../utils/config'
import { Active } from '../active/active'
import { Button } from '../keyboard/button'
import { Converter } from '../song/converter/converter'
import { DB, INFO, STATE, COMMANDS } from '../static'

export const btn = (id: command.ID): Button => new Button(id)
export const backBtn = (id: command.ID): Button => new Button({
    callback_data: id,
    text: "< " + id,
    alwaysShow: true
})
export const menuBtn = (active: Active): Button => new Button({
    callback_data: active.user.settings.menu[0]
        ? active.user.settings.menu[0][0]
        : "sortie",
    text: "< Back",
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
        help: "Show information about the bot and its creator",
        emoji: "ℹ️",
        message: (active) => new Message({
            text: [Formatter.format({
                caption: "Creator",
                addCaption: "@framefighter",
            }), Formatter.format({
                caption: "Bot",
                addCaption: "Source Code",
                link: { url: "https://github.com/framefighter/framebot", text: "GitHub Repo" }
            }), Formatter.format({
                caption: "Feedback",
                link: { url: "https://github.com/framefighter/framebot/issues", text: "Report Issues" }
            })].join("".nl())
        }, active)
    },
    "sortie": {
        alt: ["s"],
        help: "Get current Sortie with average completion time",
        jsonKey: "sortie",
        emoji: "💢",
        count: (active) => {
            const n = (idx(active, _ => _.ws.sortie.variants) || []) as any
            if (n.length) {
                return n.length
            }
            return 0
        },
        message: (active) => new Message({
            text: Formatter.sortie(active.ws.sortie)
        }, active),
        inline: (active) => ((idx(active, _ => _.ws.sortie.variants) || []) as wf.Variant[]).map(mission =>
            new Inline({
                title: mission.missionType || mission.boss || "",
                description: mission.modifier,
            }))
    },
    "sortieRewards": {
        emoji: "⭐",
        action: () => (INFO.places || [])
            .find(drop => drop.place.toUpperCase().includes("SORTIES")),
        message: (active) => new Message({
            text: Formatter.place(active.execute_return)
        }, active),
    },
    "fissures": {
        alt: ["fis"],
        help: "Get current Void Fissures",
        jsonKey: "fissures",
        emoji: "✨",
        message: (active) => new Message({
            text: (active.ws.fissures || []).length > 0
                ? STATE.filteredByID<wf.Fissure>(active.args, active.command.jsonKey)
                    .sort((a, b) => (a.tierNum || 0) - (b.tierNum || 0))
                    .map(Formatter.fissure)
                    .join("".nl())
                : "No Fissures found!"
        }, active),
        inline: (active) => ((idx(active, _ => _.ws.fissures) || []) as wf.Fissure[]).map(mission =>
            new Inline({
                title: mission.missionType  || "",
                description: mission.tier,
            }))
    },
    "invasions": {
        alt: ["inv"],
        help: "Lists all ongoing Invasions",
        jsonKey: "invasions",
        emoji: "✊",
        message: (active) => new Message({
            text: (active.ws.invasions || []).length > 0
                ? STATE.filteredByID<wf.Invasion>(active.args, active.command.jsonKey)
                    .map(Formatter.invasion)
                    .clean()
                    .join("".nl().nl())
                : "No Invasions found!"
        }, active),
        rewards: (active) => (active.ws.invasions || [])
            .map(invasion => ({
                id: invasion.id
                    || DB.notifications.generateID(invasion),
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
            text: (active.ws.events || []).length > 0
                ? STATE.filteredByID<wf.Event>(active.args, active.command.jsonKey)
                    .map(Formatter.event)
                    .clean()
                    .join("".nl().nl())
                : "No Events found!"
        }, active),
        rewards: (active) => (active.ws.events || [])
            .filter(event => event.rewards)
            .map(event => ({
                id: event.id
                    || DB.notifications.generateID(event),
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
                .includes("en")).length) || 0) as number,
        message: (active) => {
            const englishNews = STATE.filteredByID<wf.News>(active.args, active.command.jsonKey)
                .sort((a, b) => Compare.dates(a.date, b.date))
                .filter(n =>
                    Object.keys(n.translations || {})
                        .includes("en"))
            if (englishNews.length > 0) {
                return new Message({
                    text: englishNews.clean()
                        .map(Formatter.newsEvent)
                        .clean()
                        .join("".nl())
                }, active)
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
            && n.update).length) || 0) as number,
        message: (active) => {
            const englishNews = STATE.filteredByID<wf.News>(active.args, active.command.jsonKey)
                .sort((a, b) => Compare.dates(a.date, b.date))
                .filter(n =>
                    Object.keys(n.translations || {})
                        .includes("en") && n.update)
            if (englishNews.length > 0) {
                return new Message({
                    text: englishNews.clean()
                        .map(Formatter.newsEvent)
                        .clean()
                        .join("".nl())
                }, active)
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
        count: (active) => (idx(active, _ => _.ws.voidTrader.inventory.length) || 0) as number,
        message: (active) => new Message({
            text: Formatter.trader(active.ws.voidTrader)
        }, active),
        inline: active => (idx(active, _ =>
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
        ) || []) as Inline[],
        rewards: (active) => (idx(active, _ =>
            [{
                id: _.ws.voidTrader.id,
                text: Formatter.trader(active.ws.voidTrader),
                rewards: (_.ws.voidTrader.inventory || []).map(inv => inv.item),
            }]
        ) || []) as message.Reward[]
    },
    "boosters": {
        alt: ["boost"],
        help: "Show active global boosters",
        jsonKey: "globalUpgrades",
        emoji: "🚀",
        message: (active) => new Message({
            text: (active.ws.globalUpgrades || []).length > 0
                ? STATE.filteredByID<wf.GlobalUpgrade>(active.args, active.command.jsonKey)
                    .filter(boost => !boost.expired)
                    .map(boost =>
                        Formatter.format({
                            caption: (boost.upgradeOperationValue || "").toString()
                                .concat(boost.operationSymbol || "")
                                .end(boost.upgrade),
                            description: boost.desc,
                            end: boost.end
                        })).join("".nl())
                : "No Boosters found!"
        }, active),
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
            _.ws.nightwave.activeChallenges.length) || 0) as number,
        message: (active) =>
            new Message({
                text: (idx(active, _ => ("Season:".end(
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
                        .map(Formatter.nightwave).join("".nl())))
                    || "No Nightwave found!") as string
            }, active),
        inline: (active) => ((idx(active, _ => _.ws.nightwave.activeChallenges) || []) as wf.ActiveChallenge[])
            .map(ch => new Inline({
                title: Formatter.nightwaveType(ch).start("[" + ch.reputation + "]") + ch.title,
                description: (ch.desc || "").nl() + (ch.expiry || "").toString().fromNow().start("Ends"),
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
                text: (idx(active, _ => Formatter.format({
                    caption: `It is currently ${_.ws.cetusCycle.state.toUpperCase()} on the Plains of Eidolon!`,
                    subCaption: _.ws.cetusCycle.shortString,
                    link: {
                        text: "Fishing Map",
                        url: "https://vignette.wikia.nocookie.net/warframe/images/4/4b/Fishingmap.png/revision/latest?cb=20181111120029"
                    }
                })) || "No Cetus Information Found!") as string
            }, active)
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
            text: (idx(active, _ => Formatter.format({
                caption: `It is currently ${_.ws.vallisCycle.state.toUpperCase()} in Orb Vallis!`,
                subCaption: _.ws.vallisCycle.shortString,
                link: {
                    text: "Fishing Map",
                    url: "https://vignette.wikia.nocookie.net/warframe/images/6/6f/FortunaFishingMap.jpg/revision/latest?cb=20181113071342"
                }
            })) || "No Vallis Information Found!") as string
        }, active),
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
            text: (idx(active, _ => Formatter.format({
                caption: `It is currently ${_.ws.earthCycle.state.toUpperCase()} on Earth!`,
            })) || "No Earth Information Found!") as string
        }, active),
        keyboard: "cycles"
    },
    "cycles": {
        emoji: "🌄",
        help: "Get All day/night cycle information",
        message: (active) => {
            const cetus = COMMANDS.fromID("cetus")
            const vallis = COMMANDS.fromID("vallis")
            const earth = COMMANDS.fromID("earth")
            const cetusMSg = cetus.message(active).text
            const vallisMSg = vallis.message(active).text
            const earthMSg = earth.message(active).text
            return new Message({
                text: (cetusMSg || "").nl()
                    + (vallisMSg || "").nl()
                    + (earthMSg || "").nl()
            }, active)
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
        jsonKey: "arbitration",
        emoji: "💀",
        message: (active) => {
            if (active.args.length > 0) {
                if (Compare.exact(active.user.settings.arbitration,
                    idx(STATE.ws, _ => _.arbitration.type) || "")) {
                    return new Message({
                        text: Formatter.arbitration(STATE.ws.arbitration)
                    }, active)
                } else {
                    return new Message("")
                }
            } else {
                return new Message({
                    text: Formatter.arbitration(STATE.ws.arbitration)
                }, active)
            }
        },
        rewards: (active) => [{
            id: DB.notifications.generateID(STATE.ws.arbitration, active.command.id),
            text: Formatter.arbitration(STATE.ws.arbitration),
            rewards: [idx(STATE.ws, _ => _.arbitration.type) as string,
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
            text: (active.ws.alerts || []).length > 0
                ? STATE.filteredByID<wf.Alert>(active.args, active.command.jsonKey)
                    .map(Formatter.alert).join("".nl())
                : "No Alerts found!"
        }, active),
        inline: (active) => (active.ws.alerts || []).length > 0
            ? (active.ws.alerts || [])
                .map(alert =>
                    new Inline({
                        title: idx(alert, _ => _.mission.type) as string || "",
                        text: Formatter.alert(alert),
                    }))
            : [new Inline({
                title: "No Alerts found!",
                description: "Try again later"
            })],
        rewards: (active) => (active.ws.alerts || []).map(alert =>
            ({
                id: alert.id || DB.notifications.generateID(alert),
                text: Formatter.alert(alert),
                rewards: idx(alert, _ => [_.mission.reward.asString]) as string[] || []
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
        count: (active) => COMMANDS.fromID("settings").keyboard(active).layout.length - 1,
        message: (active) => new Message({
            text: Formatter.format({
                caption: "Available settings",
                description: "Select which setting to change!",
            })
        }, active),
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
                    active.user.settings.filter.push(arg)
                    return true
                }
            }),
        message: (active) => new Message({
            text: Formatter.format({
                caption: "Stored filter keywords",
                description: (active.execute_return || []).length !== 0
                    ? "Newly added:"
                    : active.user.settings.filter.length > 0
                        ? "Add with /add <item>".nl()
                        + "Remove with /remove <item>".nl().nl()
                        + "Click below to filter active happenings with selected keyword!"
                        : "No filter keywords to add",
                list: active.execute_return
            }),
        }, active),
        keyboard: (active) => new Keyboard({
            layout: active.user.settings.filter.map<keyboard.Button[]>(item => [
                new Button({
                    callback_data: "check",
                    args: [item],
                    text: item
                })]).concat([[
                    backBtn("settings"),
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
            text: Formatter.format({
                description: (active.execute_return || []).length !== 0
                    ? "Removed:"
                    : active.user.settings.filter.length > 0
                        ? "Click below to delete filter keywords"
                        : "No filter keywords to delete",
                list: active.execute_return
            }),
        }, active),
        keyboard: (active) => new Keyboard({
            layout: active.user.settings.filter.map<keyboard.Button[]>(item => [
                new Button({
                    callback_data: "askRemove",
                    args: [item],
                    text: item
                })]).concat([[backBtn("filter")]])
        })
    },
    "askRemove": {
        hidden: true,
        help: "Ask if you want to delete filter keyword",
        emoji: "🗑️",
        message: (active) => new Message({
            text: Formatter.format({
                caption: "Do you really want to remove this item!",
                list: active.args
            })
        }, active),
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
        count: (active) => COMMANDS.list
            .filter(c => c.jsonKey)
            .filter(c => active.user.settings.alert[c.id])
            .length,
        action: (active) => {
            const id = active.args[0]
            if (id) {
                active.user.settings.alert[id] = !active.user.settings.alert[id]
                return active.user.settings.alert[id]
            }
        },
        message: (active) => new Message({
            text: Formatter.format({
                caption: "Available alert settings",
                description: "Use the buttons below to change your settings!",
            })
        }, active),
        keyboard: (active) => new Keyboard({
            layout: [
                [{ callback_data: "allAlertsSettingsOn", alwaysShow: true },
                { callback_data: "allAlertsSettingsOff", alwaysShow: true }],
                ...COMMANDS.list.filter(c => c.jsonKey).map<keyboard.Button[]>(cmd => {
                    const toggleBtn = btn(cmd.id)
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
                [backBtn("settings")]
            ]
        })
    },
    "allAlertsSettingsOn": {
        hidden: true,
        help: "Turn all alert settings on",
        emoji: "🔊",
        name: () => "On",
        action: (active) => {
            COMMANDS.list.filter(c => c.jsonKey).forEach(cmd =>
                active.user.settings.alert[cmd.id] = true
            )
        },
        message: "alertSettings",
        keyboard: "alertSettings",
    },
    "allAlertsSettingsOff": {
        hidden: true,
        help: "Turn all alert settings off",
        emoji: "🔈",
        name: () => "Off",
        action: (active) => {
            COMMANDS.list.filter(c => c.jsonKey).forEach(cmd =>
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
                    active.user.settings.arbitration.push(arg)
                    return "Added " + arg.clean()
                }
            }),
        message: (active) => new Message({
            text: Formatter.format({
                caption: "Stored arbitration types",
                text: "Add/Remove with".nl() + `/${active.command.id} <missionType>`.code(),
                description: active.user.settings.arbitration.length > 0
                    ? "Click below to remove mission types!"
                    : "",
                list: active.execute_return
            }),
        }, active),
        keyboard: (active) => new Keyboard({
            layout: active.user.settings.arbitration.map<keyboard.Button[]>(item => [
                new Button({
                    callback_data: "arbitrationFilter",
                    args: [item],
                    text: item
                })]).concat([[backBtn("settings")]])
        })
    },
    "sortieTimes": {
        alt: ["st"],
        help: "Get the average completion time for every Sortie mission",
        emoji: "🕒",
        count: () => DB.times.list.length,
        message: (active) => new Message({
            text: Formatter.timesString(active.args)
        }, active),
        inline: (active) => Object.keys(DB.times.avg())
            .filter(key => active.args.length > 0
                ? Compare.loose(key, active.args) : true)
            .map(key => {
                const avg = DB.times.avg()[key]
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
            text: active.args.map(arg =>
                INFO.weapons
                    ? (INFO.weapons || [])
                        .filter(weapon =>
                            weapon.name.toUpperCase().includes(arg.toUpperCase()))
                        .slice(0, 2)
                        .map(Formatter.weapon)
                        .join("".nl())
                    : ""
            ).slice(0, 2).join("".nl()) || "No Weapons found!"
        }, active),
        inline: (active) => active.args.map(arg =>
            INFO.weapons
                ? (INFO.weapons || [])
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
            text: active.args.map(arg =>
                INFO.warframes
                    ? (INFO.warframes || [])
                        .filter(warframe =>
                            warframe.name.toUpperCase().includes(arg.toUpperCase()))
                        .slice(0, 2)
                        .map(Formatter.warframe)
                        .join("".nl())
                    : ""
            ).slice(0, 2).join("".nl()) || "No Warframes found!"
        }, active),
        inline: (active) => active.args.map(arg =>
            INFO.warframes
                ? (INFO.warframes || [])
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
            text: active.args.map(arg =>
                INFO.mods
                    ? (INFO.mods || [])
                        .filter(mod =>
                            mod.name.toUpperCase().includes(arg.toUpperCase()))
                        .slice(0, 2)
                        .map(Formatter.mod)
                        .join("".nl())
                    : ""
            ).slice(0, 2).join("".nl()) || "No Mods found!"
        }, active),
        inline: (active) => active.args.map(arg =>
            INFO.mods
                ? (INFO.mods || [])
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
            text: active.args.map(arg =>
                INFO.sentinels
                    ? (INFO.sentinels || [])
                        .filter(sentinel =>
                            sentinel.name.toUpperCase().includes(arg.toUpperCase()))
                        .slice(0, 2)
                        .map(Formatter.sentinel)
                        .join("".nl())
                    : ""
            ).slice(0, 2).join("".nl()) || "No Sentinels found!"
        }, active),
        inline: (active) => active.args.map(arg =>
            INFO.sentinels
                ? (INFO.sentinels || [])
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
            text: active.args.map(arg =>
                (INFO.prices || [])
                    .filter(price =>
                        price.Title.toUpperCase().includes(arg.toUpperCase()))
                    .slice(0, 2)
                    .map(Formatter.price)
                    .join("".nl())
            ).slice(0, 2).join("".nl()) || "No Prices found!"
        }, active),
        inline: (active) => active.args.map(arg =>
            (INFO.prices || [])
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
            text: active.args.map(arg =>
                (INFO.drops || [])
                    .filter(drop =>
                        drop.item.toUpperCase().includes(arg.toUpperCase()))
                    .slice(0, 2)
                    .map(Formatter.drop)
                    .join("".nl())
            ).slice(0, 2).join("".nl()) || "No Drops found!"
        }, active),
        inline: (active) => active.args.map(arg =>
            (INFO.drops || [])
                .filter(drop =>
                    drop.item.toUpperCase().includes(arg.toUpperCase())
                )
                .map(drop => new Inline({
                    title: Formatter.dropTitle(drop),
                    description: drop.group.slice(0, 1).map(Formatter.dropInfo).join("".nl()),
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
            text: active.args.map(arg =>
                (INFO.places || [])
                    .filter(drop =>
                        drop.place.toUpperCase().includes(arg.toUpperCase()))
                    .slice(0, 2)
                    .map(Formatter.place)
                    .join("".nl())
            ).slice(0, 2).join("".nl()) || "No Places found!"
        }, active),
        inline: (active) => active.args.map(arg =>
            (INFO.places || [])
                .filter(place =>
                    place.place.toUpperCase().includes(arg.toUpperCase())
                )
                .map(place => new Inline({
                    title: Formatter.placeTitle(place),
                    description: place.group.slice(0, 1).map(Formatter.placeInfo).join("".nl()),
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
            text: "Only usable in inline Mode"
        }, active),
        inline: (active) => {
            const modCmd = COMMANDS.fromID("findMod")
            const warframeCmd = COMMANDS.fromID("findWarframe")
            const weaponCmd = COMMANDS.fromID("findWeapon")
            const priceCmd = COMMANDS.fromID("price")
            const dropCmd = COMMANDS.fromID("drop")
            const sentinelCmd = COMMANDS.fromID("findSentinel")
            const placeCmd = COMMANDS.fromID("place")
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
            return COMMANDS.fromID("check").inline(active).length
        },
        message: (active) => new Message({
            text: COMMANDS.list
                .map(cmd => Check.rewards(cmd.rewards(active),
                    active.args.length > 0
                        ? active.args
                        : active.user.settings.filter
                            .concat(active.user.settings.arbitration))
                    .map(reward => ("Found " + cmd.name(active) + ":").bold()
                        .nl()
                        .concat(reward.text))
                    .clean()
                    .join("".nl())
                )
                .clean()
                .join("".nl().nl())
                || Formatter.format({
                    caption: "Nothing found with active filter!",
                    list: (active.args.length > 0
                        ? active.args
                        : active.user.settings.filter.concat(active.user.settings.arbitration)),
                    text: "Add new keywords with /add <keyword> [, keyword...]".clean(),
                    description: "Keywords:"
                })
        }, active),
        inline: (active) => COMMANDS.list
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
            const password = active.args[0]
            const username = active.args[1]
            if (password && username) {
                if (password === CONFIG.password) {
                    const userFromDB = DB.users.getByName(username)
                    if (userFromDB) {
                        if (!userFromDB.admin) {
                            userFromDB.admin = true
                            DB.users.update(userFromDB)
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
            text: active.execute_return || "Something went wrong, try again!"
        }, active)
    },
    "time": {
        alt: ["t"],
        help: "[ADMIN] Record new time for Sortie",
        adminOnly: true,
        emoji: "⏱",
        action: (active) => {
            const sortie = active.ws.sortie
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
                                stage: i + 1,
                                reward: Parse.sortieReward(
                                    active.args[(sortie.variants || []).length])
                            }
                            DB.times.add(time)
                            return time
                        }
                    }
                }).clean()
            }
        },
        message: (active) => new Message({
            text: (active.execute_return as time.Record[] || []).length > 0
                ? (active.execute_return as time.Record[] || [])
                    .map(Formatter.timeRecord)
                    .join("".nl())
                : active.user.admin ? "No Times to add!" : "Admin rights required!"
        }, active),
        inline: (active) => {
            const sortie = active.ws.sortie;
            const recorded: boolean[] = []
            const recs: Inline[] = []
            if (sortie) {
                (sortie.variants || []).map((mission, i) => {
                    const { min, sec } = Parse.time(active.args[i])
                    const missionStr = " | "
                        + "Stage: " + (i + 1) + ": "
                        + mission.missionType
                        + (Check.assassination(mission.missionType)
                            ? idx(active, _ => " > " + _.ws.sortie.boss) || ""
                            : "")
                    if (min || sec) {
                        const rec: time.Record = {
                            mission: mission.missionType || "",
                            minutes: min || 0,
                            seconds: sec || 0,
                            boss: Check.assassination(mission.missionType)
                                ? (idx(active, _ => _.ws.sortie.boss) as string || "")
                                : undefined,
                            date: moment().unix(),
                            stage: i + 1,
                            reward: Parse.sortieReward(
                                active.args[(sortie.variants || []).length])
                        }
                        const args: string[] = []
                        args[i] = active.args[i]
                        recs.push(new Inline({
                            title: Formatter.clock(rec.seconds + rec.minutes * 60) + missionStr,
                            description: (rec.reward
                                ? "Reward: " + rec.reward
                                : "").nl()
                                + "Click to save only this time!",
                            text: Formatter.timeRecord(rec),
                            keyboard: new Keyboard({
                                layout: [[{
                                    callback_data: "time",
                                    args: args,
                                    text: "💾 Save"
                                }], [menuBtn(active)]]
                            })
                        }))
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
                        }))
                        recorded.push(false)
                    }
                })
            }
            const saveAll = new Inline({
                title: "Save all times!",
                description: "Click here to save all recorded times!",
                text: Formatter.format({
                    caption: "Click below to Save these times to database!",
                    text: recs.map(inl => inl.text).join("".nl()),
                }),
                keyboard: new Keyboard({
                    layout: [[{
                        callback_data: "time",
                        args: active.args,
                        text: "💾 Save All"
                    }], [menuBtn(active)]]
                })
            })
            if (recorded.every(r => r)) {
                recs.push(saveAll)
            }
            return recs
        }
    },
    "restart": {
        help: "[ADMIN] Restart bot",
        adminOnly: true,
        emoji: "🔄",
        action: () => {
            spawn(
                `bash bash/restart.sh`,
                { shell: true })
        },
        message: (active) => new Message({
            text: active.user.admin
                ? "Restarting..."
                : "You need admin rights to do this!"
        }, active),
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
            text: Formatter.format({
                caption: "Hello Tenno!",
                subCaption: "This bot 🤖 connect warframe happenings with telegram, so you'll never miss another event!".nl()
                    + "Get a list of all commands with inline mode or click /help.",
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
        }, active),
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
            text: COMMANDS.list
                .map(cmd => Formatter.format({
                    caption: ["/" + cmd.id.clean(), ...cmd.alt].join(" | /"),
                    subCaption: cmd.help
                })).join("".nl())
        }, active),
        inline: (active) => COMMANDS.list
            .filter(cmd => !cmd.hidden)
            .map(cmd => new Inline({
                title: cmd.buttonText(active),
                description: "IDs: [" + cmd.id + cmd.alt.join(" , ").start(" ,") + "]".nl()
                    + cmd.help,
                text: Formatter.format({
                    caption: cmd.id,
                    addCaption: cmd.alt.join(" | "),
                    subCaption: "/" + cmd.id,
                    description: "Click below to execute!"
                }),
                keyboard: new Keyboard({
                    layout: [[{ callback_data: cmd.id, text: "Execute!" }]]
                })
            }))
    },
    "all": {
        emoji: "📑",
        help: "Lists all information",
        count: (active) => COMMANDS.list.filter(cmd =>
            cmd.privileged(active.user.from)).length,
        message: (active) => new Message({
            text: "/" + COMMANDS.list
                .map(cmd => cmd.id).join(", /")
        }, active),
        keyboard: (active) => {
            const cmd_s = COMMANDS.list
            const layout: keyboard.Button[][] = []
            const width = 3
            for (let cmd of cmd_s) {
                if (cmd.privileged(active.user.from)) {
                    const last = layout.pop()
                    const curr = btn(cmd.id)
                    if (!last) {
                        layout.push([curr])
                    } else if (last.length === width) {
                        layout.push(last)
                        layout.push([curr])
                    } else if (last.length < width) {
                        last.push(curr)
                        layout.push(last)
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
            text: "/" + COMMANDS.list
                .filter(cmd => cmd.inline(active).length > 0)
                .map(cmd => cmd.id)
                .join(", /")
        }, active),
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
                const config = active.args[0]
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
            return retStr.join("".nl())

        },
        message: (active) => new Message({
            text: Formatter.format({
                caption: "Your current menu configuration",
                text: ("Editing this will change your menu buttons.".nl()
                    + "Use with caution if you don't know how to navigate the bot without buttons!".nl().nl()
                    + "No duplicates allowed!".bold()),
                subCaption: "".nl() + "➕ to add new buttons.".nl() + "➖ to remove this button.",
                description: active.execute_return
            })
        }, active),
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
                [backBtn("settings"),
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
            const args = active.args
            if (args.length === 2) {
                const x = parseInt(args[0])
                const y = parseInt(args[1])
                for (let i = 0; i <= x; i++) {
                    if (!active.user.settings.menu[i]) {
                        active.user.settings.menu[i] = []
                    }
                }
                active.user.settings.menu[x][y] = "none"

            }
        },
        message: (active) => new Message({
            text: "Select Button to add to row " + (parseInt(active.args[0]) + 1),
        }, active),
        keyboard: (active) => {
            let cmd_s = COMMANDS.list
            let layout: keyboard.Button[][] = []
            const width = 3
            for (let cmd of cmd_s) {
                if (cmd.privileged(active.user.from) && cmd.id !== "none") {
                    const last = layout.pop()
                    const curr = new Button({
                        callback_data: "config",
                        args: [cmd.id],
                        text: cmd.id
                    })
                    if (!last) {
                        layout.push([curr])
                    } else if (last.length === width) {
                        layout.push(last)
                        layout.push([curr])
                    } else if (last.length < width) {
                        last.push(curr)
                        layout.push(last)
                    }
                }
            }
            layout.push([{ callback_data: "config", text: "< Cancel" }])
            return new Keyboard({ layout })
        }

    },
    "clearConfig": {
        help: "Clear Menu Configuration",
        emoji: "❌",
        action: (active) => {
            active.user.settings.menu = []
            return "Cleared all buttons, default keyboard will be used!"
        },
        message: "config",
        keyboard: "config"
    },
    "convert": {
        help: "Convert songs from a human readable format to a in-game usable sharable string",
        emoji: "🎛",
        action: (active) => {
            active.user.settings.convertedSong = ""
            if (active.args[0]) {
                const converter = new Converter(
                    active.args[0],
                    parseInt(active.args[1]),
                    parseInt(active.args[2])
                )
                active.user.settings.convertedSong = converter.sharable
                return active.user.settings.convertedSong
            }
        },
        message: (active) => {
            if (active.execute_return) {
                return new Message({
                    text: Formatter.format({
                        caption: `Scale: ${active.args[1] || 5} | Speed ${active.args[2] || 3}`,
                        text: active.execute_return,
                    })
                }, active)
            }
            return new Message({
                title: active.command.name(active),
                text: Formatter.format({
                    caption: "Usage:",
                    text: "/convert <song> [, scale, speed]".code(),
                    description: "For more info click on " + COMMANDS.find("convertInfo")!.name(active)
                })
            })
        },
        keyboard: (active) => new Keyboard({
            layout: [active.execute_return ? [new Button({
                text: "Name and Save Song",
                switch_inline_query_current_chat: "saveConverted "
            })] : [],
            [new Button(backBtn("songs")), btn("convertInfo")]]
        }),
        inline: (active) => {
            const song = active.args[0]
            const scale = parseInt(active.args[1])
            const speed = parseInt(active.args[2])
            if (song) {
                const converted = new Converter(song, scale, speed).sharable
                active.user.settings.convertedSong = converted
                return [new Inline({
                    title: "Click to show full conversion!",
                    description: converted.length > 100 ? converted.substr(0, 50) + "".nl() + "[...]" : converted,
                    text: converted,
                    keyboard: new Keyboard({
                        layout: [[new Button({
                            text: "Name and Save Song",
                            switch_inline_query_current_chat: "saveConverted "
                        })], [new Button(backBtn("songs")), btn("convertInfo")]]
                    })
                })]
            }
            return [new Inline({
                title: "Type song to start getting conversion!",
                description: "For more informations use /convertInfo"
            })]
        }
    },
    "saveConverted": {
        emoji: "💾",
        help: "Save converted command to global songs database",
        inline: (active) => {
            const convertedSong = active.user.settings.convertedSong
            const name = active.args[0]
            if (convertedSong && name) {
                if (DB.songs.exists(name)) {
                    return [new Inline({
                        title: "Song with this name already exists",
                        description: name + "".nl() + "Try a different name!"
                    })]
                } else {
                    return [new Inline({
                        title: "Click here to select typed name!",
                        description: "Clicking this will not save just yet!",
                        text: Formatter.format({
                            caption: "Save song with name " + name + "?",
                            description: "This will make this song visible for everyone using this bot!"
                        }),
                        keyboard: new Keyboard({
                            layout: [[new Button({
                                callback_data: "songs",
                                args: [name, "convertedSong"],
                                text: "💾 Save"
                            })],
                            [new Button({
                                callback_data: "convert",
                                text: "❌ Cancel"
                            })]]
                        })
                    })]
                }
            } else if (convertedSong && !name) {
                return [new Inline({
                    title: "Type name of song!",
                    description: "Name must be unique!",
                })]
            } else {
                return [new Inline({
                    title: "No converted Song!",
                    description: "Convert a song using /convert first"
                })]
            }
        }
    },
    "convertInfo": {
        help: "Show information about song conversion",
        emoji: "🎼",
        message: (active) => new Message({
            text: Formatter.format({
                caption: "Usage:",
                text: "/convert <song> [, scale, speed]".code(),
                description: "Parameter description below!"
            }) + Formatter.format({
                caption: "Song",
                addCaption: "(required)",
                subCaption: ("Simple Example of 9 notes.".nl()
                    + "Click to show notes or look below!".nl()
                    + "Dashes are like pauses!"),
                link: {
                    text: "A--A-7--7--A--A-7--7-9--",
                    url: "https://raw.githubusercontent.com/framefighter/framebot/master/docs/pics/note-example.jpg"
                },
                list: ["C", "𝄖B𝄖", "𝄖9𝄖", "𝄖7𝄖", "𝄖5𝄖", "𝄖3𝄖", "2"]
            }) + Formatter.format({
                caption: "Scale",
                addCaption: "(optional)",
                list: ["1: Pentatonic Minor",
                    "2: Pentatonic Major",
                    "3: Chromatic",
                    "4: Hexatonic",
                    "5: Major (default)",
                    "6: Minor",
                    "7: Hirajoshi",
                    "8: Phrygian"]
            }) + Formatter.format({
                caption: "Speed",
                addCaption: "(optional)",
                description: "(default: 3)".nl() + "Multiplier for dashes, higher number means lower speed!"
            })
        }, active),
        keyboard: () => new Keyboard({
            layout: [[
                backBtn("convert")
            ]]
        })
    },
    "songs": {
        alt: ["saveSong", "savedSongs", "allSongs", "listSongs"],
        help: "Show list of all saved songs",
        emoji: "🎶",
        count: () => DB.songs.list.length,
        action: (active) => {
            const args = active.args
            if (args[0] && args[0].length > 20) return "Song name to long!"
            const songs = DB.songs.list
            const found = songs.map(s => s.name).indexOf(args[0])
            const song = {
                name: args[0],
                string: args[1],
                user: active.user.id
            }
            if (args.length === 2) {
                if (song.string === "convertedSong") {
                    if (active.user.settings.convertedSong) {
                        DB.songs.add({
                            ...song,
                            string: active.user.settings.convertedSong
                        })
                        active.user.settings.convertedSong = ""
                        return `Saved converted song with name ${song.name}`
                    } else {
                        return "Cannot save song, convert a song first!"
                    }
                } else {
                    if (found !== -1) {
                        const updated = DB.songs.update(song)
                        if (updated) {
                            return `Song (${song.name}) already exists, updated string!`
                        } else {
                            return `Song (${song.name}) is not your song or does not exist!`
                        }
                    } else {
                        DB.songs.add(song)
                        return `Saved new song (${song.name})!`
                    }
                }
            } else if (args.length === 1) {
                if (found !== -1) {
                    DB.songs.remove(song)
                    return "Removing song: " + song.name
                } else {
                    return "No song found to remove"
                }
            }
            return "Showing all saved songs"
        },
        message: (active) => new Message({
            text: Formatter.format({
                caption: active.execute_return,
                description: active.args.length > 0 ? "" : "Add songs to this songs list:".nl() + "/songs <name>, <string>"
            })
        }, active),
        keyboard: (active) => new Keyboard({
            layout: DB.songs.list.map<keyboard.Button[]>(song => [new Button({
                callback_data: "showSong",
                args: [song.name],
                text: song.name
            })]).concat([[backBtn("settings"), btn("convert")]])
        }),
        inline: (active) => DB.songs.list.map(song =>
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
            const found = DB.songs.getByName(active.args[0])
            return new Message(found ? found.string : "")
        },
        keyboard: (active) => {
            const found = DB.songs.getByName(active.args[0])
            let remove: keyboard.Button[] = []
            if (found && found.user === active.user.id) {
                remove = [new Button({
                    callback_data: "songs",
                    args: [active.args[0]],
                    text: "🗑️ Remove"
                })]
            }
            return new Keyboard({
                layout: [remove, [backBtn("songs")]]
            })
        },
        inline: (active) => DB.songs.list
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