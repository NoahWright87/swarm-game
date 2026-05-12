import type { Point } from './types';

export function transformPoly(pts: Point[], x: number, y: number, angle: number): Point[] {
  const c = Math.cos(angle), s = Math.sin(angle);
  return pts.map(([px, py]) => [
    x + px * c - py * s,
    y + px * s + py * c,
  ]);
}

export function pointInPoly(px: number, py: number, pts: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi))
      inside = !inside;
  }
  return inside;
}

// Fast radius check for bullet vs ship center — used before expensive pointInPoly
export function withinRadius(ax: number, ay: number, bx: number, by: number, r: number): boolean {
  const dx = ax - bx, dy = ay - by;
  return dx * dx + dy * dy < r * r;
}
