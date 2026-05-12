import { CONN } from './connectors';
import type { WingParams, BuiltWing, Point } from './types';

export function buildWing(w: WingParams, rootX: number, rootY: number, dir: 1 | -1): BuiltWing {
  const conn    = CONN.wing;
  const tabTopY = rootY - conn.halfWidth;
  const tabBotY = rootY + conn.halfWidth;
  const tabTipX = rootX - dir * conn.depth;
  const halfRoot = w.rootWidth / 2;

  const RA: Point = [rootX, rootY - halfRoot];
  const RB: Point = [rootX, tabTopY];
  const RC: Point = [tabTipX, rootY];
  const RD: Point = [rootX, tabBotY];
  const RE: Point = [rootX, rootY + halfRoot];

  const tx = rootX + w.span * dir;
  const ty = rootY + w.sweep;
  const D: Point = [tx, ty - w.tipWidth / 2];
  const C: Point = [tx, ty + w.tipWidth / 2];
  const tp = w.tipParams;
  const e  = dir;

  let extra: Point[] = [];
  switch (w.tipStyle) {
    case 'pointed': {
      const my = (C[1] + D[1]) / 2 + (tp['bias'] ?? 0);
      extra = [[tx + e * (tp['reach'] ?? 20), my]];
      break;
    }
    case 'angled':
      extra = [[tx + e * (tp['botOut'] ?? 5), C[1]], [tx + e * (tp['topOut'] ?? 15), D[1]]];
      break;
    case 'handlebar': {
      const tipH  = C[1] - D[1];
      const barH  = tp['height'] ?? 20;
      const maxPos = Math.max(0, (barH - tipH) / 2);
      const pos   = Math.max(-maxPos, Math.min(maxPos, tp['position'] ?? 0));
      const bcy   = (D[1] + C[1]) / 2 + pos;
      const hh    = barH / 2;
      const bx    = tx + e * (tp['depth'] ?? 20);
      extra = [[tx, bcy + hh], [bx, bcy + hh], [bx, bcy - hh], [tx, bcy - hh]];
      break;
    }
    case 'talon': {
      const reach  = tp['reach'] ?? 20;
      const spread = tp['spread'] ?? 12;
      extra = [[tx + e * reach, C[1] + spread], [tx + e * reach, D[1] - spread]];
      break;
    }
    case 'scoop': {
      const depth = tp['depth'] ?? 22;
      const my    = (C[1] + D[1]) / 2 + (tp['bias'] ?? 0);
      extra = [[tx - e * depth * 0.6, my]];
      break;
    }
  }

  const pts: Point[] = [RA, RB, RC, RD, RE, C, ...extra, D];
  const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
  const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  return { pts, cx, cy };
}
