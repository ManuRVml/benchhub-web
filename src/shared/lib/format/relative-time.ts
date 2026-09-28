import { EMPTY } from './number';

// `always` keeps "hace 1 día" / "hace 2 días" (the prototype's wording) instead of "ayer" / "anteayer"; `auto` only
// supplies "ahora" for the last minute.
const formatter = new Intl.RelativeTimeFormat('es-CO', { numeric: 'always' });
const nowFormatter = new Intl.RelativeTimeFormat('es-CO', { numeric: 'auto' });

const STEPS: readonly (readonly [Intl.RelativeTimeFormatUnit, number])[] = [
  ['second', 60],
  ['minute', 60],
  ['hour', 24],
  ['day', 30],
  ['month', 12],
  ['year', Number.POSITIVE_INFINITY],
];

export interface RelativeTimeOptions {
  /** Sentence case, for a label that starts a line: "Hace 2 horas" (SCR-15 notifications). Default `false`. */
  capitalize?: boolean;
}

/**
 * es-CO relative time of an ISO date-time, as the V-26 front formats it: "ahora", "hace 4 horas", "hace 2 días". Under a
 * minute reads "ahora"; each unit is used until the next one is reached. Invalid input renders EMPTY ("—").
 */
export function formatRelativeTime(
  iso: string,
  now: number = Date.now(),
  { capitalize = false }: RelativeTimeOptions = {},
): string {
  const text = relativeText(iso, now);
  if (!capitalize || text === EMPTY) return text;
  return text.charAt(0).toLocaleUpperCase('es-CO') + text.slice(1);
}

function relativeText(iso: string, now: number): string {
  const time = Date.parse(iso);
  if (Number.isNaN(time)) return EMPTY;
  let value = (time - now) / 1000;
  if (Math.abs(value) < 60) return nowFormatter.format(0, 'second');
  for (const [unit, size] of STEPS) {
    if (Math.abs(value) < size) return formatter.format(Math.trunc(value), unit);
    value /= size;
  }
  return EMPTY;
}
