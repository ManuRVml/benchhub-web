import { cn } from '@/shared/lib';
import { COMPANY_COLOR_CLASSES, companyColorClasses } from '@/shared/lib/company-color';

import { initialsOf } from '../avatar';

import type { CompanyColorKey } from '@/shared/lib/company-color';

/** `sm` 24px square (peer news, company cards: SCR-05, SCR-08) or `md` 36px. */
export type CompanyLogoChipSize = 'sm' | 'md';

const SIZE_CLASS: Readonly<Record<CompanyLogoChipSize, string>> = {
  sm: 'size-24 rounded-sm text-10',
  // Same 36px as the header controls (`size.control.iconButton.md`) until an avatar size token exists.
  md: 'size-(--size-control-icon-button-md) rounded-md text-12',
};

/**
 * Initials colour per company colour. The prototype draws white 700 10px initials on every company colour, which fails
 * WCAG AA on the light ones: the dark colours (and the fallback) keep `text.inverse`, every other colour takes the
 * darkest ink token, `dark.bg` (#120823), which reaches AA on all of them (lowest: bp #048BA8, 4.85:1).
 */
const INVERSE_TEXT_KEYS: readonly CompanyColorKey[] = ['petrobras', 'chevron', 'fallback'];
const INVERSE_TEXT_BG = new Set<string>(
  INVERSE_TEXT_KEYS.map((key) => COMPANY_COLOR_CLASSES[key].bg),
);

export interface CompanyLogoChipProps {
  /** Company colour key (`colorKey` of the contracts, CF-98); unknown or missing keys get `company.fallback`. */
  slug: string | null | undefined;
  /** Company name: shown next to the chip and the source of the initials. */
  name: string;
  /** Two-letter initials when the BFF sends them (`initials`); derived from `name` otherwise. */
  initials?: string;
  /** Square size; default `sm` (24px). */
  size?: CompanyLogoChipSize;
  /**
   * Shows the name next to the chip (default `true`); then the chip is decorative. Without the name the chip is an
   * image named by `name`.
   */
  showName?: boolean;
  /** `data-testid` of the chip; defaults to `company-logo-chip`. */
  testId?: string;
  className?: string;
}

/** Company "logo": initials on the company colour (`company.*` tokens), optionally followed by the company name. */
export function CompanyLogoChip({
  slug,
  name,
  initials,
  size = 'sm',
  showName = true,
  testId = 'company-logo-chip',
  className,
}: CompanyLogoChipProps) {
  const colors = companyColorClasses(slug);
  const inverse = INVERSE_TEXT_BG.has(colors.bg);
  const chip = (
    <span
      data-testid={testId}
      data-company-color={colors.bg}
      {...(showName ? { 'aria-hidden': true } : { role: 'img', 'aria-label': name })}
      className={cn(
        'inline-flex shrink-0 items-center justify-center font-bold',
        SIZE_CLASS[size],
        colors.bg,
        inverse ? 'text-text-inverse' : 'text-dark-bg',
        !showName && className,
      )}
    >
      {initials ?? initialsOf(name)}
    </span>
  );
  if (!showName) return chip;
  return (
    <span className={cn('inline-flex items-center gap-8', className)}>
      {chip}
      <span className="text-12 font-semibold text-text-heading">{name}</span>
    </span>
  );
}
