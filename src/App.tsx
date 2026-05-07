import { useEffect, useRef, useCallback } from 'react';
import { initState, update, buildWave, mkSwarmFighter, pickUpgrades } from './game';
import { cardHitIndex, rerollHitTest, autoLevelUpHitTest } from './render/drawUpgrade';
import { drawGame } from './render';
import type { GameState } from './game';

const W = 390, H = 700;

export default function App() {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const gsRef        = useRef<GameState>(initState());
  const rafRef       = useRef<number>(0);
  const pointerDown  = useRef(false);  // track whether pointer is currently pressed

  // Keyboard
  useEffect(() => {
    const kd = (e: KeyboardEvent) => { gsRef.current.keys[e.key] = true;  e.preventDefault(); };
    const ku = (e: KeyboardEvent) => { gsRef.current.keys[e.key] = false; };
    window.addEventListener('keydown', kd, { passive: false });
    window.addEventListener('keyup',   ku);
    return () => { window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); };
  }, []);

  const canvasPos = useCallback((e: React.PointerEvent): { x: number; y: number } | null => {
    const c = canvasRef.current; if (!c) return null;
    const r  = c.getBoundingClientRect();
    const sx = c.width  / r.width;
    const sy = c.height / r.height;
    return { x: (e.clientX - r.left) * sx, y: (e.clientY - r.top) * sy };
  }, []);

  const onDown = useCallback((e: React.PointerEvent) => {
    pointerDown.current = true;
    const p  = canvasPos(e); if (!p) return;
    const gs = gsRef.current;

    if (gs.mode === 'gameover') {
      gsRef.current = initState();
      return;
    }

    if (gs.mode === 'upgrade') {
      if (autoLevelUpHitTest(p.x, p.y)) {
        gsRef.current = { ...gs, autoLevelUp: !gs.autoLevelUp };
        return;
      }
      if (rerollHitTest(p.x, p.y)) {
        gsRef.current = { ...gs, upgradeChoices: pickUpgrades(3) };
        return;
      }
      const idx = cardHitIndex(p.x, p.y, gs);
      if (idx >= 0) {
        const u   = gs.upgradeChoices[idx];
        const { stats: newStats, swarm: newSwarm } = u.apply(gs.stats, gs.swarm);
        const we  = buildWave(gs.wave);
        gsRef.current = {
          ...gs, stats: newStats, swarm: newSwarm,
          mode: 'playing', upgradeChoices: [],
          enemies: we, wave: gs.wave + 1, waveActive: true,
          playerBullets: [], enemyBullets: [], damageNumbers: [],
        };
      }
      return;
    }

    gsRef.current = { ...gsRef.current, touchTarget: p };
  }, [canvasPos]);

  const onMove = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    // Only follow pointer while button is held — avoids cursor chasing on desktop
    if (!pointerDown.current) return;
    if (gsRef.current.mode !== 'playing') return;
    const p = canvasPos(e); if (!p) return;
    gsRef.current = { ...gsRef.current, touchTarget: p };
  }, [canvasPos]);

  const onUp = useCallback(() => {
    pointerDown.current = false;
    gsRef.current = { ...gsRef.current, touchTarget: null };
  }, []);

  // Game loop
  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext('2d')!;
    let running = true;
    function loop() {
      if (!running) return;
      rafRef.current = requestAnimationFrame(loop);
      gsRef.current  = update(gsRef.current);
      drawGame(ctx, gsRef.current);
    }
    loop();
    return () => { running = false; cancelAnimationFrame(rafRef.current); };
  }, []);

  // Expose mkSwarmFighter on window for dev testing (add ships via console)
  useEffect(() => {
    (window as unknown as Record<string, unknown>)['addShip'] = () => {
      const gs = gsRef.current;
      const newSlot = gs.swarm.length;
      gsRef.current = { ...gs, swarm: [...gs.swarm, mkSwarmFighter(newSlot, 55)] };
    };
  }, []);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#04080f', userSelect: 'none', overflow: 'hidden',
    }}>
      <canvas
        ref={canvasRef}
        width={W} height={H}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        style={{
          display: 'block',
          // Fill available height, maintain 390:700 aspect ratio; never exceed viewport width
          height: '100vh',
          width: 'auto',
          maxWidth: '100vw',
          touchAction: 'none',
          cursor: 'crosshair',
        }}
      />
    </div>
  );
}
