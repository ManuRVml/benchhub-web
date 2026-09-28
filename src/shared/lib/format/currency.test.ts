import { describe, expect, it } from 'vitest';

import { formatCurrency } from './currency';

describe('formatCurrency', () => {
  it('uses the Intl symbol and a no-break space', () => {
    expect(formatCurrency(4102, 'COP')).toBe('$\u00a04.102');
    expect(formatCurrency(4102, 'USD')).toBe('US$\u00a04.102');
  });

  it('handles decimals, negatives, zero and large values', () => {
    expect(formatCurrency(46.1, 'USD', { decimals: 1 })).toBe('US$\u00a046,1');
    expect(formatCurrency(-1935, 'COP')).toBe('-$\u00a01.935');
    expect(formatCurrency(0, 'COP')).toBe('$\u00a00');
    expect(formatCurrency(1234567890, 'COP')).toBe('$\u00a01.234.567.890');
  });

  it('renders an em dash for missing values', () => {
    expect(formatCurrency(null, 'COP')).toBe('—');
    expect(formatCurrency(undefined, 'USD')).toBe('—');
    expect(formatCurrency(Number.NaN, 'COP')).toBe('—');
  });
});
