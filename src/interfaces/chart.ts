export interface Chart {
    columns: Array<Column>
    types: Types
    colors: {[key: string]: string}
    names: {[key: string]: string}
}

export type Column = [String, ...Array<number | string>]

export enum Type {
    Line = 'line',
    X = 'x'
}

export type Types = {[key: string]: Type}