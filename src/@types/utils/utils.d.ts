declare namespace utils {
    interface Config {
        token: string;
        password: string;
    }
    class Command {
        command: command.Command;
        matches?: command.Command[];
        args: string[];
    }

    interface Time {
        min: number;
        sec: number;
    }

    interface Format {
        position: number | string;
        caption: string;
        addCaption: string;
        subCaption: string;
        description: string;
        standing: number | string;
        list: (string | undefined)[];
        chance: number | string;
        time: string | number;
        faction: string;
        boss: string;
        start: string | number;
        end: string | number;
        link: string;
        text: string;
    }
}