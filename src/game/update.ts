import { transformPoly, pointInPoly, withinRadius, makeDebris, updateDebris } from '../geometry';
import { resolveCrit, resolveLifeSteal } from './combat';
import { fireBullets, fireMissiles, MISSILE_FIRE_MULT, MISSILE_SPLASH_R, MISSILE_SPLASH_FRAC } from './bullets';
import { buildWave } from './enemies';
import { pickUpgrades } from './upgrades';
import { xpForLevel } from './xp';
import type { GameState, SwarmShip, Enemy, Bullet, DamageNumber } from './types';

const W = 390, H = 700;
const TAU = Math.PI * 2;
const ENEMY_BSPD = 3.0;
const ENEMY_RAM_BASE = 0.28;
const ORBIT_ANGULAR_SPEED = 0.022;
const HIT_RADIUS = 30; // broad-phase check radius

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function rand(lo: number, hi: number) { return lo + Math.random() * (hi - lo); }
function randI(lo: number, hi: number) { return Math.floor(rand(lo, hi + 1)); }

function mkNum(x: number, y: number, dmg: number, crit: boolean, splash: boolean): DamageNumber {
  return {
    x, y, vy: -1.8, life: 1, decay: 0.022,
    text: crit ? `${dmg.toFixed(1)}!` : dmg.toFixed(1),
    color: crit ? '#ffff00' : splash ? '#ff8800' : '#eeeeee',
    size: crit ? 15 : 11,
  };
}

function updateSwarmOrbits(ships: SwarmShip[], cx: number, cy: number): SwarmShip[] {
  return ships.map((s, i) => {
    const newAngle = s.orbitAngle + ORBIT_ANGULAR_SPEED;
    // Space ships evenly around orbit regardless of swarm size
    const offset = (TAU / ships.length) * i;
    const a = newAngle + offset;
    return {
      ...s,
      orbitAngle: newAngle,
      x: cx + Math.cos(a) * s.orbitRadius,
      y: cy + Math.sin(a) * s.orbitRadius,
      angle: a + Math.PI / 2,
    };
  });
}

function getWorldPoly(e: Enemy, part: 'body' | 'lWing' | 'rWing') {
  const pts = part === 'body' ? e.bodyPts : part === 'lWing' ? e.lWingPts : e.rWingPts;
  return transformPoly(pts, e.x, e.y, e.angle);
}

function getSwarmWorldPoly(s: SwarmShip, part: 'body' | 'lWing' | 'rWing') {
  const pts = part === 'body' ? s.bodyPts : part === 'lWing' ? s.lWingPts : s.rWingPts;
  return transformPoly(pts, s.x, s.y, s.angle);
}

