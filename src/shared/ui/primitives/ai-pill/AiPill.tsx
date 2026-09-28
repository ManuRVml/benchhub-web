import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type ComponentPropsWithoutRef } from 'react';

import { cn } from '@/shared/lib';

import { usePrefersReducedMotion } from './use-prefers-reduced-motion';
import './ai-pill.css';

/**
 * Cyan "✦" pill that triggers an AI action (component-catalog.md "AiActionButton", `Cmp:AiPillButton`): "✦ Generar
 * narrativa ejecutiva" (md, SCR-08 HTML L725), "✦ Narrativa" (sm, HTML L735), "✦ Recomendaciones de Yarbis (n)".
 * Colours are the AI tokens: `ai.bg` #E3F6FA, `ai.border` #A8E6EC, `ai.text` #0E7490.
 */
export const aiPillVariants = cva(
  'inline-flex shrink-0 items-center gap-6 rounded-pill border border-ai-border bg-ai-bg font-semibold whitespace-nowrap text-ai-text transition-colors hover:border-ai-accent disabled:cursor-not-allowed disabled:opacity-50 aria-busy:cursor-progress',
  {
    variants: {
      size: {
        sm: 'px-12 py-6 text-11',
        md: 'px-14 py-8 text-12',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

/**
 * Pulse ring of an AI pill that wants attention (ai-pill.css, the prototype's `aiPulse`). Never applied when the user
 * prefers reduced motion; the stylesheet also scopes it to `prefers-reduced-motion: no-preference`.
 */
export const AI_PILL_PULSE_CLASS = 'ai-pill-pulse';

export type AiPillSize = NonNullable<VariantProps<typeof aiPillVariants>['size']>;

export interface AiPillProps extends Omit<ComponentPropsWithoutRef<'button'>, 'children'> {
  /** Visible label without the "✦" glyph, which the pill adds as decoration (`aria-hidden`). Translated copy. */
  children: string;
  /** `sm` (module "Narrativa": 6px 12px, 11px text) or `md` (action row: 8px 14px, 12px text, default). */
  size?: AiPillSize;
  /** Appends " (n)" to the label ("Recomendaciones de Yarbis (3)"). */
  count?: number;
  /** Pulses to draw attention (Yarbis has something new); ignored under `prefers-reduced-motion: reduce`. */
  pulse?: boolean;
  /** AI drafting in progress: sets `aria-busy` and ignores clicks, keeping the label. */
  loading?: boolean;
  /** `data-testid` of the rendered `<button>`; defaults to `ai-pill`. */
  testId?: string;
}

/** AI action pill: native `<button type="button">` with a decorative "✦" before its label. */
export const AiPill = forwardRef<HTMLButtonElement, AiPillProps>(function AiPill(
  {
    size,
    count,
    pulse = false,
    loading = false,
    testId = 'ai-pill',
    className,
    type = 'button',
    onClick,
    children,
    ...props
  },
  ref,
) {
  const reducedMotion = usePrefersReducedMotion();
  return (
    <button
      ref={ref}
      type={type}
      data-testid={testId}
      aria-busy={loading || undefined}
      className={cn(
        aiPillVariants({ size }),
        pulse && !reducedMotion && AI_PILL_PULSE_CLASS,
        className,
      )}
      onClick={loading ? undefined : onClick}
      {...props}
    >
      <span aria-hidden="true" className={size === 'sm' ? 'text-12' : 'text-13'}>
        ✦
      </span>
      {count === undefined ? children : `${children} (${String(count)})`}
    </button>
  );
});
