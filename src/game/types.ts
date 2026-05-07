import type { Point, DebrisSegment } from '../geometry';

export interface Stats {
  speed: number;
  bulletCount: number;
  shotsPerSec: number;
  damage: number;
  bulletSpeed: number;
  pierce: number;
  missileCount: number;
  critChance: number;
  critMult: number;
  lifeSteal: number;
  regenPerSec: number;
  xpBonus: number;
}

export interface SwarmShip {
  id: number;
  role: 'fighter';
  bodyPts: Point[];
  lWingPts: Point[];
  rWingPts: Point[];
  cx: number; cy: number;
  color: string;
  health: number;
  maxHealth: number;
  fireTimer: number;
  missileTimer: number;
  // Orbit slot — position is orbitPhase + (TAU/N)*slotIndex, angle always 0 (facing up)
  slotIndex: number;
  orbitRadius: number;
  x: number; y: number;
}

export interface Enemy {
  id: number;
  type: string;
  bodyPts: Point[];
  lWingPts: Point[];
  rWingPts: Point[];
  cx: number; cy: number;
  x: number; y: number; angle: number;
  vx: number; vy: number;
  health: number; maxHealth: number;
  color: string; xpValue: number;
  fireTimer: number;
  behavior: 'down' | 'tank' | 'strafe' | 'swarm';
  shootsAt: boolean;
  dead: boolean;
}

export interface Bullet {
  x: number; y: number;
  vx: number; vy: number;
  damage: number;
  pierce: number;
  pierceMult: number;
  critChance: number;
  critMult: number;
  lifeSteal: number;
  isMissile: boolean;
  color: string;
  thick: number;
  hitIds: number[];  // enemy IDs already struck — prevents pierce re-hitting same enemy
}

export interface Explosion {
  x: number; y: number;
  radius: number;
  maxRadius: number;
  life: number;   // 1 → 0
  decay: number;
  color: string;
}

export interface DamageNumber {
  x: number; y: number;
  vy: number;
  life: number; decay: number;
  text: string; color: string; size: number;
}

export interface Upgrade {
  id: string;
  label: string;
  desc: string;
  icon: string;
  apply: (s: Stats, swarm: SwarmShip[]) => { stats: Stats; swarm: SwarmShip[] };
}

export interface GameState {
  mode: 'playing' | 'upgrade' | 'gameover';
  frame: number;
  wave: number;
  level: number;
  xp: number;
  xpNeeded: number;
  cx: number; cy: number;
  cvx: number; cvy: number;
  orbitPhase: number;  // shared phase, increments each frame
  swarm: SwarmShip[];
  stats: Stats;
  regenAccum: number;
  enemies: Enemy[];
  playerBullets: Bullet[];
  enemyBullets: Bullet[];
  debris: DebrisSegment[];
  explosions: Explosion[];
  damageNumbers: DamageNumber[];
  waveActive: boolean;
  waveTimer: number;
  upgradeChoices: Upgrade[];
  autoLevelUp: boolean;
  autoPickTimer: number;   // frames remaining before auto-pick fires (0 when inactive)
  touchTarget: { x: number; y: number } | null;
  keys: Record<string, boolean>;
}
