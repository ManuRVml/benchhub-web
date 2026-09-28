/**
 * Client-side preview of a KVI's compliance while its Meta / Meta Reto are being edited (SCR-11 KVI table,
 * `docs/design/screen-inventory/SCR-11-monitor-valor.md` §"Filters & controls", `calcPct` HTML L4184–4188). The BFF
 * remains the source of truth once the page commits the edit through `C-16`; this only keeps the row's chip in sync
 * with the keystrokes until that round-trip lands (P5-50).
 */
export type KviBand = 'ok' | 'watch' | 'risk' | 'tbd';

/** `Cmp:StatusChip` reuses `Badge`'s `coverage` tones (`complete` ≥ 90 %, `partial` 70–89 %, `missing` < 70 %), which
 * are the same thresholds as the KVI result bands; `tbd` has no coverage equivalent and uses `Badge kind="tbd"`. */
export const KVI_BAND_TO_COVERAGE = {
  ok: 'complete',
  watch: 'partial',
  risk: 'missing',
} as const satisfies Partial<Record<KviBand, 'complete' | 'partial' | 'missing'>>;

/**
 * Result = round(Real/Meta·100), or Meta/Real when lower is better, floored at 0, never capped. A zero denominator
 * (an empty Meta on a "greater is better" KVI, or a zero Real on a "lower is better" one) floors to 0 rather than
 * producing `Infinity`.
 */
export function calcPct(real: number, meta: number, lowerIsBetter: boolean): number {
  const denominator = lowerIsBetter ? real : meta;
  if (denominator === 0) return 0;
  const raw = lowerIsBetter ? (meta / real) * 100 : (real / meta) * 100;
  return Math.max(0, Math.round(raw));
}

/** `null` (no data yet) is TBD; otherwise the same ≥90 / 70–89 / <70 thresholds as `KVI_BAND_TO_COVERAGE`. */
export function bandOf(pct: number | null): KviBand {
  if (pct === null) return 'tbd';
  if (pct >= 90) return 'ok';
  if (pct >= 70) return 'watch';
  return 'risk';
}
