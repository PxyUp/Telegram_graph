export interface Chart {
  columns: Array<Column>;
  types: Types;
  colors: { [key: string]: string };
  names: { [key: string]: string };
}

export interface LinePoints {
  x1: number | string;
  x2: number | string;
  y1: number | string;
  y2: number | string;
}

export interface Point {
  x: number | string;
  y: number | string;
}

export interface ChartOptions {
  withoutPreview?: boolean;
  withoutControls?: boolean;
  chartsContainer?: Container;
  previewContainer?: Container;
  horizontSteps?: number;
}

export interface Container {
  size: RectangleOptions;
}

export interface RectangleOptions {
  width: string | number;
  height: string | number;
}

export type Column = [String, ...Array<number>];

export enum Type {
  Line = 'line',
  X = 'x',
}

export type Types = { [key: string]: Type };
