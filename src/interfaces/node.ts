export interface PyxNode {
    tag: string;
    id?: string;
    classList?: Array<string>
    children?: Array<PyxNode>
}