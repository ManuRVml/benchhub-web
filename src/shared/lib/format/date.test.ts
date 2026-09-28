import { describe, expect, it } from 'vitest';

import { formatDate } from './date';

describe('formatDate', () => {
  it('formats a calendar date as "dd mmm yyyy"', () => {
    expect(formatDate('2025-10-02')).toBe('02 oct 2025');
    expect(formatDate('2025-01-14')).toBe('14 ene 2025');
  });

  it('writes September as the prototype 3-letter "sep", not es-CO Intl "sept"', () => {
    expect(formatDate('2025-09-28')).toBe('28 sep 2025');
    expect(formatDate('2025-09-01')).not.toContain('sept');
  });

  it('writes every month with 3 letters and no trailing dot', () => {
    const months = [
      'ene',
      'feb',
      'mar',
      'abr',
      'may',
      'jun',
      'jul',
      'ago',
      'sep',
      'oct',
      'nov',
      'dic',
    ];
    months.forEach((name, index) => {
      const month = String(index + 1).padStart(2, '0');
      expect(formatDate(`2025-${month}-15`)).toBe(`15 ${name} 2025`);
    });
    expect(formatDate('2025-03-05')).toBe('05 mar 2025');
  });

  it('reads only the date part of a date-time, without timezone shift', () => {
    expect(formatDate('2025-10-02T23:30:00-05:00')).toBe('02 oct 2025');
    expect(formatDate('2025-01-01')).toBe('01 ene 2025');
  });

  it('renders an em dash for missing or invalid values', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDate(undefined)).toBe('—');
    expect(formatDate('')).toBe('—');
    expect(formatDate('not a date')).toBe('—');
    expect(formatDate('2025-02-30')).toBe('—');
  });
});
