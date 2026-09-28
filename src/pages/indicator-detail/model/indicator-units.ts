import { formatMultiple, formatNumber, formatPercent, formatUnit } from '@/shared/lib/format';

import type { IndicatorUnit } from '@/shared/api';
import type { KpiUnit } from '@/shared/ui/composites/kpi-stat-card';

/**
 * V-24 `unit` → the display format of levels (KPIs, bars, the average line). CF-67: `kboe` is a level in KBOE
 * ("3.020,0 KBOE"), never a percentage; relative variations (GE vs. average, deltas) stay in %.
 */
const DISPLAY_UNIT = {
  percent: 'percent',
  kboe: 'KBOE',
  ratio_x: 'multiple',
  usd_b: 'USD/B',
  points: 'number',
} as const satisfies Readonly<Record<IndicatorUnit, KpiUnit>>;

export const displayUnitOf = (unit: IndicatorUnit) => DISPLAY_UNIT[unit];

/**
 * es-CO text of a level of the indicator (e.g. "7,4%", "745,0 KBOE"), same rules as the chart wrappers' formatter. It
 * uses shared/lib/format directly so the page chunk does not pull ECharts (the chart is lazy).
 */
export function formatIndicatorValue(value: number | null, unit: IndicatorUnit): string {
  const display = displayUnitOf(unit);
  switch (display) {
    case 'percent':
      return formatPercent(value);
    case 'multiple':
      return formatMultiple(value);
    case 'number':
      return formatNumber(value);
    default:
      return formatUnit(value, display);
  }
}
