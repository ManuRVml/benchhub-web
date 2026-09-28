import { EMPTY } from './number';

export type Quarter = 1 | 2 | 3 | 4;

export interface QuarterPeriod {
  year: number;
  quarter: Quarter;
}

/** Quarter period in the display form of CF-76: `formatPeriod({ year: 2025, quarter: 4 })` → "T4 2025". */
export function formatPeriod(period: QuarterPeriod | null | undefined): string {
  if (period == null || Number.isNaN(period.year)) return EMPTY;
  return `T${String(period.quarter)} ${String(period.year)}`;
}

/** Fiscal year: `formatFiscalYear(2025)` → "FY2025". */
export function formatFiscalYear(year: number | null | undefined): string {
  if (year == null || Number.isNaN(year)) return EMPTY;
  return `FY${String(year)}`;
}
