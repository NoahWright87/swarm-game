export const CONN = {
  wing: { depth: 7, halfWidth: 5 },
} as const;

// In game space, ship geometry is centered at (0,0) pointing UP.
// The editor used BODY_CX=150 as a canvas offset — we use 0 here.
export const BODY_CX = 0;
export const BODY_TOP_OFFSET = 0; // top of body relative to center; buildBody uses -length/2
