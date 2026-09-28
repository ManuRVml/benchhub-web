import { cva } from 'class-variance-authority';

import type { VariantProps } from 'class-variance-authority';

/**
 * Classes of Chip (docs/design/component-catalog.md "### Chip"), theme token classes only. Selectable variants
 * (choice, toggle, segment, soft, option, estimate) switch look with `selected`; a new variant is a new entry here (OCP).
 */
export const chipVariants = cva(
  'inline-flex items-center gap-4 whitespace-nowrap rounded-pill border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus disabled:cursor-not-allowed disabled:text-text-muted',
  {
    variants: {
      variant: {
        static: 'border-transparent bg-surface-page text-text-secondary',
        indicator: 'border-transparent bg-surface-page text-text-secondary',
        choice: 'cursor-pointer',
        toggle: 'cursor-pointer',
        // On/off filter toggle without a check mark (SCR-15 "Severidad"): square-ish, borderless.
        segment: 'cursor-pointer rounded-control border-transparent',
        // Light toggle: brand-light when on, grey when off (SCR-13 chart options, Portada / Cierre, HTML L2475, L2488).
        soft: 'cursor-pointer border-transparent',
        // Wizard option (SCR-07 "Tipo de análisis" / "Alcance"): 8px radius, lilac outline when selected, no check.
        option: 'cursor-pointer rounded-control',
        estimate: 'cursor-pointer',
        filter: 'border-brand-primary-border bg-brand-primary-subtle text-brand-primary',
        suggestion:
          'cursor-pointer border-brand-primary-border bg-brand-primary-subtle text-brand-primary',
        dashed:
          'cursor-pointer border-dashed border-brand-primary-border bg-surface-card text-brand-primary',
      },
      selected: { true: '', false: '' },
      size: {
        sm: 'px-8 py-2 text-micro',
        md: 'px-12 py-6 text-small-medium',
        /** Filter toggles: padding 5px 11px, 12px / 500 (BencHUD.dc.html:2953). */
        toggle: 'px-11 py-5 text-small-medium',
        /** Wizard options: padding 9px 14px, 12px / 500 (BencHUD.dc.html:472). */
        option: 'px-14 py-9 text-small-medium',
      },
    },
    compoundVariants: [
      {
        variant: ['choice', 'toggle'],
        selected: false,
        className:
          'border-border-default bg-surface-page text-text-secondary hover:border-brand-primary-border',
      },
      {
        variant: ['choice', 'toggle'],
        selected: true,
        className: 'border-brand-primary bg-brand-primary text-text-inverse',
      },
      {
        variant: 'segment',
        selected: false,
        className: 'bg-surface-page text-text-secondary hover:bg-border-default',
      },
      {
        variant: 'segment',
        selected: true,
        className: 'bg-brand-primary text-text-inverse',
      },
      {
        variant: 'soft',
        selected: false,
        className: 'bg-surface-page text-text-secondary hover:text-brand-primary',
      },
      {
        variant: 'soft',
        selected: true,
        className: 'bg-brand-primary-subtle text-brand-primary',
      },
      {
        variant: 'option',
        selected: false,
        className:
          'border-border-default bg-surface-page text-text-secondary hover:border-brand-primary-border',
      },
      {
        variant: 'option',
        selected: true,
        className: 'border-brand-primary-border bg-brand-primary-subtle text-brand-primary',
      },
      {
        variant: 'estimate',
        selected: false,
        className: 'border-border-default bg-surface-page text-text-secondary',
      },
      {
        variant: 'estimate',
        selected: true,
        className: 'border-status-warning-base bg-status-warning-bg text-status-warning-text',
      },
    ],
    defaultVariants: { variant: 'static', selected: false, size: 'md' },
  },
);

export type ChipVariant = NonNullable<VariantProps<typeof chipVariants>['variant']>;
export type ChipSize = NonNullable<VariantProps<typeof chipVariants>['size']>;

/** Variants that behave as toggle buttons (`aria-pressed`, `data-selected`). */
export const PRESSABLE_VARIANTS: readonly ChipVariant[] = [
  'choice',
  'toggle',
  'segment',
  'soft',
  'option',
  'estimate',
];
