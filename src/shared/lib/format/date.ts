import { EMPTY, LOCALE } from './number';

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})/;

// UTC on both sides: the ISO date is a calendar date, so no local timezone may shift the day.
const dateParts = new Intl.DateTimeFormat(LOCALE, {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

/**
 * Calendar date as "02 oct 2025": day (2 digits), 3-letter month without a trailing dot, year; the "de" literals of
 * es-CO are dropped. es-CO Intl abbreviates September as "sept"; the prototype writes "28 sep 2025" (HTML L3560), so
 * the month is cut to 3 letters. Accepts an ISO date or date-time string (only the date part is read).
 */
export function formatDate(iso: string | null | undefined): string {
  if (iso == null) return EMPTY;
  const match = ISO_DATE.exec(iso);
  if (!match) return EMPTY;
  const [, year, month, day] = match.map(Number);
  if (year === undefined || month === undefined || day === undefined) return EMPTY;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (Number.isNaN(date.getTime()) || date.getUTCMonth() !== month - 1) return EMPTY;

  const parts = dateParts.formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '';
  return `${part('day')} ${part('month').replace(/\.$/, '').slice(0, 3)} ${part('year')}`;
}
