import type { GameState } from '../game';

const W = 390, H = 700;

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }

export function drawHUD(ctx: CanvasRenderingContext2D, gs: GameState): void {
  const totalHP    = gs.swarm.reduce((s, ship) => s + ship.health, 0);
  const totalMaxHP = gs.swarm.reduce((s, ship) => s + ship.maxHealth, 0);
  const hpFrac     = totalMaxHP > 0 ? clamp(totalHP / totalMaxHP, 0, 1) : 0;

  // Hull bar
  const hbx = 14, hby = H - 28, hbw = 130, hbh = 8;
  ctx.fillStyle = '#0d1e1e';
  ctx.fillRect(hbx, hby, hbw, hbh);
  ctx.fillStyle = hpFrac > 0.4 ? '#00ffff' : '#ff4466';
  ctx.fillRect(hbx, hby, hbw * hpFrac, hbh);
  ctx.strokeStyle = '#0ff3'; ctx.lineWidth = 1;
  ctx.strokeRect(hbx, hby, hbw, hbh);
  ctx.fillStyle = '#445'; ctx.font = '9px system-ui'; ctx.textAlign = 'left';
  ctx.fillText(`HULL  ${Math.ceil(totalHP)}/${totalMaxHP}  [${gs.swarm.length}]`, hbx, hby - 3);

  // XP bar
  const xbx = W - 144, xby = H - 28, xbw = 130, xbh = 8;
  ctx.fillStyle = '#0d0d1e';
  ctx.fillRect(xbx, xby, xbw, xbh);
  ctx.fillStyle = '#aa44ff';
  ctx.fillRect(xbx, xby, xbw * (gs.xp / gs.xpNeeded), xbh);
  ctx.strokeStyle = '#aa44ff44'; ctx.lineWidth = 1;
  ctx.strokeRect(xbx, xby, xbw, xbh);
  ctx.fillStyle = '#445'; ctx.font = '9px system-ui'; ctx.textAlign = 'right';
  ctx.fillText(`LVL ${gs.level}  XP`, xbx + xbw, xby - 3);

  // Wave counter
  ctx.fillStyle = '#334'; ctx.font = '11px system-ui'; ctx.textAlign = 'center';
  ctx.fillText(`WAVE ${gs.wave}`, W / 2, H - 18);

  // Wave cleared flash
  if (!gs.waveActive && gs.waveTimer > 0) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, gs.waveTimer / 40);
    ctx.fillStyle = '#00ffff'; ctx.font = 'bold 20px system-ui'; ctx.textAlign = 'center';
    ctx.shadowColor = '#00ffff'; ctx.shadowBlur = 18;
    ctx.fillText('WAVE CLEARED', W / 2, H / 2);
    if (gs.xp >= gs.xpNeeded) {
      ctx.font = '13px system-ui'; ctx.fillStyle = '#aa44ff';
      ctx.fillText('LEVEL UP READY', W / 2, H / 2 + 26);
    }
    ctx.restore();
  }

  // Touch crosshair
  if (gs.touchTarget) {
    const { x: tx, y: ty } = gs.touchTarget;
    ctx.save();
    ctx.strokeStyle = '#0ff4'; ctx.lineWidth = 1; ctx.globalAlpha = 0.4;
    ctx.beginPath(); ctx.arc(tx, ty, 8, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(tx - 13, ty); ctx.lineTo(tx + 13, ty); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(tx, ty - 13); ctx.lineTo(tx, ty + 13); ctx.stroke();
    ctx.restore();
  }
}
