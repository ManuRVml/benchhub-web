import { describe, expect, it } from 'vitest';

import { formatPercent } from './percent';

describe('formatPercent', () => {
  it('formats a percentage value (not a ratio) with 1 decimal by default', () => {
    expect(formatPercent(7.4)).toBe('7,4%');
    expect(formatPercent(78.56)).toBe('78,6%');
  });

  it('honours decimals', () => {
    expect(formatPercent(96.15, { decimals: 0 })).toBe('96%');
    expect(formatPercent(96.15, { decimals: 2 })).toBe('96,15%');
  });

  it('handles negatives, zero and large values without a plus sign', () => {
    expect(formatPercent(-13.8)).toBe('-13,8%');
    expect(formatPercent(0)).toBe('0,0%');
    expect(formatPercent(1250)).toBe('1.250,0%');
  });

  it('renders an em dash for missing values', () => {
    expect(formatPercent(null)).toBe('—');
    expect(formatPercent(undefined)).toBe('—');
    expect(formatPercent(Number.NaN)).toBe('—');
  });
});
