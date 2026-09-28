import { describe, expect, it } from 'vitest';

import { formatMultiple, formatUnit } from './units';

describe('formatUnit', () => {
  it('writes value, space, unit', () => {
    expect(formatUnit(12.2, 'USD/B')).toBe('12,2 USD/B');
    expect(formatUnit(3020, 'KBOE', { decimals: 0 })).toBe('3.020 KBOE');
    expect(formatUnit(4.56, 'mMCOP', { decimals: 2 })).toBe('4,56 mMCOP');
  });

  it('supports every display unit the same way', () => {
    expect(formatUnit(18.5, 'BCOP')).toBe('18,5 BCOP');
    expect(formatUnit(1250, 'MMCOP', { decimals: 0 })).toBe('1.250 MMCOP');
    expect(formatUnit(400, 'MUSD', { decimals: 0 })).toBe('400 MUSD');
    expect(formatUnit(0.12, '$/kWh', { decimals: 2 })).toBe('0,12 $/kWh');
  });

  it('handles negatives and zero', () => {
    expect(formatUnit(-0.4, 'USD/B')).toBe('-0,4 USD/B');
    expect(formatUnit(0, 'KBOE', { decimals: 0 })).toBe('0 KBOE');
  });

  it('renders an em dash for missing values', () => {
    expect(formatUnit(null, 'KBOE')).toBe('—');
    expect(formatUnit(Number.NaN, 'MUSD')).toBe('—');
  });
});

describe('formatMultiple', () => {
  it('attaches the x', () => {
    expect(formatMultiple(1.3)).toBe('1,3x');
    expect(formatMultiple(2.4)).toBe('2,4x');
    expect(formatMultiple(0)).toBe('0,0x');
    expect(formatMultiple(-1.25, { decimals: 2 })).toBe('-1,25x');
  });

  it('renders an em dash for missing values', () => {
    expect(formatMultiple(undefined)).toBe('—');
    expect(formatMultiple(Number.NaN)).toBe('—');
  });
});
