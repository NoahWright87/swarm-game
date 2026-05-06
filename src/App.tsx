import { useEffect, useRef, useCallback } from 'react';
import { initState, update } from './game';
import { buildWave, mkSwarmFighter } from './game';
import { cardHitIndex } from './render/drawUpgrade';
import { drawGame } from './render';
import type { GameState } from './game';

const W = 390, H = 700;

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gsRef     = useRef<GameState>(initState());
  const rafRef    = useRef<number>(0);

  // Keyboard
  useEffect(() => {
    const kd = (e: KeyboardEvent) => { gsRef.current.keys[e.key] = true;  e.preventDefault(); };
    const ku = (e: KeyboardEvent) => { gsRef.current.keys[e.key] = false; };
    window.addEventListener('keydown', kd, { passive: false });
    window.addEventListener('keyup', ku);
    return () => { window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); };
  }, []);

  // Canvas-relative pointer position
  const canvasPos = useCallback((e: PointerEvent | React.PointerEvent): { x: number; y: number } | null => {
    const c = canvasRef.current; if (!c) return null;
    const r  = c.getBoundingClientRect();
    const sx = c.width  / r.width;
    const sy = c.height / r.height;
    const src = 'touches' in e ? (e as unknown as TouchEvent).touches[0] : e;
    return { x: (src.clientX - r.left) * sx, y: (src.clientY - r.top) * sy };
  }, []);

  const onDown = useCallback((e: React.PointerEvent) => {
    const p  = canvasPos(e); if (!p) return;
    const gs = gsRef.current;

    if (gs.mode === 'gameover') {
      gsRef.current = initState();
      return;
    }

    if (gs.mode === 'upgrade') {
      const idx = cardHitIndex(p.x, p.y, gs);
      if (idx >= 0) {
        const u       = gs.upgradeChoices[idx];
        const newStats = u.apply(gs.stats);
        const we      = buildWave(gs.wave);
        // Respawn a ship if swarm fell to 1 on level-up (grace mechanic)
        let newSwarm = gs.swarm;
        if (newSwarm.length < 3 && Math.random() < 0.4) {
          const a = (Math.PI * 2 / (newSwarm.length + 1)) * newSwarm.length - Math.PI / 2;
          newSwarm = [...newSwarm, mkSwarmFighter(a, 55)];
        }
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
    if (gsRef.current.mode !== 'playing') return;
    const p = canvasPos(e); if (!p) return;
    gsRef.current = { ...gsRef.current, touchTarget: p };
  }, [canvasPos]);

  const onUp = useCallback(() => {
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
      gsRef.current = update(gsRef.current);
      drawGame(ctx, gsRef.current);
    }
    loop();
    return () => { running = false; cancelAnimationFrame(rafRef.current); };
  }, []);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100vh', background: '#04080f', userSelect: 'none',
    }}>
      <canvas
        ref={canvasRef}
        width={W} height={H}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        style={{ display: 'block', width: `min(${W}px, 100vw)`, height: 'auto', touchAction: 'none', cursor: 'crosshair' }}
      />
      <div style={{ marginTop: 6, fontSize: 10, color: '#223', fontFamily: 'monospace', textAlign: 'center' }}>
        drag to move · arrow keys · auto-fire
      </div>
    </div>
  );
}
