export function xpForLevel(l: number): number {
  if (l <= 3) return 60 + l * 20;
  return Math.floor(80 + l * 20 + (l - 3) * (l - 3) * 18);
}
