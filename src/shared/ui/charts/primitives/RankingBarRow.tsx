import { useT } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { dataStateAttrs } from '@/shared/lib/data-state';

import { barWidthPct, defaultFormat } from './bar-math';
import { BAR_TONE_CLASS, TRACK_CLASS } from './bar-tones';
import { barTransitionClass, usePrefersReducedMotion } from './use-prefers-reduced-motion';

import type { BarValue } from './bar-math';
import type { BarTone } from './bar-tones';

export type RankingHighlight = 'ecopetrol' | 'leader';

export interface RankingBarRowProps {
  /** Position in the ranking (1-based); omitted rows show no rank. */
  rank?: number;
  /** Company or item name (data). */
  label: string;
  value: BarValue;
  /** Largest |value| of the ranking; bar width = |value| / (max × 1.15). */
  max: number;
  format?: (value: BarValue) => string;
  /** Fill colour; default `monitor` (prototype C8). Ecopetrol rows default to `highlight`. */
  tone?: BarTone;
  /** Row highlight: Ecopetrol (`chart.ecoChip.rowBg`) or the leader (`chart.leader.rowBg`). */
  highlight?: RankingHighlight;
  /** Makes the name a button (e.g. OVL-13 company profile) instead of plain text. */
  onLabelClick?: () => void;
  size?: 16 | 18;
  'data-testid'?: string;
  className?: string;
}

const HIGHLIGHT_CLASS: Record<RankingHighlight, string> = {
  ecopetrol: 'bg-chart-eco-chip-row-bg',
  leader: 'bg-chart-leader-row-bg',
};
const SIZE_CLASS = { 16: 'h-16', 18: 'h-18' } as const;

/**
 * One row of a horizontal ranking (catalogue "HorizontalBarList" row; prototype C6, C8): rank, name, bar, value.
 * Width = |value| / (max × 1.15), signed label, `null` → empty track and "—". The bar is `role="img"` named
 * "{label}: {value}"; `data-highlight` marks the Ecopetrol / leader row.
 */
export function RankingBarRow({
  rank,
  label,
  value,
  max,
  format = defaultFormat,
  tone,
  highlight,
  onLabelClick,
  size = 16,
  'data-testid': dataTestId,
  className,
}: RankingBarRowProps) {
  const t = useT();
  const reducedMotion = usePrefersReducedMotion();
  const width = barWidthPct(value, max);
  const missing = width === null;
  const fill = tone ?? (highlight === 'ecopetrol' ? 'highlight' : 'monitor');
  return (
    <div
      data-testid={dataTestId}
      {...(highlight ? { 'data-highlight': highlight } : {})}
      {...dataStateAttrs(missing ? 'empty' : 'ready')}
      className={cn(
        'grid grid-cols-[auto_minmax(0,8fr)_minmax(0,16fr)_auto] items-center gap-8 rounded-sm px-8 py-4',
        highlight ? HIGHLIGHT_CLASS[highlight] : '',
        className,
      )}
    >
      <span className="text-micro text-text-secondary">{rank ?? ''}</span>
      {onLabelClick ? (
        <button
          type="button"
          onClick={(event) => {
            // The row itself may carry its own click handler (e.g. toggling an explanation); the name is a
            // distinct target (OVL-13 "company names/(i)" trigger, docs/design/overlays.md).
            event.stopPropagation();
            onLabelClick();
          }}
          className="truncate text-start text-small text-text-body underline-offset-2 hover:text-text-link hover:underline"
        >
          {label}
        </button>
      ) : (
        <span className="truncate text-small text-text-body">{label}</span>
      )}
      <div
        role="img"
        aria-label={`${label}: ${missing ? t('common.chart.noValue') : format(value)}`}
        className={cn('w-full overflow-hidden rounded-bar', TRACK_CLASS, SIZE_CLASS[size])}
      >
        {missing ? null : (
          <div
            data-bar=""
            className={cn(
              'h-full rounded-bar',
              BAR_TONE_CLASS[fill],
              barTransitionClass(reducedMotion),
            )}
            style={{ width: `${String(width)}%` }}
          />
        )}
      </div>
      <span aria-hidden="true" className="font-mono text-small text-text-body">
        {missing ? defaultFormat(null) : format(value)}
      </span>
    </div>
  );
}
