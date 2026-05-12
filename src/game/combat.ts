export function resolveCrit(
  base: number,
  chance: number,
  mult: number,
): { dmg: number; crits: number } {
  if (chance <= 0) return { dmg: base, crits: 0 };
  let rem = chance, crits = 0;
  while (rem > 0) {
    if (Math.random() < Math.min(rem, 1)) crits++;
    rem -= 1;
  }
  return { dmg: base * Math.pow(mult, crits), crits };
}

// Overflow life steal: stacking past 1.0 guarantees heals + fractional chance for extra
export function resolveLifeSteal(ls: number): number {
  if (ls <= 0) return 0;
  return Math.floor(ls) + (Math.random() < (ls % 1) ? 1 : 0);
}
