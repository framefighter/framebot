import { Active } from '../active/active';
import { Check } from '../../utils/check';
import { BOT } from '../..';
import { User } from '../user/user';
import { fromJSON } from 'tough-cookie';

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
                && user.settings.alert[commandID]) {
                const command = BOT.commands.find(commandID);
                if (command) {
                    const active = new Active({
                        user: new User(user),
                        command,
                        args: newObject.map(o => o.id),
                        chatID: user.id,
                    });
                    const possibleRewards = command.rewards(active).filter(rew =>
                        newObject.map(o => o.id).includes(rew.id));
                    let message = undefined;
                    if (possibleRewards.length > 0) {
                        message = Check.rewards(possibleRewards, user.settings.filter)
                            .map(reward => command.name(active)
                                .nl()
                                .concat(reward.text))
                            .clean()
                            .join("\n");
                    }
                    active.send(message)
                }
            }
        })
    }
}