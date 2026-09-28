import { EMPTY, formatNumber } from '@/shared/lib/format';

/**
 * Headroom of comparative bars (prototype, 02-prototype-html §6): the largest value fills 1 / 1.15 of the track so its
 * value label never touches the edge.
 */
export const BAR_HEADROOM = 1.15;

export type BarValue = number | null | undefined;

const isMissing = (value: BarValue): value is null | undefined =>
  value === null || value === undefined || Number.isNaN(value);

/**
 * Width (0–100, % of the track) of a comparative bar: `|value| / (max × 1.15)`. Negative values draw their absolute
 * length (OQ-10 / CF-72: no diverging axis; the label keeps the sign). `null` / `undefined` / NaN → `null`: the caller
 * renders an empty track and "—", never a zero-width bar that reads as 0.
 */
export function barWidthPct(value: BarValue, max: number): number | null {
  if (isMissing(value)) return null;
  if (!(max > 0)) return 0;
  return Math.min(100, (Math.abs(value) / (max * BAR_HEADROOM)) * 100);
}

/** Largest absolute value of a set (the `max` of barWidthPct); missing values are ignored, 0 when none. */
export function maxAbs(values: readonly BarValue[]): number {
  return values.reduce<number>((acc, v) => (isMissing(v) ? acc : Math.max(acc, Math.abs(v))), 0);
}

/**
 * Fill (0–100) of a ratio bar (ProgressBar, WinMiniBar): `value / max`, clamped. No headroom: a complete coverage
 * fills the track, as in the prototype (C3, C2 win ratio). Missing → `null`.
 */
export function ratioPct(value: BarValue, max: number): number | null {
  if (isMissing(value)) return null;
  if (!(max > 0)) return 0;
  return Math.min(100, Math.max(0, (value / max) * 100));
}

export type CoverageTone = 'success' | 'warning' | 'danger';

/** Coverage thresholds of the prototype (C3): ≥ 90 complete, 70–89 partial, < 70 missing. */
export function coverageTone(pct: number): CoverageTone {
  if (pct >= 90) return 'success';
  if (pct >= 70) return 'warning';
  return 'danger';
}

/** Signed es-CO value label (OQ-10: the sign stays even though the bar length is absolute); missing → "—". */
export function defaultFormat(value: BarValue): string {
  return isMissing(value) ? EMPTY : formatNumber(value, { decimals: 1 });
}
