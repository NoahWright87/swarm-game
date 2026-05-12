export type Point = [number, number];

export interface BodyParams {
  length: number;
  width: number;
  apexPos: number;
  noseTaper: number;
  tailTaper: number;
  connPos: number;
}

export type TipStyle = 'flat' | 'pointed' | 'angled' | 'handlebar' | 'talon' | 'scoop';

export interface WingParams {
  rootWidth: number;
  tipWidth: number;
  span: number;
  sweep: number;
  tipStyle: TipStyle;
  tipParams: Record<string, number>;
}

export interface BuiltBody {
  pts: Point[];
  attachX: number;
  attachY: number;
  cx: number;
  cy: number;
}

export interface BuiltWing {
  pts: Point[];
  cx: number;
  cy: number;
}

export interface DebrisSegment {
  ax: number; ay: number;
  bx: number; by: number;
  x: number; y: number;
  vx: number; vy: number;
  spin: number; angle: number;
  life: number; decay: number;
  color: string;
}
