import { describe, expect, it } from 'vitest';

import { formatRelativeTime } from './relative-time';

const NOW = Date.parse('2026-09-25T10:00:00-05:00');

describe('formatRelativeTime', () => {
  it.each([
    ['2026-09-25T09:59:30-05:00', 'ahora'],
    ['2026-09-25T09:45:00-05:00', 'hace 15 minutos'],
    ['2026-09-25T06:00:00-05:00', 'hace 4 horas'],
    ['2026-09-24T10:00:00-05:00', 'hace 1 día'],
    ['2026-09-22T10:00:00-05:00', 'hace 3 días'],
    ['not a date', '—'],
  ])('%s → %s', (iso, expected) => {
    expect(formatRelativeTime(iso, NOW)).toBe(expected);
  });
});

describe('formatRelativeTime capitalize', () => {
  it('sentence-cases the label for the start of a line (SCR-15) and leaves the default lower case', () => {
    expect(formatRelativeTime('2026-09-25T08:00:00-05:00', NOW, { capitalize: true })).toBe(
      'Hace 2 horas',
    );
    expect(formatRelativeTime('2026-09-25T08:00:00-05:00', NOW)).toBe('hace 2 horas');
    expect(formatRelativeTime('2026-09-25T09:59:30-05:00', NOW, { capitalize: true })).toBe(
      'Ahora',
    );
    expect(formatRelativeTime('nope', NOW, { capitalize: true })).toBe('—');
  });
});
