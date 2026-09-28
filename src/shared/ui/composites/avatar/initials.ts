/**
 * Two-letter initials of a person or company name: the first letters of the first two words ("Camila Bravo" → "CB"),
 * or the first two letters of a single word ("Shell" → "SH", "TotalEnergies" → "TO", as the BFF's `initials`).
 * Empty or blank names give "".
 */
export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const [first = '', second] = words;
  const letters =
    second === undefined ? first.slice(0, 2) : `${first.charAt(0)}${second.charAt(0)}`;
  return letters.toLocaleUpperCase('es-CO');
}
