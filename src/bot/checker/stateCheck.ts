import { Active } from '../active/active'
import { Check } from '../../utils/check'
import { User } from '../user/user'
import { COMMANDS, DB, STATE, DEFAULTS } from '../static'
import TelegramBot = require('node-telegram-bot-api')
import { Keyboard } from '../keyboard/keyboard'
import { menuBtn } from '../command/definitions'

export default class StateCheck implements checker.StateCheck {
    api: TelegramBot

    constructor(api: TelegramBot, interval?: number) {
        this.api = api
        setInterval(() => this.check(), interval || 10000)
        this.check()
    }

    check() {
        COMMANDS.list
            .forEach(cmd => {
                if (cmd.jsonKey) {
                    this.checkCmd(cmd.id, STATE.ws[cmd.jsonKey])
                }
            })
    }

    checkCmd<T extends any>(command: command.ID, obj?: T | null) {
        if (obj) {
            let objArr: any[] = []
            if (Array.isArray(obj)) {
                const arrObj = obj as Array<any>
                arrObj.map((n: any) => {
                    if (DB.notifications.add(
                        DB.notifications.generateID(n, command)
                    )) {
                        objArr.push(n)
                    }
                })
            } else {
                if (DB.notifications.add(
                    DB.notifications.generateID(obj, command))) {
                    objArr.push(obj)
                }
            }
            if (objArr.length > 0) this.sendToUser(command, objArr)
        }
    }

    sendToUser(commandID: command.ID, objArr: any[]) {
        DB.users.list.forEach(user => {
            if (user.settings
                && user.settings.alert
                && user.settings.alert[commandID]) {
                const command = COMMANDS.find(commandID)
                if (command) {
                    const ids = objArr.map(o => DB.notifications.generateID(o, command.id))
                    const active = new Active({
                        user: new User(user),
                        command,
                        args: ids,
                    })
                    const possibleRewards = command.rewards(active)
                        .filter(rew => ids.includes(rew.id.toString()))
                    let message = active.message
                    if (possibleRewards.length > 0) {
                        message = Check.rewards(possibleRewards, user.settings.filter)
                            .map(reward =>
                                command.name(active).nl().concat(reward.text))
                            .clean()
                            .join("\n")
                    }
                    if (message.length > 0) {
                        this.api.sendMessage(user.id, message, {
                            parse_mode: DEFAULTS.parse_mode,
                            reply_markup: new Keyboard({
                                layout: [[menuBtn(active)]]
                            }).toInline(active)
                        })
                    }
                }
            }
        })
    }
}