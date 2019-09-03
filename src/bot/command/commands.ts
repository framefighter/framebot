import { Compare } from '../../utils/compare';
import { definitions } from './definitions';
import { Command } from './command';
import { alert_setting } from './definitions';
import { BOT } from '../..';

export class Commands implements command.Commands {
    triggers: string[];
    ids: command.ID[];
    list: command.Command[];
    constructor() {
        let commands = Object.keys(definitions).map((key) =>this.fromID(key as command.ID));
        this.list = commands.sort((a, b) => Compare.alphabet(a.id, b.id));
        this.ids = commands.map(cmd => cmd.id);
        this.triggers = Array.from(new Set<string>(commands.map(cmd => cmd.alt).flat()));
        if (this.triggers.length !== commands.map(cmd => cmd.alt).flat().length) {
            console.warn("Some alternative triggers have duplicates!")
        }
    }

    fromID(id: command.ID): Command {
        return new Command(id, definitions[id]);
    }

    find(cmdID: command.ID): Command | undefined;
    find(cmd: string, match: true): Command[];
    find(a1: string | command.ID, a2?: boolean): Command[] | Command | undefined {
        if (!a2) {
            return Array
                .from(this.list.values())
                .find(e => Compare.exact(e.id, a1)
                    || Compare.exact(e.alt, a1));
        }
        const matches = Array
            .from(this.list.values())
            .filter(e => Compare.loose(e.id, a1)
                || Compare.loose(e.alt, a1));
        return matches.clean();
    }

    parse(raw: string | undefined, match?: boolean): utils.Command | undefined {
        if (raw) {
            const cleaned = raw.trim()
            if (cleaned) {
                const removedSlash = raw.startsWith("/") ? raw.replace("/", "") : raw;
                if (removedSlash) {
                    const firstWord = removedSlash.split(" ")[0].trim();
                    const commandID = firstWord.split("@")[0];
                    const bot = firstWord.split("@")[1];
                    const rest = removedSlash.replace(commandID, "").trim();
                    const command = BOT.commands.find(commandID as command.ID);
                    const args = rest.split(",").map(e => e.trim()).clean();
                    if (command) {
                        return { command, args }
                    } else if (match) {
                        const commandArr = BOT.commands.find(commandID, true);
                        if (commandArr && commandArr.length > 0) {
                            return {
                                command: commandArr[0],
                                matches: commandArr,
                                args
                            }
                        }
                    }
                }
            }
        }
        return undefined;
    }
}
