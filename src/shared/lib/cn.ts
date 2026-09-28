import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

import { tokenThemeScales } from './tailwind-theme.generated';

// tailwind-merge must know the token names of each Tailwind namespace (generated from design-tokens.json), otherwise
// `text-eyebrow` (font size) and `text-brand-primary` (colour) would be treated as the same utility group.
const twMerge = extendTailwindMerge({
  extend: {
    theme: Object.fromEntries(
      Object.entries(tokenThemeScales).map(([namespace, names]) => [namespace, [...names]]),
    ),
  },
});

/** Joins conditional class names and lets the last conflicting Tailwind utility win (`cn('p-2', 'p-4')` → `p-4`). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
