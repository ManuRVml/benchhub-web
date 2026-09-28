import { formatNumber, formatPercent, formatUnit } from '@/shared/lib/format';

import type { SensitivityUnit } from '@/shared/api';

/** es-CO text of a V-37 / C-21 value (level or delta, both raw server numbers — the front only formats, SCR-12 §1). */
export function formatSensitivityValue(value: number, unit: SensitivityUnit, decimals = 1): string {
  return unit === 'percent'
    ? formatPercent(value, { decimals })
    : formatUnit(value, 'MMCOP', { decimals });
}

/**
 * "Brecha vs. meta" text (SCR-12 §1: "0,5 pts", no sign — OQ-38 signs deltas, not a level/target distance).
 */
export const formatGapPts = (gap: number): string => `${formatNumber(gap, { decimals: 1 })} pts`;

/** Tone of the gap value (SCR-12 §1, HTML L5494): closed or exceeded (≤0) green, under 2 pts amber, else red. */
export type GapTone = 'success' | 'warning' | 'danger';
export function gapTone(gap: number): GapTone {
  if (gap <= 0) return 'success';
  if (gap < 2) return 'warning';
  return 'danger';
}
