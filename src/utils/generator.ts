export class Generator implements utils.Generator {
    static ID(): string {
        return '_' + Math.random().toString(36).substr(2, 9);
    }
}