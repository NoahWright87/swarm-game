import { buildBody, buildWing, SHIP_PRESETS } from '../geometry';
import type { Enemy } from './types';

const ENEMY_COLORS = ['#ff4466', '#ff9900', '#aa44ff', '#ff44aa', '#ff6644', '#ff2222'];
const ENEMY_COST  = { fighter: 1, bomber: 4, interceptor: 2, raider: 3, drone: 0.5 } as const;
const ENEMY_UNLOCK = { fighter: 0, interceptor: 2, bomber: 2, raider: 3, drone: 4 } as const;

type EnemyType = keyof typeof ENEMY_COST;

let nextId = 1000;

function rand(lo: number, hi: number) { return lo + Math.random() * (hi - lo); }
function randI(lo: number, hi: number) { return Math.floor(rand(lo, hi + 1)); }
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function buildShipGeometry(type: EnemyType) {
  const presetKey = type === 'fighter' ? 'fighter'
                  : type === 'bomber'  ? 'bomber'
                  : type === 'interceptor' ? 'interceptor'
                  : type === 'raider'  ? 'raider'
                  : 'drone';
  const preset = SHIP_PRESETS[presetKey];
  const body   = buildBody(preset.body);
  const rWing  = buildWing(preset.wing,  body.attachX, body.attachY,  1);
  const lWing  = buildWing(preset.wing, -body.attachX, body.attachY, -1);
  return { body, rWing, lWing };
}

export function mkEnemy(type: EnemyType, x: number, y: number, wave: number): Enemy {
  const color    = pick(ENEMY_COLORS);
  const hpScale  = 1 + Math.floor(wave / 5) * 0.2;
  const { body, rWing, lWing } = buildShipGeometry(type);

  const base: Enemy = {
    id: nextId++,
    type,
    bodyPts: body.pts,
    rWingPts: rWing.pts,
    lWingPts: lWing.pts,
    cx: body.cx, cy: body.cy,
    x, y, angle: Math.PI,
    vx: 0, vy: 0,
    health: hpScale, maxHealth: hpScale,
    color, xpValue: 20,
    fireTimer: randI(60, 140),
    behavior: 'down',
    shootsAt: wave >= 2,
    dead: false,
  };

  switch (type) {
    case 'fighter':
      return { ...base, vy: rand(0.7, 1.1), xpValue: 20 };
    case 'bomber':
      return { ...base, vy: rand(0.3, 0.5), health: hpScale * 3.5, maxHealth: hpScale * 3.5, behavior: 'tank', xpValue: 55, shootsAt: true };
    case 'interceptor':
      return { ...base, vy: rand(0.9, 1.3), health: hpScale * 0.65, maxHealth: hpScale * 0.65, xpValue: 28 };
    case 'raider': {
      const goRight = x < 195;
      return { ...base, vx: goRight ? rand(2, 3) : -rand(2, 3), vy: 0, angle: goRight ? Math.PI * 0.5 : Math.PI * 1.5, health: hpScale * 0.7, maxHealth: hpScale * 0.7, behavior: 'strafe', xpValue: 65, shootsAt: true };
    }
    case 'drone':
      return { ...base, vy: rand(1.0, 1.4), health: hpScale * 0.35, maxHealth: hpScale * 0.35, behavior: 'swarm', xpValue: 8, shootsAt: false };
  }
}

export function buildWave(wave: number): Enemy[] {
  const W      = 390;
  const budget = 4 + wave * 1.5;
  const avail  = (Object.keys(ENEMY_COST) as EnemyType[]).filter(t => ENEMY_UNLOCK[t] <= wave);
  const enemies: Enemy[] = [];
  let spent = 0;

  // Always spawn raiders off the sides if unlocked
  if (wave >= 3) {
    const rc = 1 + Math.floor((wave - 3) / 3);
    for (let i = 0; i < rc; i++) {
      const fl = i % 2 === 0;
      enemies.push(mkEnemy('raider', fl ? -30 : W + 30, rand(80, 220), wave));
      spent += ENEMY_COST.raider;
    }
  }

  // Always spawn drone swarms if unlocked
  if (wave >= 4) {
    const gc = 1 + Math.floor((wave - 4) / 4);
    for (let g = 0; g < gc; g++) {
      const gx = rand(60, W - 60), gy = -50 - g * 70;
      const gvy = rand(1.0, 1.5), gvx = rand(-0.3, 0.3);
      for (let i = 0; i < randI(3, 5); i++) {
        const e = mkEnemy('drone', gx + rand(-30, 30), gy + rand(-15, 15), wave);
        enemies.push({ ...e, vx: gvx, vy: gvy });
        spent += ENEMY_COST.drone;
      }
    }
  }

  // Fill remainder from budget
  const nonSwarm = avail.filter(t => t !== 'raider' && t !== 'drone');
  let attempts = 0;
  while (spent < budget && attempts < 40) {
    attempts++;
    const type = pick(nonSwarm);
    const cost = ENEMY_COST[type];
    if (spent + cost > budget * 1.2) continue;
    const same  = enemies.filter(e => e.type === type).length;
    const cols  = Math.min(5, Math.ceil((budget - spent) / cost) + 1);
    const x     = 50 + (same % cols) * ((W - 100) / Math.max(cols - 1, 1));
    const y     = -40 - Math.floor(same / cols) * 70;
    enemies.push(mkEnemy(type, x, y, wave));
    spent += cost;
  }

  return enemies;
}
