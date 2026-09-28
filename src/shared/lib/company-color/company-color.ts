/**
 * Maps company color keys to Tailwind CSS classes for background and border.
 *
 * Keys are derived from the design tokens in `theme.css` (--color-company-<name>).
 * The fallback is used for unknown, null, undefined, empty strings, or prototype keys.
 */

/**
 * Map of company color classes keyed by the design-tokens slug (camelCase).
 * Each entry provides bg and border class names for Tailwind.
 */
export const COMPANY_COLOR_CLASSES = {
  ecopetrol: { bg: 'bg-company-ecopetrol', border: 'border-company-ecopetrol' },
  bp: { bg: 'bg-company-bp', border: 'border-company-bp' },
  equinor: { bg: 'bg-company-equinor', border: 'border-company-equinor' },
  shell: { bg: 'bg-company-shell', border: 'border-company-shell' },
  totalEnergies: { bg: 'bg-company-total-energies', border: 'border-company-total-energies' },
  oxy: { bg: 'bg-company-oxy', border: 'border-company-oxy' },
  petrobras: { bg: 'bg-company-petrobras', border: 'border-company-petrobras' },
  chevron: { bg: 'bg-company-chevron', border: 'border-company-chevron' },
  isa: { bg: 'bg-company-isa', border: 'border-company-isa' },
  exxon: { bg: 'bg-company-exxon', border: 'border-company-exxon' },
  pttep: { bg: 'bg-company-pttep', border: 'border-company-pttep' },
  repsol: { bg: 'bg-company-repsol', border: 'border-company-repsol' },
  fallback: { bg: 'bg-company-fallback', border: 'border-company-fallback' },
} as const;

/**
 * Fallback company color classes used when the input key is unknown, null, undefined,
 * empty string, or a prototype property (e.g., '__proto__', 'toString').
 */
export const FALLBACK_COMPANY_COLOR = {
  bg: 'bg-company-fallback',
  border: 'border-company-fallback',
} as const;

/**
 * Type representing a valid company color key from the design tokens.
 */
export type CompanyColorKey = keyof typeof COMPANY_COLOR_CLASSES;

/**
 * Returns Tailwind CSS classes for background and border based on the company color key.
 *
 * @param colorKey - The company slug (e.g., 'shell', 'totalEnergies').
 *                   May be null, undefined, or an unknown string.
 * @returns An object with `bg` and `border` class names. Returns fallback classes
 *          for unknown, null, undefined, empty strings, or prototype keys.
 */
export function companyColorClasses(colorKey: string | null | undefined): {
  bg: string;
  border: string;
} {
  if (!colorKey || colorKey === '') {
    return FALLBACK_COMPANY_COLOR;
  }

  const knownKeys = Object.keys(COMPANY_COLOR_CLASSES) as CompanyColorKey[];
  if (knownKeys.includes(colorKey as CompanyColorKey)) {
    return COMPANY_COLOR_CLASSES[colorKey as CompanyColorKey];
  }

  return FALLBACK_COMPANY_COLOR;
}
