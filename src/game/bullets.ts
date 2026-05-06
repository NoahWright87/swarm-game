import type { Bullet, Stats } from './types';

const MISSILE_FIRE_MULT = 0.85;
const MISSILE_DMG_MULT  = 1.1;

export { MISSILE_FIRE_MULT, MISSILE_DMG_MULT };
export const MISSILE_SPLASH_R    = 38;
export const MISSILE_SPLASH_FRAC = 0.5;

export function fireBullets(s: Stats, x: number, y: number): Bullet[] {
  const n = s.bulletCount;
  const sp = n > 1 ? 0.18 * (n - 1) : 0;
  const out: Bullet[] = [];
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0 : (i / (n - 1) - 0.5) * 2;
    const a = -Math.PI / 2 + t * sp;
    out.push({
      x, y: y - 14,
      vx: Math.cos(a) * s.bulletSpeed,
      vy: Math.sin(a) * s.bulletSpeed,
      damage: s.damage, pierce: s.pierce, pierceMult: 1,
      critChance: s.critChance, critMult: s.critMult, lifeSteal: s.lifeSteal,
      isMissile: false, color: '#ffffff', thick: 1.5 + s.damage * 0.15,
    });
  }
  return out;
}

export function fireMissiles(s: Stats, x: number, y: number): Bullet[] {
  if (s.missileCount <= 0) return [];
  const n = s.missileCount;
  const sp = n > 1 ? 0.22 * (n - 1) : 0;
  const out: Bullet[] = [];
  for (let i = 0; i < n; i++) {
    const t   = n === 1 ? 0 : (i / (n - 1) - 0.5) * 2;
    const a   = -Math.PI / 2 + t * sp;
    const spd = s.bulletSpeed * MISSILE_FIRE_MULT;
    out.push({
      x, y: y - 14,
      vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
      damage: s.damage * MISSILE_DMG_MULT, pierce: s.pierce, pierceMult: 1,
      critChance: s.critChance, critMult: s.critMult, lifeSteal: s.lifeSteal,
      isMissile: true, color: '#ff8800', thick: 3,
    });
  }
  return out;
}
