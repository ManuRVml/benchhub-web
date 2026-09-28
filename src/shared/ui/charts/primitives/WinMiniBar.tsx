import { useT } from '@/shared/i18n';
import { cn } from '@/shared/lib';

import { ratioPct } from './bar-math';
import { BAR_TONE_CLASS, TRACK_CLASS } from './bar-tones';
import { barTransitionClass, usePrefersReducedMotion } from './use-prefers-reduced-motion';

/**
 * Track width of the prototype's win-ratio bar (C2, 80 × 6). Replaced with size-chart-win-bar token.
 */

export interface WinMiniBarProps {
  /** Indicators where Ecopetrol wins. */
  wins: number;
  /** Indicators compared. */
  total: number;
  /** Accessible name, already translated by the caller (e.g. "GE vs. Chevron"). */
  'aria-label': string;
  /** Show the "{wins} de {total}" label next to the bar. Default true. */
  showLabel?: boolean;
  'data-testid'?: string;
  className?: string;
}

/**
 * Win-ratio mini bar, 80 × 6 (prototype C2 "6 de 10"): fill = wins / total in the Ecopetrol highlight colour. The
 * bar is `role="img"` named "{aria-label}: {wins} de {total}".
 */
export function WinMiniBar({
  wins,
  total,
  'aria-label': ariaLabel,
  showLabel = true,
  'data-testid': dataTestId,
  className,
}: WinMiniBarProps) {
  const t = useT();
  const reducedMotion = usePrefersReducedMotion();
  const ratioText = t('common.chart.winRatio', { wins: String(wins), total: String(total) });
  const pct = ratioPct(wins, total) ?? 0;
  return (
    <span data-testid={dataTestId} className={cn('inline-flex items-center gap-8', className)}>
      <span
        role="img"
        aria-label={`${ariaLabel}: ${ratioText}`}
        className={cn(
          'inline-block h-6 w-(--size-chart-win-bar) overflow-hidden rounded-pill',
          TRACK_CLASS,
        )}
      >
        <span
          data-bar=""
          className={cn(
            'block h-full rounded-pill',
            BAR_TONE_CLASS.highlight,
            barTransitionClass(reducedMotion),
          )}
          style={{ width: `${String(pct)}%` }}
        />
      </span>
      {showLabel ? (
        <span aria-hidden="true" className="text-micro text-text-secondary">
          {ratioText}
        </span>
      ) : null}
    </span>
  );
}
