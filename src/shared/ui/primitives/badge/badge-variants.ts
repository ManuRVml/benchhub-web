import { cva } from 'class-variance-authority';

import type { VariantProps } from 'class-variance-authority';

/**
 * Tone classes of Badge (docs/design/component-catalog.md "### Badge"). Every tone uses theme token classes only
 * (src/app/styles/theme.css, generated from docs/design/design-tokens.json); a new tone is a new entry here (OCP).
 */
export const badgeVariants = cva(
  'inline-flex items-center justify-center gap-4 whitespace-nowrap rounded-pill',
  {
    variants: {
      tone: {
        success: 'bg-status-success-bg text-status-success-text',
        warning: 'bg-status-warning-bg text-status-warning-text',
        progress: 'bg-status-warning-note-bg text-status-warning-note-text',
        danger: 'bg-status-danger-bg text-status-danger-text',
        neutral: 'bg-surface-page text-text-secondary',
        // CF-141: text.muted is 2.41:1 on surface.page; the muted tone keeps the fill with the AA secondary text.
        muted: 'bg-surface-page text-text-secondary',
        // CF-141: the prototype fills stay; the text uses AA tokens (the *-base colours are 1.5–3.1:1 at the micro size).
        // There is no info text token: brand.indigo is the AA blue on severity.info.bg (4.85:1).
        severityInfo: 'bg-severity-info-bg text-brand-indigo',
        severitySuccess: 'bg-severity-success-bg text-status-success-text',
        severityWarn: 'bg-severity-warn-bg text-status-warning-text',
        severityError: 'bg-severity-error-bg text-status-danger-text',
        // tier.1 / tier.4 text is white (made for the solid base fills): on the card fills it is 1.1–1.2:1 (CF-141).
        tier1: 'bg-tier-1-card text-status-success-text',
        tier2: 'bg-tier-2-card text-tier-2-text',
        tier3: 'bg-tier-3-card text-tier-3-text',
        tier4: 'bg-tier-4-card text-status-danger-text',
        urgencyHigh: 'bg-urgency-high-bg text-urgency-high-text',
        urgencyMedium: 'bg-urgency-medium-bg text-urgency-medium-text',
        horizonTbg: 'bg-severity-info-bg text-brand-indigo',
        horizonIlp: 'bg-ai-bg text-ai-text',
        // White on status.danger.base is 3.76:1; no text colour reaches AA on that fill, so the count fill darkens to
        // status.danger.text (CF-141, accessibility wins).
        count: 'bg-status-danger-text text-text-inverse',
        // Brand-light count pill ("7 diapositivas", SCR-13 HTML L2453).
        brandSubtle: 'bg-brand-primary-subtle text-brand-primary',
        code: 'bg-surface-page font-mono text-text-secondary',
        highlight: 'bg-chart-eco-chip-bg text-chart-eco-chip-text',
      },
      size: {
        xs: 'px-8 py-2 text-micro',
        sm: 'px-10 py-3 text-micro-strong',
        count: 'min-h-18 min-w-18 px-4 text-micro-strong',
        dot: 'size-8 p-0',
      },
    },
    defaultVariants: { tone: 'neutral', size: 'sm' },
  },
);

export type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>['tone']>;
export type BadgeSize = NonNullable<VariantProps<typeof badgeVariants>['size']>;
