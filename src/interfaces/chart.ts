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

export interface PointWithColor extends Point {
  color: string;
}

export interface PointWithValue extends Point {
  value: number;
  date: number;
}

export interface PointWithValueAndColor extends Point {
  value: number;
  color: string;
  date: number;
  key?: string;
}

export interface ChartOptions {
  withoutPreview?: boolean;
  withoutControls?: boolean;
  withoutNightMode?: boolean;
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

export interface MinMax {
  min: number;
  max: number;
}
