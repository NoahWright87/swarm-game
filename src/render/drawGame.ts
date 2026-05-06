import { transformPoly, drawDebris } from '../geometry';
import type { GameState } from '../game';
import { drawPoly } from './drawShip';
import { drawHUD } from './drawHUD';
import { drawUpgrade } from './drawUpgrade';

const W = 390, H = 700;

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }

export function drawGame(ctx: CanvasRenderingContext2D, gs: GameState): void {
  // Background
  ctx.fillStyle = '#080c14';
  ctx.fillRect(0, 0, W, H);

  // Stars
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  for (let i = 0; i < 60; i++)
    ctx.fillRect((i * 137.5) % W, (i * 97.3 + gs.frame * (i % 3 === 0 ? 0.4 : 0.2)) % H, 1, 1);

  if (gs.mode === 'gameover') {
    drawDebris(ctx, gs.debris);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff4466'; ctx.globalAlpha = 0.9;
    ctx.font = 'bold 40px system-ui'; ctx.fillText('DESTROYED', W / 2, H / 2 - 20);
    ctx.font = '16px system-ui'; ctx.fillStyle = '#aaa';
    ctx.fillText(`Wave ${gs.wave}  ·  Level ${gs.level}`, W / 2, H / 2 + 18);
    ctx.fillText('tap to restart', W / 2, H / 2 + 44);
    ctx.globalAlpha = 1;
    return;
  }

  if (gs.mode === 'upgrade') {
    drawUpgrade(ctx, gs);
    return;
  }

  // Enemies
  gs.enemies.forEach(e => {
    const hp = clamp(e.health / e.maxHealth, 0, 1);
    const body  = transformPoly(e.bodyPts,  e.x, e.y, e.angle);
    const lWing = transformPoly(e.lWingPts, e.x, e.y, e.angle);
    const rWing = transformPoly(e.rWingPts, e.x, e.y, e.angle);
    const sw    = e.behavior === 'tank' ? 2 : 1.5;
    drawPoly(ctx, lWing, e.color, hp * 0.45 + 0.05, e.color, sw,    hp > 0.4);
    drawPoly(ctx, rWing, e.color, hp * 0.45 + 0.05, e.color, sw,    hp > 0.4);
    drawPoly(ctx, body,  e.color, hp * 0.55 + 0.05, e.color, sw + 0.5, hp > 0.4);
  });

  // Swarm ships
  gs.swarm.forEach(s => {
    const hp = clamp(s.health / s.maxHealth, 0, 1);
    const fl  = hp < 0.2 ? (Math.random() > 0.15 ? 1 : 0.3) : 1;
    const body  = transformPoly(s.bodyPts,  s.x, s.y, s.angle);
    const lWing = transformPoly(s.lWingPts, s.x, s.y, s.angle);
    const rWing = transformPoly(s.rWingPts, s.x, s.y, s.angle);
    drawPoly(ctx, lWing, s.color, hp * fl * 0.5 + 0.05, s.color, 1.5, hp > 0.3);
    drawPoly(ctx, rWing, s.color, hp * fl * 0.5 + 0.05, s.color, 1.5, hp > 0.3);
    drawPoly(ctx, body,  s.color, hp * fl * 0.65 + 0.05, s.color, 2,  hp > 0.3);
  });

  // Player bullets
  gs.playerBullets.forEach(b => {
    ctx.save();
    ctx.shadowColor = b.color; ctx.shadowBlur = b.isMissile ? 14 : 8;
    ctx.strokeStyle = b.color; ctx.lineWidth = b.thick; ctx.globalAlpha = 0.95;
    ctx.beginPath();
    ctx.moveTo(b.x, b.y - (b.isMissile ? 8 : 5));
    ctx.lineTo(b.x, b.y + (b.isMissile ? 8 : 5));
    ctx.stroke();
    ctx.restore();
  });

  // Enemy bullets
  gs.enemyBullets.forEach(b => {
    ctx.save();
    ctx.shadowColor = '#ffff44'; ctx.shadowBlur = 6;
    ctx.strokeStyle = '#ffff44'; ctx.lineWidth = 2; ctx.globalAlpha = 0.85;
    ctx.beginPath(); ctx.moveTo(b.x, b.y - 4); ctx.lineTo(b.x, b.y + 4); ctx.stroke();
    ctx.restore();
  });

  drawDebris(ctx, gs.debris);

  // Damage numbers
  gs.damageNumbers.forEach(n => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, n.life);
    ctx.fillStyle = n.color;
    ctx.font = `bold ${n.size}px system-ui`;
    ctx.textAlign = 'center';
    ctx.shadowColor = n.color; ctx.shadowBlur = 5;
    ctx.fillText(n.text, n.x, n.y);
    ctx.restore();
  });

  drawHUD(ctx, gs);
}
