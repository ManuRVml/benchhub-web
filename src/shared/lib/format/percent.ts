import { EMPTY, fractionDigits, isMissing, numberFormatter } from './number';

import type { NumericInput } from './number';

export interface PercentFormatOptions {
  /** Default 1. */
  decimals?: number;
}

/**
 * A value that is already a percentage (7.4 means 7,4 %, not a ratio), unsigned (OQ-38: levels carry no sign).
 * `formatPercent(7.4)` → "7,4%"; `formatPercent(96.15, { decimals: 0 })` → "96%".
 */
export function formatPercent(value: NumericInput, options: PercentFormatOptions = {}): string {
  if (isMissing(value)) return EMPTY;
  return `${numberFormatter(fractionDigits(options.decimals ?? 1)).format(value)}%`;
}
