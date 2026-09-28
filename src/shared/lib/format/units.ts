import { EMPTY, fractionDigits, isMissing, numberFormatter } from './number';

import type { NumericInput } from './number';

/** Display units of the prototype (brief §5.7, CF-67, CF-70). */
export type DisplayUnit = 'USD/B' | 'KBOE' | 'BCOP' | 'MMCOP' | 'mMCOP' | 'MUSD' | '$/kWh';

export interface UnitFormatOptions {
  /** Default 1. */
  decimals?: number;
}

/** Value, a space, then the unit: `formatUnit(12.2, 'USD/B')` → "12,2 USD/B". */
export function formatUnit(
  value: NumericInput,
  unit: DisplayUnit,
  options: UnitFormatOptions = {},
): string {
  if (isMissing(value)) return EMPTY;
  return `${numberFormatter(fractionDigits(options.decimals ?? 1)).format(value)} ${unit}`;
}

/** Multiple with the "x" attached: `formatMultiple(1.3)` → "1,3x". */
export function formatMultiple(value: NumericInput, options: UnitFormatOptions = {}): string {
  if (isMissing(value)) return EMPTY;
  return `${numberFormatter(fractionDigits(options.decimals ?? 1)).format(value)}x`;
}
