export interface PyxNode {
    tag: string;
    id?: string;
    skip?: boolean;
    attrs?: {[key: string]: any};
    classList?: Array<string>
    children?: Array<PyxNode>
    value?: string;
}