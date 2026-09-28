import { useT } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { dataStateAttrs } from '@/shared/lib/data-state';
import { EMPTY } from '@/shared/lib/format';

import { ratioPct } from './bar-math';
import { BAR_TONE_CLASS, TRACK_CLASS } from './bar-tones';
import { barTransitionClass, usePrefersReducedMotion } from './use-prefers-reduced-motion';

import type { BarValue } from './bar-math';
import type { BarTone } from './bar-tones';

export interface ProgressBarProps {
  /** Progress value; `null` renders an empty track (never 0). */
  value: BarValue;
  /** Default 100. */
  max?: number;
  tone?: Extract<BarTone, 'success' | 'warning' | 'danger' | 'brand' | 'highlight'>;
  /** Track height in px (catalogue: 5 · 6 · 8). */
  height?: 5 | 6 | 8;
  /** Accessible name, already translated by the caller (e.g. "Cobertura Shell"). */
  'aria-label': string;
  /** Formatted value read by assistive tech (e.g. "88 %"); defaults to the raw value. */
  valueText?: string;
  'data-testid'?: string;
  className?: string;
}

const HEIGHT_CLASS = { 5: 'h-5', 6: 'h-6', 8: 'h-8' } as const;

/**
 * Thin horizontal progress / coverage bar (catalogue "ProgressBar"; prototype C3, C11). The fill is `value / max`
 * (no headroom: complete coverage fills the track). `role="progressbar"` exposes the value; with reduced motion the
 * width transition is dropped.
 */
export function ProgressBar({
  value,
  max = 100,
  tone = 'success',
  height = 5,
  'aria-label': ariaLabel,
  valueText,
  'data-testid': dataTestId,
  className,
}: ProgressBarProps) {
  const t = useT();
  const reducedMotion = usePrefersReducedMotion();
  const pct = ratioPct(value, max);
  const missing = pct === null;
  return (
    <div
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={max}
      {...(missing ? {} : { 'aria-valuenow': value ?? undefined })}
      aria-valuetext={missing ? t('common.chart.noValue') : (valueText ?? String(value))}
      data-testid={dataTestId}
      {...dataStateAttrs(missing ? 'empty' : 'ready')}
      className={cn(
        'w-full overflow-hidden rounded-pill',
        TRACK_CLASS,
        HEIGHT_CLASS[height],
        className,
      )}
    >
      {missing ? (
        <span className="sr-only">{EMPTY}</span>
      ) : (
        <div
          data-bar=""
          className={cn(
            'h-full rounded-pill',
            BAR_TONE_CLASS[tone],
            barTransitionClass(reducedMotion),
          )}
          style={{ width: `${String(pct)}%` }}
        />
      )}
    </div>
  );
}
