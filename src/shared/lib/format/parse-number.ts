/** Result of reading what the user typed in a NumberInput. */
export type ParsedNumber =
  | { readonly kind: 'empty' }
  | { readonly kind: 'number'; readonly value: number }
  | { readonly kind: 'invalid' };

const EMPTY: ParsedNumber = { kind: 'empty' };
const INVALID: ParsedNumber = { kind: 'invalid' };
/** Integer part written with es-CO thousands dots: "4.102", "-12.345.678". */
const GROUPED = /^-?\d{1,3}(\.\d{3})+$/;
const PLAIN = /^-?(\d+(\.\d*)?|\.\d+)$/;

/**
 * Parses es-CO number input (ADR 0008): ',' is the decimal separator and '.' groups thousands ("4.102,5" → 4102.5,
 * "7,4" → 7.4). Without a comma, a dot followed by groups of three digits is a thousands separator ("4.102" → 4102);
 * any other single dot is read as a decimal point ("7.4" → 7.4). The typographic minus "−" of the formatters is accepted.
 * Blank input is `empty` (the caller maps it to `null`, never 0 — CF-37); anything else is `invalid`.
 */
export function parseEsCoNumber(text: string): ParsedNumber {
  const compact = text.replace(/\s/g, '').replace(/−/g, '-');
  if (compact === '') return EMPTY;

  let normalized = compact;
  const comma = compact.indexOf(',');
  if (comma !== -1) {
    if (comma !== compact.lastIndexOf(',')) return INVALID;
    const integer = compact.slice(0, comma);
    if (integer.includes('.') && !GROUPED.test(integer)) return INVALID;
    normalized = `${integer.replaceAll('.', '')}.${compact.slice(comma + 1)}`;
  } else if (GROUPED.test(compact)) {
    normalized = compact.replaceAll('.', '');
  }

  if (!PLAIN.test(normalized)) return INVALID;
  const value = Number(normalized);
  return Number.isFinite(value) ? { kind: 'number', value } : INVALID;
}

/** Editable text of a value: es-CO decimal comma, no grouping (so it parses back unchanged); `null` is empty. */
export function formatEditableNumber(value: number | null): string {
  if (value === null || Number.isNaN(value)) return '';
  return String(value).replace('.', ',');
}
