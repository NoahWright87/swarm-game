import { CONN, BODY_CX } from './connectors';
import type { BodyParams, BuiltBody, Point } from './types';

export function buildBody(b: BodyParams): BuiltBody {
  // Centered at (0,0): nose at top (-length/2), tail at bottom (+length/2)
  const top    = -b.length / 2;
  const bottom =  b.length / 2;
  const apexY  = top + b.length * b.apexPos;
  const nb     = b.width * (1 - b.noseTaper / 100) * 0.35;
  const tb     = b.width * (1 - b.tailTaper / 100) * 0.35;

  function hullX(y: number): number {
    if (y <= apexY) {
      const t  = Math.max(0, Math.min(1, (y - top) / Math.max(1, apexY - top)));
      const nw = b.noseTaper > 85 ? 0 : nb;
      return BODY_CX + nw + (b.width - nw) * t;
    }
    const t  = Math.max(0, Math.min(1, (y - apexY) / Math.max(1, bottom - apexY)));
    const tw = b.tailTaper > 85 ? 0 : tb;
    return BODY_CX + b.width - (b.width - tw) * t;
  }

  const conn      = CONN.wing;
  const connY     = top + b.length * b.connPos;
  const connHullX = hullX(connY);
  const safeTop   = Math.max(top + 2,    connY - conn.halfWidth);
  const safeBot   = Math.min(bottom - 2, connY + conn.halfWidth);

  const rightEdge: Point[] = [];
  if (b.noseTaper > 85) rightEdge.push([BODY_CX, top]);
  else                  rightEdge.push([BODY_CX + nb, top]);
  rightEdge.push(
    [hullX(safeTop), safeTop],
    [connHullX - conn.depth, connY],
    [hullX(safeBot), safeBot],
  );
  if (b.tailTaper > 85) rightEdge.push([BODY_CX, bottom]);
  else                  rightEdge.push([BODY_CX + tb, bottom]);

  const leftEdge: Point[] = rightEdge.slice(1, -1).reverse().map(([x, y]) => [2 * BODY_CX - x, y]);

  const nosePts: Point[] = b.noseTaper > 85
    ? [[BODY_CX, top]]
    : [[BODY_CX - nb, top], [BODY_CX + nb, top]];
  const tailPts: Point[] = b.tailTaper > 85
    ? [[BODY_CX, bottom]]
    : [[BODY_CX + tb, bottom], [BODY_CX - tb, bottom]];

  const pts: Point[] = [...nosePts, ...rightEdge.slice(1), ...tailPts.slice(1), ...leftEdge];

  return {
    pts,
    attachX: connHullX,
    attachY: connY,
    cx: BODY_CX,
    cy: (top + bottom) / 2,
  };
}
