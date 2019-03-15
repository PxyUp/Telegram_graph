export interface PyxNode {
  tag: string;
  skip?: boolean;
  attrs?: { [key: string]: any };
  classList?: Array<string>;
  children?: Array<PyxNode | HTMLElement | SVGSVGElement>;
  textValue?: string;
}
