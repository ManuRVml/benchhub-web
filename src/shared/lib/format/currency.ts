import { EMPTY, fractionDigits, isMissing, numberFormatter } from './number';

import type { NumericInput } from './number';

export type CurrencyCode = 'COP' | 'USD';

export interface CurrencyFormatOptions {
  /** Default 0. */
  decimals?: number;
}

/**
 * es-CO currency with the Intl symbol and its no-break space: `formatCurrency(4102, 'COP')` → "$<NBSP>4.102",
 * `formatCurrency(4102, 'USD')` → "US$<NBSP>4.102".
 */
export function formatCurrency(
  value: NumericInput,
  currency: CurrencyCode,
  options: CurrencyFormatOptions = {},
): string {
  if (isMissing(value)) return EMPTY;
  return numberFormatter({
    style: 'currency',
    currency,
    ...fractionDigits(options.decimals ?? 0),
  }).format(value);
}
