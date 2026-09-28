import { describe, expect, it } from 'vitest';

import { EMPTY, formatDelta, formatNumber } from './number';

describe('formatNumber', () => {
  it('formats with es-CO separators', () => {
    expect(formatNumber(7.4, { decimals: 1 })).toBe('7,4');
    expect(formatNumber(4102)).toBe('4.102');
    expect(formatNumber(1234567.5, { decimals: 1 })).toBe('1.234.567,5');
  });

  it('handles negatives and zero', () => {
    expect(formatNumber(-13.8, { decimals: 1 })).toBe('-13,8');
    expect(formatNumber(0, { decimals: 1 })).toBe('0,0');
    expect(formatNumber(0)).toBe('0');
  });

  it('keeps up to 2 decimals without trailing zeros by default', () => {
    expect(formatNumber(12.345)).toBe('12,35');
    expect(formatNumber(12.5)).toBe('12,5');
  });

  it('handles extremes', () => {
    expect(formatNumber(1e12)).toBe('1.000.000.000.000');
    expect(formatNumber(-0.004, { decimals: 2 })).toBe('-0,00');
  });

  it('renders an em dash for missing values', () => {
    expect(formatNumber(null)).toBe(EMPTY);
    expect(formatNumber(undefined)).toBe('—');
    expect(formatNumber(Number.NaN)).toBe('—');
  });
});

describe('formatDelta', () => {
  it('signs positive and negative variations, never zero', () => {
    expect(formatDelta(2.5, { unit: '%' })).toBe('+2,5%');
    expect(formatDelta(-2.5, { unit: '%' })).toBe('-2,5%');
    expect(formatDelta(0, { unit: '%' })).toBe('0,0%');
  });

  it('separates non-percent units with a space', () => {
    expect(formatDelta(0.5, { unit: 'pts' })).toBe('+0,5 pts');
    expect(formatDelta(-13.8, { unit: 'pts', decimals: 1 })).toBe('-13,8 pts');
  });

  it('renders an em dash for missing values', () => {
    expect(formatDelta(null, { unit: '%' })).toBe('—');
    expect(formatDelta(Number.NaN, { unit: 'pts' })).toBe('—');
  });
});
