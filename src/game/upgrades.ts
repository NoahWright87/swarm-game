import type { Stats, Upgrade } from './types';

export const UPGRADES: Upgrade[] = [
  { id: 'proj',      label: '+1 Bullet',       desc: 'Fire one more bullet per shot',          icon: '+B',   apply: s => ({ ...s, bulletCount: s.bulletCount + 1 }) },
  { id: 'missile',   label: '+1 Missile',      desc: 'Add a missile (splash damage)',           icon: '+M',   apply: s => ({ ...s, missileCount: s.missileCount + 1 }) },
  { id: 'damage',    label: '+1 Damage',       desc: 'All weapons do +1 damage',               icon: '+D',   apply: s => ({ ...s, damage: s.damage + 1 }) },
  { id: 'firerate',  label: '+0.5 Shots/sec',  desc: 'Fire rate +0.5 shots per second',        icon: '+F',   apply: s => ({ ...s, shotsPerSec: s.shotsPerSec + 0.5 }) },
  { id: 'pierce',    label: '+10% Pierce',     desc: 'Bullets pierce for 10% damage to next',  icon: '>>',   apply: s => ({ ...s, pierce: s.pierce + 0.1 }) },
  { id: 'crit',      label: '+15% Crit',       desc: '15% more chance to multiply damage',     icon: '!C',   apply: s => ({ ...s, critChance: s.critChance + 0.15 }) },
  { id: 'critdmg',   label: '+0.1x Crit Mult', desc: 'Crit multiplier +0.1x (base 1.5x)',      icon: 'x+',   apply: s => ({ ...s, critMult: s.critMult + 0.1 }) },
  { id: 'bspeed',    label: '+10% Bullet Spd', desc: 'Bullets travel 10% faster',              icon: '+>',   apply: s => ({ ...s, bulletSpeed: s.bulletSpeed * 1.1 }) },
  { id: 'speed',     label: '+15% Move Speed', desc: 'Move 15% faster',                        icon: '+S',   apply: s => ({ ...s, speed: s.speed * 1.15 }) },
  { id: 'regen',     label: '+1 HP/sec Regen', desc: 'Hull repairs 1 HP per second',           icon: '+R',   apply: s => ({ ...s, regenPerSec: s.regenPerSec + 1 }) },
  { id: 'lifesteal', label: '+5% Life Steal',  desc: '5% chance per hit to steal 1 HP',        icon: '+L',   apply: s => ({ ...s, lifeSteal: s.lifeSteal + 0.05 }) },
  { id: 'xpbonus',   label: '+10% XP Gain',    desc: 'Earn 10% more XP from kills',            icon: '+X',   apply: s => ({ ...s, xpBonus: s.xpBonus + 1 }) },
];

export function pickUpgrades(n = 3): Upgrade[] {
  const pool = [...UPGRADES], out: Upgrade[] = [];
  while (out.length < n && pool.length)
    out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  return out;
}

export function defaultStats(): Stats {
  return {
    speed: 2.8,
    bulletCount: 1,
    shotsPerSec: 1.5,
    damage: 1,
    bulletSpeed: 7,
    pierce: 0,
    missileCount: 0,
    critChance: 0,
    critMult: 1.5,
    lifeSteal: 0,
    regenPerSec: 0,
    xpBonus: 0,
  };
}
