import type { BodyParams, WingParams } from './types';

export interface ShipPreset {
  body: BodyParams;
  wing: WingParams;
}

// MIN_ROOT = CONN.wing.halfWidth*2 + 10 = 5*2+10 = 20
export const SHIP_PRESETS: Record<string, ShipPreset> = {
  swarmFighter: {
    body: { length: 40, width: 11, apexPos: 0.30, noseTaper: 88, tailTaper: 72, connPos: 0.40 },
    wing: { rootWidth: 22, tipWidth: 5, span: 25, sweep: 8,  tipStyle: 'pointed', tipParams: { reach: 10, bias: 0 } },
  },
  fighter: {
    body: { length: 34, width: 9,  apexPos: 0.32, noseTaper: 85, tailTaper: 70, connPos: 0.42 },
    wing: { rootWidth: 22, tipWidth: 4, span: 20, sweep: 7,  tipStyle: 'pointed', tipParams: { reach: 8,  bias: 0 } },
  },
  bomber: {
    body: { length: 46, width: 18, apexPos: 0.50, noseTaper: 55, tailTaper: 60, connPos: 0.50 },
    wing: { rootWidth: 30, tipWidth: 14, span: 30, sweep: 18, tipStyle: 'flat',    tipParams: {} },
  },
  interceptor: {
    body: { length: 40, width: 8,  apexPos: 0.28, noseTaper: 92, tailTaper: 80, connPos: 0.38 },
    wing: { rootWidth: 22, tipWidth: 3, span: 22, sweep: -5, tipStyle: 'angled',  tipParams: { topOut: 10, botOut: 3 } },
  },
  raider: {
    body: { length: 32, width: 13, apexPos: 0.45, noseTaper: 70, tailTaper: 65, connPos: 0.48 },
    wing: { rootWidth: 24, tipWidth: 11, span: 26, sweep: 12, tipStyle: 'talon',   tipParams: { reach: 12, spread: 7 } },
  },
  drone: {
    body: { length: 20, width: 6,  apexPos: 0.40, noseTaper: 80, tailTaper: 75, connPos: 0.44 },
    wing: { rootWidth: 20, tipWidth: 3, span: 13, sweep: 5,  tipStyle: 'flat',    tipParams: {} },
  },
};
