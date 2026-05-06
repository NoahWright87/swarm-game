import type { Point, DebrisSegment } from '../geometry';

export interface Stats {
  // Movement
  speed: number;
  // Weapons
  bulletCount: number;
  shotsPerSec: number;
  damage: number;
  bulletSpeed: number;
  pierce: number;
  missileCount: number;
  // Combat
  critChance: number;
  critMult: number;
  lifeSteal: number;
  // Sustain
  regenPerSec: number;
  // Meta
  xpBonus: number;
}

export interface SwarmShip {
  id: number;
  role: 'fighter';
  // Precomputed geometry (local space, centered at 0,0)
  bodyPts: Point[];
  lWingPts: Point[];
  rWingPts: Point[];
  cx: number; cy: number;
  color: string;
  health: number;
  maxHealth: number;
  // Firing
  fireTimer: number;
  missileTimer: number;
  // Orbit behavior
  orbitAngle: number;
  orbitRadius: number;
  // World position (updated each frame)
  x: number; y: number; angle: number;
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
  apply: (s: Stats) => Stats;
}

export interface GameState {
  mode: 'playing' | 'upgrade' | 'gameover';
  frame: number;
  wave: number;
  level: number;
  xp: number;
  xpNeeded: number;
  // The center of mass — what the player actually steers
  cx: number; cy: number;
  cvx: number; cvy: number;
  // Fleet
  swarm: SwarmShip[];
  stats: Stats;
  regenAccum: number;
  // Entities
  enemies: Enemy[];
  playerBullets: Bullet[];
  enemyBullets: Bullet[];
  debris: DebrisSegment[];
  damageNumbers: DamageNumber[];
  // Wave state
  waveActive: boolean;
  waveTimer: number;
  upgradeChoices: Upgrade[];
  // Input
  touchTarget: { x: number; y: number } | null;
  keys: Record<string, boolean>;
}
