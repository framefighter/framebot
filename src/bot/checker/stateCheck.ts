import { Active } from '../active/active';
import { Check } from '../../utils/check';
import { suffix } from '../command/definitions';
import { BOT } from '../..';

export default class StateCheck implements checker.StateCheck {
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
            let newObject = [];
            if (Array.isArray(obj)) {
                const arrObj = obj as Array<any>;
                arrObj.map((n: any) => {
                    if (BOT.database.notifications.add(
                        BOT.database.notifications.generateID(n, command)
                    )) {
                        newObject.push(n)
                    }
                })
            } else {
                if (BOT.database.notifications.add(
                    BOT.database.notifications.generateID(obj, command))) {
                    newObject.push(obj)
                }
            }
            if (newObject.length > 0) this.sendToUser(command, newObject);
        }
    }

    sendToUser(commandID: command.ID, newObject: any[]) {
        BOT.database.users.list.forEach(user => {
            if (user.settings
                && user.settings.alert
                && user.settings.alert[commandID + suffix().setting]) {
                const command = BOT.commands.find(commandID);
                if (command) {
                    const active = new Active({
                        user,
                        command,
                        args: newObject.map(o => o.id),
                        chatID: user.id,
                    });
                    const possibleRewards = command.rewards(active).filter(rew =>
                        newObject.map(o => o.id).includes(rew.id));
                    if (possibleRewards.length > 0) {
                        const message = Check.rewards(possibleRewards, user.settings.filter)
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