import { Active } from '../active/active';
import { check } from '../../utils/check';
import { settings_suffix } from '../command/definitions';
import { BOT } from '../..';

export default class Checker implements checker.Checker {
    check() {
        BOT.commands.list
            .forEach(cmd => {
                if (cmd.jsonKey) {
                    this.checkCmd(cmd.id, BOT.ws[cmd.jsonKey]);
                }
            })
    }

    checkExtra() {
        this.checkCmd("arbitration", BOT.extra.arbitration);
        // this.checkCmd("kuva", BOT.extra.kuva)
    }

    checkCmd<T extends any>(command: command.ID, obj?: T | null) {
        if (obj) {
            let newObjs = [];
            if (Array.isArray(obj)) {
                const arrObj = obj as Array<any>;
                arrObj.map((n: any) => {
                    if (BOT.database.notifications.add(
                        BOT.database.notifications.generateID(n, command)
                    )) {
                        newObjs.push(n)
                    }
                })
            } else {
                if (BOT.database.notifications.add(
                    BOT.database.notifications.generateID(obj, command))) {
                    newObjs.push(obj)
                }
            }
            if (newObjs.length > 0) this.sendToUser(command, newObjs);
        }
    }

    sendToUser(commandID: command.ID, newObjs: any[]) {
        BOT.database.users.list.forEach(user => {
            if (user.settings
                && user.settings.alert
                && user.settings.alert[commandID + settings_suffix]) {
                const command = BOT.commands.find(commandID);
                if (command) {
                    const active = new Active({
                        user,
                        command,
                        args: newObjs.map(o => o.id),
                        chatID: user.id,
                    });
                    const possibleRewards = command.rewards(active).filter(rew =>
                        newObjs.map(o => o.id).includes(rew.id));
                    if (possibleRewards.length > 0) {
                        const message = check.rewards(possibleRewards, user.settings.filter)
                            .map(reward => command.name(active)
                                .nl()
                                .concat(reward.text))
                            .clean()
                            .join("\n");
                        active.send(message)
                    } else {
                        active.send()
                    }
                }
            }
        })
    }

}