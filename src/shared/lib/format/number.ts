/**
 * es-CO number formatting (brief §5.7, ADR 0008). Display only: callers pass raw values from the BFF and never compute
 * business figures here. Separators come from Intl ('.' thousands, ',' decimals); missing input renders EMPTY.
 */
export const LOCALE = 'es-CO';

/** Shown for null, undefined and NaN in every formatter. */
export const EMPTY = '—';

export type NumericInput = number | null | undefined;

export interface NumberFormatOptions {
  /** Fixed number of decimals; when omitted, up to 2 decimals and no trailing zeros. */
  decimals?: number;
}

const formatters = new Map<string, Intl.NumberFormat>();

/** Cached Intl.NumberFormat for es-CO; grouping is forced so 4-digit values read "4.102" on every ICU version. */
export function numberFormatter(options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = JSON.stringify(options);
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(LOCALE, { useGrouping: 'always', ...options });
    formatters.set(key, formatter);
  }
  return formatter;
}

export function isMissing(value: NumericInput): value is null | undefined {
  return value == null || Number.isNaN(value);
}

export function fractionDigits(decimals: number | undefined): Intl.NumberFormatOptions {
  return decimals === undefined
    ? { minimumFractionDigits: 0, maximumFractionDigits: 2 }
    : { minimumFractionDigits: decimals, maximumFractionDigits: decimals };
}

/** `formatNumber(4102)` → "4.102"; `formatNumber(7.4, { decimals: 1 })` → "7,4". */
export function formatNumber(value: NumericInput, options: NumberFormatOptions = {}): string {
  if (isMissing(value)) return EMPTY;
  return numberFormatter(fractionDigits(options.decimals)).format(value);
}

export interface DeltaFormatOptions {
  /** '%' is attached ("+2,5%"); any other unit is separated by a space ("+0,5 pts"). */
  unit: string;
  /** Default 1. */
  decimals?: number;
}

/**
 * Signed variation (OQ-38: the sign is shown only for deltas, never for levels). Zero has no sign.
 * `formatDelta(2.5, { unit: '%' })` → "+2,5%"; `formatDelta(0.5, { unit: 'pts' })` → "+0,5 pts".
 */
export function formatDelta(value: NumericInput, options: DeltaFormatOptions): string {
  if (isMissing(value)) return EMPTY;
  const number = numberFormatter({
    ...fractionDigits(options.decimals ?? 1),
    signDisplay: 'exceptZero',
  }).format(value);
  return options.unit === '%' ? `${number}%` : `${number} ${options.unit}`;
}
