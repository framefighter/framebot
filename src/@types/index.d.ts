
declare interface String {
    code(): string
    bold(): string
    italics(): string
    link(url?: string): string
    indent(tabs?: number, start?: string): string
    alignRight(): string
    capitalize(): string
    clean(): string
    limitWidth(): string
    start(str?: string | number): string
    end(str?: string | number): string
    fromNow(): string
    nl(): string
    space(): string
    striptags(): string
    underline(): string
}

declare interface Array<T> {
    diff(arr: any[]): Array<T>
    clean(): Array<NonNullable<T>>
}

