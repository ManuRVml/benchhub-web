import { describe, expect, it } from 'vitest';

import { formatFiscalYear, formatPeriod } from './period';

describe('formatPeriod', () => {
  it('writes quarters as "T{q} {year}" (CF-76)', () => {
    expect(formatPeriod({ year: 2025, quarter: 4 })).toBe('T4 2025');
    expect(formatPeriod({ year: 2026, quarter: 1 })).toBe('T1 2026');
  });

  it('renders an em dash for missing values', () => {
    expect(formatPeriod(null)).toBe('—');
    expect(formatPeriod(undefined)).toBe('—');
    expect(formatPeriod({ year: Number.NaN, quarter: 2 })).toBe('—');
  });
});

describe('formatFiscalYear', () => {
  it('writes "FY{year}"', () => {
    expect(formatFiscalYear(2025)).toBe('FY2025');
  });

  it('renders an em dash for missing values', () => {
    expect(formatFiscalYear(null)).toBe('—');
    expect(formatFiscalYear(Number.NaN)).toBe('—');
  });
});
