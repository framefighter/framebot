import { check } from './check';

export class compare {
    static loose(a: any, b: any): boolean {
        return this.compare(a, b, this.includes);
    }

    static exact(a: any, b: any): boolean {
        return this.compare(a, b, (a, b) => a.toUpperCase() === b.toUpperCase());
    }

    static compare(a: any, b: any, comparator: (a: string, b: string) => boolean): boolean {
        if (!a || !b) return false;
        if (a === b) return true;
        if (check.string(a) && check.string(b)) {
            const aStr = (a as String).toUpperCase();
            const bStr = (b as String).toUpperCase();
            if (comparator(aStr, bStr)) return true;
        } else if (check.string(a)) {
            const aStr = (a as String).toUpperCase();
            if (check.array(b)) {
                const bArr = (b as Array<any>);
                for (let bEl of bArr) {
                    if (!bEl) continue;
                    if (aStr === bEl) return true;
                    if (check.string(bEl)) {
                        const bStr = (bEl as String).toUpperCase();
                        if (comparator(aStr, bStr)) return true;
                    }
                }
            }
        } else if (check.string(b)) {
            const bStr = (b as String).toUpperCase();
            if (check.array(a)) {
                const aArr = (a as Array<any>);
                for (let aEl of aArr) {
                    if (!aEl) continue;
                    if (bStr === aEl) return true;
                    if (check.string(aEl)) {
                        const aStr = (aEl as String).toUpperCase();
                        if (comparator(aStr, bStr)) return true;
                    }
                }
            }
        }
        return false
    }

    static includes(a: string, b: string): boolean {
        return a.toUpperCase().includes(b.toUpperCase())
            || b.toUpperCase().includes(a.toUpperCase());
    }
}