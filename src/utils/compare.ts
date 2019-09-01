import { Check } from './check';

export class Compare implements utils.Compare {
    static loose(a: any, b: any): boolean {
        return this.compare(a, b, this.includes);
    }

    static exact(a: any, b: any): boolean {
        return this.compare(a, b, (a, b) => a.toUpperCase() === b.toUpperCase());
    }

    static compare(a: any, b: any, comparator: (a: string, b: string) => boolean): boolean {
        if (!a || !b) return false;
        if (a === b) return true;
        if (Check.string(a) && Check.string(b)) {
            const aStr = (a as String).toUpperCase();
            const bStr = (b as String).toUpperCase();
            if (comparator(aStr, bStr)) return true;
        } else if (Check.string(a)) {
            const aStr = (a as String).toUpperCase();
            if (Check.array(b)) {
                const bArr = (b as Array<any>);
                for (let bEl of bArr) {
                    if (!bEl) continue;
                    if (aStr === bEl) return true;
                    if (Check.string(bEl)) {
                        const bStr = (bEl as String).toUpperCase();
                        if (comparator(aStr, bStr)) return true;
                    }
                }
            }
        } else if (Check.string(b)) {
            const bStr = (b as String).toUpperCase();
            if (Check.array(a)) {
                const aArr = (a as Array<any>);
                for (let aEl of aArr) {
                    if (!aEl) continue;
                    if (bStr === aEl) return true;
                    if (Check.string(aEl)) {
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
    static dates(a?: string, b?: string): number {
        const aTime = new Date(a || "").getTime();
        const BTime = new Date(b || "").getTime();
        if (aTime < BTime) {
            return 1
        }
        if (aTime > BTime) {
            return -1
        }
        return 0
    }

    static alphabet(a?: string, b?: string): number {
        const A = (a || "").toUpperCase();
        const B = (b || "").toUpperCase();
        if (A < B) {
            return -1;
        }
        if (A > B) {
            return 1;
        }
        return 0;
    }
}