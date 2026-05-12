import type { Point, DebrisSegment } from './types';

function rand(lo: number, hi: number): number {
  return lo + Math.random() * (hi - lo);
}

export function makeDebris(pts: Point[], cx: number, cy: number, color: string): DebrisSegment[] {
  return pts.map((p, i) => {
    const b   = pts[(i + 1) % pts.length];
    const mx  = (p[0] + b[0]) / 2 - cx;
    const my  = (p[1] + b[1]) / 2 - cy;
    const dist = Math.sqrt(mx * mx + my * my) || 1;
    const speed = 0.8 + Math.random() * 2.2;
    return {
      ax: p[0] - cx, ay: p[1] - cy,
      bx: b[0] - cx, by: b[1] - cy,
      x: cx, y: cy,
      vx: (mx / dist) * speed + (Math.random() - 0.5) * 1.5,
      vy: (my / dist) * speed + (Math.random() - 0.5) * 1.5,
      spin: rand(-0.1, 0.1),
      angle: 0,
      life: 1,
      decay: 0.008 + Math.random() * 0.012,
      color,
    };
  });
}

export function updateDebris(segs: DebrisSegment[]): DebrisSegment[] {
  return segs
    .map(s => ({
      ...s,
      x: s.x + s.vx,
      y: s.y + s.vy,
      vy: s.vy + 0.04,
      vx: s.vx * 0.995,
      angle: s.angle + s.spin,
      life: s.life - s.decay,
    }))
    .filter(s => s.life > 0);
}

export function drawDebris(ctx: CanvasRenderingContext2D, segs: DebrisSegment[]): void {
  segs.forEach(s => {
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.angle);
    ctx.globalAlpha = Math.max(0, s.life);
    ctx.strokeStyle = s.color;
    ctx.lineWidth   = 1.5;
    ctx.shadowColor = s.color;
    ctx.shadowBlur  = 6;
    ctx.beginPath();
    ctx.moveTo(s.ax, s.ay);
    ctx.lineTo(s.bx, s.by);
    ctx.stroke();
    ctx.restore();
  });
}
