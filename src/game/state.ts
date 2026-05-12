import { buildBody, buildWing, SHIP_PRESETS } from '../geometry';
import { defaultStats } from './upgrades';
import { xpForLevel } from './xp';
import type { GameState, SwarmShip } from './types';

const W = 390, H = 700;
const TAU = Math.PI * 2;
const SWARM_COLOR = '#00ffff';

let nextShipId = 0;

export function mkSwarmFighter(slotIndex: number, orbitRadius: number): SwarmShip {
  const preset = SHIP_PRESETS['swarmFighter'];
  const body   = buildBody(preset.body);
  const rWing  = buildWing(preset.wing,  body.attachX, body.attachY,  1);
  const lWing  = buildWing(preset.wing, -body.attachX, body.attachY, -1);
  return {
    id: nextShipId++,
    role: 'fighter',
    bodyPts: body.pts,
    rWingPts: rWing.pts,
    lWingPts: lWing.pts,
    cx: body.cx, cy: body.cy,
    color: SWARM_COLOR,
    health: 3, maxHealth: 3,
    fireTimer: Math.random() * 40,
    missileTimer: Math.random() * 60,
    slotIndex,
    orbitRadius,
    x: W / 2 + Math.cos((TAU / 3) * slotIndex - Math.PI / 2) * orbitRadius,
    y: H - 110 + Math.sin((TAU / 3) * slotIndex - Math.PI / 2) * orbitRadius,
  };
}

export function initState(): GameState {
  const swarm: SwarmShip[] = [0, 1, 2].map(i => mkSwarmFighter(i, 55));

  return {
    mode: 'playing',
    frame: 0,
    wave: 0,
    level: 1,
    xp: 0,
    xpNeeded: xpForLevel(1),
    cx: W / 2,
    cy: H - 110,
    cvx: 0, cvy: 0,
    orbitPhase: -Math.PI / 2,
    swarm,
    stats: defaultStats(),
    regenAccum: 0,
    enemies: [],
    playerBullets: [],
    enemyBullets: [],
    debris: [],
    explosions: [],
    damageNumbers: [],
    waveActive: false,
    waveTimer: 0,
    upgradeChoices: [],
    autoLevelUp: false,
    autoPickTimer: 0,
    touchTarget: null,
    keys: {},
  };
}