export function update(gs: GameState): GameState {
  if (gs.mode !== 'playing') return gs;

  let { cx, cy, cvx, cvy, swarm, stats, regenAccum,
        enemies, playerBullets: pb, enemyBullets: eb,
        debris, damageNumbers, touchTarget, keys,
        frame, xp, xpNeeded, level, waveActive, waveTimer, wave,
        upgradeChoices } = gs;

  frame++;

  // ── Center of mass movement ───────────────────────────────────────────────
  let moving = false;
  if (keys['ArrowLeft'] || keys['a'])  { cvx -= 0.45; moving = true; }
  if (keys['ArrowRight'] || keys['d']) { cvx += 0.45; moving = true; }
  if (keys['ArrowUp'] || keys['w'])    { cvy -= 0.45; moving = true; }
  if (keys['ArrowDown'] || keys['s'])  { cvy += 0.45; moving = true; }

  if (touchTarget && !moving) {
    const dx = touchTarget.x - cx, dy = touchTarget.y - cy;
    const d  = Math.hypot(dx, dy);
    if (d > 8) { cvx = lerp(cvx, (dx / d) * stats.speed, 0.14); cvy = lerp(cvy, (dy / d) * stats.speed, 0.14); }
    else       { cvx *= 0.7; cvy *= 0.7; }
  }

  const sp2 = Math.hypot(cvx, cvy);
  if (sp2 > stats.speed) { cvx = (cvx / sp2) * stats.speed; cvy = (cvy / sp2) * stats.speed; }
  cvx *= 0.86; cvy *= 0.86;
  cx = clamp(cx + cvx, 60, W - 60);
  cy = clamp(cy + cvy, 80, H - 60);

  // ── Orbit swarm ships around center ──────────────────────────────────────
  swarm = updateSwarmOrbits(swarm, cx, cy);

  // ── Fleet-wide HP regen ───────────────────────────────────────────────────
  if (stats.regenPerSec > 0) {
    regenAccum += stats.regenPerSec / 60;
    if (regenAccum >= 1) {
      const heals = Math.floor(regenAccum);
      regenAccum %= 1;
      // Distribute heals to most damaged ships first
      swarm = [...swarm].sort((a, b) => (a.health / a.maxHealth) - (b.health / b.maxHealth));
      let rem = heals;
      swarm = swarm.map(s => {
        if (rem <= 0 || s.health >= s.maxHealth) return s;
        rem--;
        return { ...s, health: Math.min(s.maxHealth, s.health + 1) };
      });
    }
  }

  // ── Each swarm ship fires ─────────────────────────────────────────────────
  const fps    = 60 / stats.shotsPerSec;
  const fpsMsl = fps / MISSILE_FIRE_MULT;
  swarm = swarm.map(s => {
    let ft = s.fireTimer - 1, mt = s.missileTimer - 1;
    while (ft <= 0) {
      pb = [...pb, ...fireBullets(stats, s.x, s.y)];
      ft += fps;
    }
    if (stats.missileCount > 0) {
      while (mt <= 0) {
        pb = [...pb, ...fireMissiles(stats, s.x, s.y)];
        mt += fpsMsl;
      }
    }
    return { ...s, fireTimer: ft, missileTimer: mt };
  });

  // ── Move player bullets ───────────────────────────────────────────────────
  pb = pb
    .map(b => ({ ...b, x: b.x + b.vx, y: b.y + b.vy }))
    .filter(b => b.y > -60 && b.y < H + 20 && b.x > -40 && b.x < W + 40);

  // ── Move & update enemies ─────────────────────────────────────────────────
  let newDebris = [...debris];
  let newNums   = [...damageNumbers];
  let newXP     = xp;
  let newEB     = [...eb];
  // Fleet-wide total HP for life steal (we'll rebuild swarm as we process)
  let totalSwarmHP = swarm.reduce((s, ship) => s + ship.health, 0);

  let newE = enemies.map(e => {
    if (e.dead) return e;
    let { x, y, vx: evx, vy: evy, fireTimer: eft, behavior } = e;

    if (behavior !== 'strafe') {
      evx += Math.sin(frame * 0.018 + x) * 0.03;
      evx = clamp(evx, -1.5, 1.5);
      if (x < 20 || x > W - 20) evx *= -1;
    } else {
      evy = clamp(evy + 0.005, 0, 0.4);
    }
    x += evx; y += evy;
    eft--;

    if (e.shootsAt && eft <= 0) {
      if (behavior === 'strafe') {
        for (let bi = 0; bi < 3; bi++)
          newEB.push({ x, y: y + 18, vx: rand(-0.6, 0.6), vy: ENEMY_BSPD + rand(0, 0.5), damage: 0.12, pierce: 0, pierceMult: 1, critChance: 0, critMult: 1, lifeSteal: 0, isMissile: false, color: '#ffff44', thick: 2 });
        eft = randI(50, 90);
      } else {
        newEB.push({ x, y: y + 18, vx: rand(-0.4, 0.4), vy: ENEMY_BSPD + rand(-0.3, 0.3), damage: 0.12, pierce: 0, pierceMult: 1, critChance: 0, critMult: 1, lifeSteal: 0, isMissile: false, color: '#ffff44', thick: 2 });
        eft = randI(80, 160);
      }
    }

    // Ram check vs each swarm ship
    for (const ship of swarm) {
      if (!withinRadius(x, y, ship.x, ship.y, HIT_RADIUS + 20)) continue;
      const bodyWorld = getSwarmWorldPoly(ship, 'body');
      if (!pointInPoly(x, y, bodyWorld)) continue;
      const ramDmg  = ENEMY_RAM_BASE * (e.health / e.maxHealth);
      // Apply to the rammed ship directly
      const idx = swarm.indexOf(ship);
      swarm = swarm.map((s, i) => i === idx ? { ...s, health: Math.max(0, s.health - ramDmg) } : s);
      const nhp = e.health - e.maxHealth * 0.3;
      if (nhp <= 0) {
        newDebris.push(...makeDebris(getWorldPoly(e, 'body'), x, y, e.color));
        newDebris.push(...makeDebris(getWorldPoly(e, 'lWing'), x, y, e.color));
        newDebris.push(...makeDebris(getWorldPoly(e, 'rWing'), x, y, e.color));
        newXP = Math.min(newXP + Math.floor(e.xpValue * (1 + stats.xpBonus * 0.1)), xpNeeded);
        return { ...e, dead: true };
      }
      return { ...e, x, y, vx: evx, vy: evy, fireTimer: eft, health: nhp };
    }

    return { ...e, x, y, vx: evx, vy: evy, fireTimer: eft };
  });

  // Remove off-screen enemies
  newE = newE.filter(e => {
    if (e.dead) return false;
    if (e.behavior === 'strafe' && (e.x < -80 || e.x > W + 80)) return false;
    if (e.y > H + 40) return false;
    return true;
  });

  // ── Bullet vs enemy ───────────────────────────────────────────────────────
  const survived: Bullet[] = [];
  for (const b of pb) {
    let hit = false;
    let cm  = b.pierceMult;
    newE = newE.map(e => {
      if (e.dead) return e;
      if (!withinRadius(b.x, b.y, e.x, e.y, HIT_RADIUS)) return e;
      const bodyWorld = getWorldPoly(e, 'body');
      if (!pointInPoly(b.x, b.y, bodyWorld)) return e;

      hit = true;
      const { dmg: rd, crits } = resolveCrit(b.damage * cm, b.critChance, b.critMult);
      const fd = rd * 0.18; // damage scale (keeps early waves survivable)
      cm *= b.pierce || 1;

      // Life steal — heal random swarm ship (favour most damaged)
      const hs = resolveLifeSteal(b.lifeSteal);
      if (hs > 0) {
        totalSwarmHP += hs;
        const target = [...swarm].sort((a, z) => (a.health / a.maxHealth) - (z.health / z.maxHealth))[0];
        if (target) {
          swarm = swarm.map(s => s.id === target.id ? { ...s, health: Math.min(s.maxHealth, s.health + hs) } : s);
        }
      }

      // Missile splash
      if (b.isMissile) {
        newE = newE.map(e2 => {
          if (e2 === e || e2.dead) return e2;
          if (!withinRadius(b.x, b.y, e2.x, e2.y, MISSILE_SPLASH_R)) return e2;
          const sd  = fd * MISSILE_SPLASH_FRAC;
          newNums.push(mkNum(e2.x + rand(-8, 8), e2.y - 12, sd * 5.5, false, true));
          const nhp = e2.health - sd;
          if (nhp <= 0) {
            newDebris.push(...makeDebris(getWorldPoly(e2, 'body'),  e2.x, e2.y, e2.color));
            newDebris.push(...makeDebris(getWorldPoly(e2, 'lWing'), e2.x, e2.y, e2.color));
            newDebris.push(...makeDebris(getWorldPoly(e2, 'rWing'), e2.x, e2.y, e2.color));
            newXP = Math.min(newXP + Math.floor(e2.xpValue * (1 + stats.xpBonus * 0.1)), xpNeeded);
            return { ...e2, dead: true };
          }
          return { ...e2, health: nhp };
        });
      }

      newNums.push(mkNum(e.x + rand(-10, 10), e.y - 18, rd, crits > 0, false));
      const nhp = e.health - fd;
      if (nhp <= 0) {
        newDebris.push(...makeDebris(getWorldPoly(e, 'body'),  e.x, e.y, e.color));
        newDebris.push(...makeDebris(getWorldPoly(e, 'lWing'), e.x, e.y, e.color));
        newDebris.push(...makeDebris(getWorldPoly(e, 'rWing'), e.x, e.y, e.color));
        newXP = Math.min(newXP + Math.floor(e.xpValue * (1 + stats.xpBonus * 0.1)), xpNeeded);
        return { ...e, dead: true };
      }
      return { ...e, health: nhp };
    });

    if (!hit) survived.push(b);
    else if (b.pierce > 0 && cm >= 0.02) survived.push({ ...b, pierceMult: cm });
  }
  pb = survived;

  // ── Enemy bullets vs swarm ships ──────────────────────────────────────────
  newEB = newEB
    .map(b => ({ ...b, x: b.x + b.vx, y: b.y + b.vy }))
    .filter(b => b.y < H + 20 && b.y > -20 && b.x > -20 && b.x < W + 20);

  newEB = newEB.filter(b => {
    for (const ship of swarm) {
      if (!withinRadius(b.x, b.y, ship.x, ship.y, HIT_RADIUS)) continue;
      const bodyWorld = getSwarmWorldPoly(ship, 'body');
      if (!pointInPoly(b.x, b.y, bodyWorld)) continue;
      swarm = swarm.map(s => s.id === ship.id ? { ...s, health: Math.max(0, s.health - b.damage) } : s);
      return false; // bullet consumed
    }
    return true;
  });

  // ── Remove dead swarm ships ───────────────────────────────────────────────
  const deadShips = swarm.filter(s => s.health <= 0);
  deadShips.forEach(s => {
    newDebris.push(...makeDebris(getSwarmWorldPoly(s, 'body'),  s.x, s.y, s.color));
    newDebris.push(...makeDebris(getSwarmWorldPoly(s, 'lWing'), s.x, s.y, s.color));
    newDebris.push(...makeDebris(getSwarmWorldPoly(s, 'rWing'), s.x, s.y, s.color));
  });
  swarm = swarm.filter(s => s.health > 0);

  newDebris = updateDebris(newDebris);

  // Update damage numbers
  newNums = newNums
    .map(n => ({ ...n, y: n.y + n.vy, vy: n.vy * 0.95, life: n.life - n.decay }))
    .filter(n => n.life > 0);

  newE = newE.filter(e => !e.dead);

  // ── Wave management ───────────────────────────────────────────────────────
  let mode: GameState['mode'] = gs.mode;
  let newLevel = level;
  let nwa   = waveActive;
  let nwt   = waveTimer;
  let uc    = upgradeChoices;
  let nw    = wave;

  if (waveActive && newE.length === 0) { nwa = false; nwt = 90; }
  if (!nwa && nwt > 0) {
    nwt--;
    if (nwt === 0) {
      if (newXP >= xpNeeded) {
        mode = 'upgrade';
        uc   = pickUpgrades(3);
        newLevel = level + 1;
        newXP = 0;
        xpNeeded = xpForLevel(newLevel);
      } else {
        newE = buildWave(nw); nw++; nwa = true;
      }
    }
  }
  if (frame === 1) { newE = buildWave(0); nw = 1; nwa = true; }

  // ── Game over when swarm is empty ─────────────────────────────────────────
  if (swarm.length === 0) mode = 'gameover';

  return {
    ...gs,
    frame, mode, wave: nw, level: newLevel,
    xp: newXP, xpNeeded,
    cx, cy, cvx, cvy,
    swarm, stats, regenAccum,
    enemies: newE,
    playerBullets: pb,
    enemyBullets: newEB,
    debris: newDebris,
    damageNumbers: newNums,
    waveActive: nwa, waveTimer: nwt,
    upgradeChoices: uc,
    touchTarget, keys,
  };
}
