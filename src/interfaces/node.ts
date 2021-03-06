export interface PxyupNode {
  tag: string;
  skip?: boolean;
  attrs?: { [key: string]: any };
  classList?: Array<string>;
  children?: Array<PxyupNode | HTMLElement | SVGElement>;
  textValue?: string;
}
