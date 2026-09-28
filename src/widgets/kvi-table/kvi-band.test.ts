import { describe, expect, it } from 'vitest';

import { bandOf, calcPct } from './kvi-band';

describe('calcPct', () => {
  it('computes Real/Meta·100 for a "greater is better" KVI, rounded', () => {
    expect(calcPct(10.69, 7.19, false)).toBe(149);
  });

  it('computes Meta/Real·100 for a "lower is better" KVI', () => {
    expect(calcPct(2.32, 2.5, true)).toBe(108);
  });

  it('is not capped at 100', () => {
    expect(calcPct(24, 7, false)).toBe(343);
  });

  it('floors at 0 on a zero denominator instead of producing Infinity', () => {
    expect(calcPct(5, 0, false)).toBe(0);
    expect(calcPct(0, 5, true)).toBe(0);
  });
});

describe('bandOf', () => {
  it('is tbd for null', () => {
    expect(bandOf(null)).toBe('tbd');
  });

  it('is ok at and above 90', () => {
    expect(bandOf(90)).toBe('ok');
    expect(bandOf(149)).toBe('ok');
  });

  it('is watch between 70 and 89', () => {
    expect(bandOf(70)).toBe('watch');
    expect(bandOf(89)).toBe('watch');
  });

  it('is risk below 70', () => {
    expect(bandOf(69)).toBe('risk');
    expect(bandOf(0)).toBe('risk');
  });
});
