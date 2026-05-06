import type { BodyParams, WingParams } from './types';

export interface ShipPreset {
  body: BodyParams;
  wing: WingParams;
}

export const SHIP_PRESETS: Record<string, ShipPreset> = {
  swarmFighter: {
    body: { length: 60,  width: 18, apexPos: 0.30, noseTaper: 88, tailTaper: 72, connPos: 0.40 },
    wing: { rootWidth: 30, tipWidth: 8,  span: 44, sweep: 12,  tipStyle: 'pointed', tipParams: { reach: 14, bias: 0 } },
  },
  fighter: {
    body: { length: 55,  width: 16, apexPos: 0.32, noseTaper: 85, tailTaper: 70, connPos: 0.42 },
    wing: { rootWidth: 28, tipWidth: 6,  span: 38, sweep: 10,  tipStyle: 'pointed', tipParams: { reach: 12, bias: 0 } },
  },
  bomber: {
    body: { length: 70,  width: 30, apexPos: 0.50, noseTaper: 55, tailTaper: 60, connPos: 0.50 },
    wing: { rootWidth: 48, tipWidth: 22, span: 52, sweep: 28,  tipStyle: 'flat',    tipParams: {} },
  },
  interceptor: {
    body: { length: 65,  width: 14, apexPos: 0.28, noseTaper: 92, tailTaper: 80, connPos: 0.38 },
    wing: { rootWidth: 24, tipWidth: 4,  span: 36, sweep: -8,  tipStyle: 'angled',  tipParams: { topOut: 16, botOut: 4 } },
  },
  raider: {
    body: { length: 52,  width: 22, apexPos: 0.45, noseTaper: 70, tailTaper: 65, connPos: 0.48 },
    wing: { rootWidth: 40, tipWidth: 18, span: 48, sweep: 18,  tipStyle: 'talon',   tipParams: { reach: 18, spread: 10 } },
  },
  drone: {
    body: { length: 32,  width: 10, apexPos: 0.40, noseTaper: 80, tailTaper: 75, connPos: 0.44 },
    wing: { rootWidth: 18, tipWidth: 4,  span: 22, sweep: 8,   tipStyle: 'flat',    tipParams: {} },
  },
};
