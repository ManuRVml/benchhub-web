import type { ComponentPropsWithoutRef } from 'react';

/** Props of every icon (ADR-0006): any SVG prop, a square `size` in px and an optional accessible `title`. */
export type IconProps = ComponentPropsWithoutRef<'svg'> & {
  size?: number;
  title?: string;
};

/** Decorative icons are hidden from assistive technology; a titled icon is an image named by its <title>. */
export function iconA11yProps(
  title: string | undefined,
): { 'aria-hidden': true; focusable: 'false' } | { role: 'img' } {
  return title === undefined ? { 'aria-hidden': true, focusable: 'false' } : { role: 'img' };
}
