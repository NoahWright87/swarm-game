import type { GameState } from '../game';

const W = 390;
const MISSILE_FIRE_MULT = 0.85;

export const UPGRADE_CARD_Y0 = 58 + 9 * 16 + 20;
export const UPGRADE_CARD_H  = 105;

const REROLL_BTN_Y  = UPGRADE_CARD_Y0 + 3 * (UPGRADE_CARD_H + 7) + 12;
const REROLL_BTN_H  = 36;
const REROLL_BTN_X  = 80;
const REROLL_BTN_W  = W - 160;

export function cardHitIndex(x: number, y: number, gs: GameState): number {
  for (let i = 0; i < gs.upgradeChoices.length; i++) {
    const by = UPGRADE_CARD_Y0 + i * (UPGRADE_CARD_H + 7);
    if (x >= 12 && x <= W - 12 && y >= by && y <= by + UPGRADE_CARD_H) return i;
  }
  return -1;
}

export function rerollHitTest(x: number, y: number): boolean {
  return x >= REROLL_BTN_X && x <= REROLL_BTN_X + REROLL_BTN_W
      && y >= REROLL_BTN_Y && y <= REROLL_BTN_Y + REROLL_BTN_H;
}

export function drawUpgrade(ctx: CanvasRenderingContext2D, gs: GameState): void {
  ctx.fillStyle = '#04090f'; ctx.fillRect(0, 0, W, 700);
  ctx.textAlign = 'center';
  ctx.shadowColor = '#00ffff'; ctx.shadowBlur = 18;
  ctx.fillStyle = '#00ffff'; ctx.globalAlpha = 0.95;
  ctx.font = 'bold 24px system-ui';
  ctx.fillText(`LEVEL ${gs.level}`, W / 2, 42);
  ctx.shadowBlur = 0; ctx.globalAlpha = 1;

  const s = gs.stats;
  const sx = 14, sy = 58;
  ctx.font = '11px system-ui';
  const rows: [string, string][] = [
    ['Ships',      `${gs.swarm.length}`],
    ['Bullets',    `${s.bulletCount}  @${s.shotsPerSec.toFixed(1)}/s`],
    ['Missiles',   s.missileCount > 0 ? `${s.missileCount}  @${(s.shotsPerSec * MISSILE_FIRE_MULT).toFixed(1)}/s` : 'none'],
    ['Damage',     s.damage.toFixed(1)],
    ['Pierce',     `${(s.pierce * 100).toFixed(0)}%`],
    ['Crit',       `${(s.critChance * 100).toFixed(0)}%  x${s.critMult.toFixed(2)}`],
    ['Life Steal', `${(s.lifeSteal * 100).toFixed(0)}%`],
    ['Speed',      s.speed.toFixed(1)],
    ['Regen',      `${s.regenPerSec}/s`],
  ];
  rows.forEach(([k, v], i) => {
    ctx.fillStyle = '#445'; ctx.textAlign = 'left';  ctx.fillText(k, sx, sy + i * 16);
    ctx.fillStyle = '#667'; ctx.textAlign = 'right'; ctx.fillText(v, sx + 115, sy + i * 16);
  });

  ctx.fillStyle = '#334'; ctx.font = '10px system-ui'; ctx.textAlign = 'center';
  ctx.fillText('── choose an upgrade ──', W / 2, sy + rows.length * 16 + 8);

  gs.upgradeChoices.forEach((u, i) => {
    const by = UPGRADE_CARD_Y0 + i * (UPGRADE_CARD_H + 7);
    const bx = 12, bw = W - 24;
    ctx.fillStyle = '#0a1520'; ctx.strokeStyle = '#00ffff44'; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.96;
    ctx.beginPath(); ctx.roundRect(bx, by, bw, UPGRADE_CARD_H, 8); ctx.fill(); ctx.stroke(); ctx.globalAlpha = 1;
    ctx.font = '20px system-ui'; ctx.textAlign = 'center'; ctx.fillStyle = '#00ffff';
    ctx.fillText(u.icon, W / 2, by + 28);
    ctx.font = 'bold 14px system-ui'; ctx.fillStyle = '#00ffff';
    ctx.fillText(u.label, W / 2, by + 50);
    ctx.font = '11px system-ui'; ctx.fillStyle = '#556';
    ctx.fillText(u.desc, W / 2, by + 68);
    ctx.font = '10px system-ui'; ctx.fillStyle = '#334';
    ctx.fillText('tap to choose', W / 2, by + 86);
  });

  // Reroll button
  ctx.save();
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = '#0a1520'; ctx.strokeStyle = '#334466'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect(REROLL_BTN_X, REROLL_BTN_Y, REROLL_BTN_W, REROLL_BTN_H, 6);
  ctx.fill(); ctx.stroke();
  ctx.font = 'bold 13px system-ui'; ctx.textAlign = 'center'; ctx.fillStyle = '#556688';
  ctx.shadowColor = '#334466'; ctx.shadowBlur = 6;
  ctx.fillText('↺  reroll', W / 2, REROLL_BTN_Y + 23);
  ctx.restore();
}
