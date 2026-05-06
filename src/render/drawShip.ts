import type { Point } from '../geometry';

export function drawPoly(
  ctx: CanvasRenderingContext2D,
  pts: Point[],
  fillColor: string,
  fillOpacity: number,
  strokeColor: string,
  strokeWidth: number,
  glow = false,
): void {
  if (pts.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  if (glow) { ctx.shadowColor = strokeColor; ctx.shadowBlur = 10; }
  else      { ctx.shadowBlur = 0; }
  ctx.fillStyle   = fillColor;
  ctx.globalAlpha = fillOpacity;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth   = strokeWidth;
  ctx.stroke();
  ctx.shadowBlur  = 0;
}
