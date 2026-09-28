import { formatDelta, formatPercent } from '@/shared/lib/format';

import type { WeightSimulatorKvi } from '@/shared/api';
import type { BarTone } from '@/shared/ui/charts/primitives';

// SCR-12 §3-4 "Variables de simulación" / "ROACE · Before / After": productivity / operating-costs sliders now
// evaluate through C-24's real `mode: 'scenario'` (task/P7-C24-SCENARIO); simulated ROACE, the peer average and
// `gapClosedPct` all come from that response (WeightSimulator.tsx), not a client formula.

/** The Yarbis tip switches copy at 50% of the gap closed (SCR-12 §5). */
export const GAP_CLOSED_TIP_THRESHOLD = 50;

export const formatRoacePct = (value: number): string => formatPercent(value, { decimals: 1 });

/** "{{sensDelta}} pts" — signed, unlike §1's unsigned gap (SCR-12 §6 score-strip "Variación"). */
export const formatVariationPts = (value: number): string =>
  formatDelta(value, { unit: 'pts', decimals: 1 });

export type CategoryStatus = 'on_target' | 'above' | 'below';

/** ±2pt rule (SCR-12 §6, HTML L4119): within 2 points of target reads "En línea". */
export function categoryStatus(totalPct: number, targetPct: number): CategoryStatus {
  const diff = totalPct - targetPct;
  if (diff > 2) return 'above';
  if (diff < -2) return 'below';
  return 'on_target';
}

// A literal subtype of both `BadgeTone` (the header pill) and `ProgressBar`'s narrower tone (the category bar), so
// the same map drives both without a cast.
export const CATEGORY_STATUS_TONE: Record<CategoryStatus, 'success' | 'warning' | 'danger'> = {
  on_target: 'success',
  above: 'danger',
  below: 'warning',
};

/** Weight-row marker tone follows the KVI's own Monitor compliance band (V-39 `band`), not the weight value itself. */
export const KVI_BAND_TONE: Record<WeightSimulatorKvi['band'], BarTone> = {
  ok: 'success',
  watch: 'warning',
  critical: 'danger',
};

export const formatWeightPct = (value: number): string => formatPercent(value, { decimals: 0 });
