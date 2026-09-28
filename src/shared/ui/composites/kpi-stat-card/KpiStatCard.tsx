import { useT } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import {
  EMPTY,
  formatCurrency,
  formatDelta,
  formatMultiple,
  formatNumber,
  formatPercent,
  formatUnit,
} from '@/shared/lib/format';
import { ArrowDownIcon, ArrowUpIcon } from '@/shared/ui/icons';

import type { DisplayUnit } from '@/shared/lib/format';

/**
 * How the value is formatted (es-CO, P5-06): `percent` "7,4%", `number` "4.102", `multiple` "1,3x", `cop` "$ 1.935",
 * `usd` "US$ 46", or a display unit ("71,4 USD/B"). Missing values (`null`) render "—" (CF-37).
 */
export type KpiUnit = 'percent' | 'number' | 'multiple' | 'cop' | 'usd' | DisplayUnit;

/**
 * Colour of the value (SCR-05 / SCR-11 KPI tiles). The prototype's amber / cyan / green values fail WCAG AA on white,
 * so every tone maps to the AA-safe text token of its family.
 */
export type KpiTone = 'neutral' | 'brand' | 'info' | 'success' | 'warning' | 'danger';

const TONE_CLASS: Readonly<Record<KpiTone, string>> = {
  neutral: 'text-text-heading',
  brand: 'text-brand-primary',
  info: 'text-ai-text',
  success: 'text-status-success-text',
  warning: 'text-status-warning-text',
  danger: 'text-status-danger-text',
};

export interface KpiDelta {
  /** Signed variation; `null` renders "—" and no trend. */
  value: number | null;
  /** `%` (attached, "+0,6%", default) or `pts` ("-2,0 pts"). */
  unit?: '%' | 'pts';
}

export interface KpiStatCardProps {
  /** Visible label under the value, e.g. "Cobertura prom.". Translated copy. */
  label: string;
  /** Raw value; formatted with `unit`. `null` renders "—". */
  value: number | null;
  /** Value format; default `number`. */
  unit?: KpiUnit;
  /** Decimals of the value; default: the formatter's (1 for percent / units / multiple, 0 for number and currency). */
  decimals?: number;
  /** Signed variation with a trend arrow (up ▲ positive, down ▼ negative, none at 0). */
  delta?: KpiDelta;
  /** Colour of the value; default `neutral`. */
  tone?: KpiTone;
  /** Optional caption under the label (range, period, source). */
  info?: string;
  /** `start` (default) or `center`: the centred tile of the SCR-05 executive summary (prototype L264). */
  align?: 'start' | 'center';
  /**
   * Where the label sits: `below` the value (default, SCR-05 tiles) or `above` it as a small muted caption (SCR-11
   * Monitor tiles, BencHUD.dc.html:1724-1733: 11px label, then the 22px value).
   */
  labelPosition?: 'below' | 'above';
  /** `data-testid` of the card; defaults to `kpi-stat-card`. */
  testId?: string;
  className?: string;
}

/** es-CO text of a KPI value (also used in the accessible sentence). */
export function formatKpiValue(
  value: number | null,
  unit: KpiUnit = 'number',
  decimals?: number,
): string {
  const options = decimals === undefined ? {} : { decimals };
  switch (unit) {
    case 'percent':
      return formatPercent(value, options);
    case 'number':
      return formatNumber(value, options);
    case 'multiple':
      return formatMultiple(value, options);
    case 'cop':
      return formatCurrency(value, 'COP', options);
    case 'usd':
      return formatCurrency(value, 'USD', options);
    default:
      return formatUnit(value, unit, options);
  }
}

type Trend = 'up' | 'down' | 'flat';

const trendOf = (value: number | null): Trend | null =>
  value === null ? null : value > 0 ? 'up' : value < 0 ? 'down' : 'flat';

const TREND_CLASS: Readonly<Record<Trend, string>> = {
  up: 'text-status-success-text',
  down: 'text-status-danger-text',
  flat: 'text-text-secondary',
};

/**
 * KPI tile (component-catalog.md "KpiStat", `tile` variant): big es-CO value, label, optional signed delta with a
 * trend arrow and a caption. Screen readers get one sentence ("Brent: 71,4 USD/B, +0,6%, sube") instead of the pieces.
 */
export function KpiStatCard({
  label,
  value,
  unit = 'number',
  decimals,
  delta,
  tone = 'neutral',
  info,
  align = 'start',
  labelPosition = 'below',
  testId = 'kpi-stat-card',
  className,
}: KpiStatCardProps) {
  const t = useT();
  const formatted = formatKpiValue(value, unit, decimals);
  const trend = delta ? trendOf(delta.value) : null;
  const deltaText = delta ? formatDelta(delta.value, { unit: delta.unit ?? '%' }) : null;
  const sentence = [
    `${label}: ${formatted}`,
    deltaText,
    trend === null ? null : t(`common.a11y.trend.${trend}`),
    info ?? null,
  ]
    .filter((part): part is string => part !== null)
    .join(', ');

  return (
    <div
      role="group"
      aria-label={sentence}
      data-testid={testId}
      className={cn(
        'flex flex-col gap-4 rounded-md border border-border-default bg-surface-card px-16 py-14',
        align === 'center' && 'items-center text-center',
        className,
      )}
    >
      {labelPosition === 'above' ? (
        <span
          aria-hidden="true"
          data-testid={`${testId}-label`}
          className="text-11 text-text-muted"
        >
          {label}
        </span>
      ) : null}
      <div aria-hidden="true" className="flex items-baseline gap-8">
        <span
          data-testid={`${testId}-value`}
          className={cn('text-kpi', formatted === EMPTY ? 'text-text-muted' : TONE_CLASS[tone])}
        >
          {formatted}
        </span>
        {deltaText === null ? null : (
          <span
            data-testid={`${testId}-delta`}
            className={cn(
              'inline-flex items-center gap-2 text-11 font-semibold',
              trend === null ? 'text-text-secondary' : TREND_CLASS[trend],
            )}
          >
            {trend === 'up' ? <ArrowUpIcon size={12} /> : null}
            {trend === 'down' ? <ArrowDownIcon size={12} /> : null}
            {deltaText}
          </span>
        )}
      </div>
      {labelPosition === 'below' ? (
        <span
          aria-hidden="true"
          data-testid={`${testId}-label`}
          className="text-12 text-text-secondary"
        >
          {label}
        </span>
      ) : null}
      {info === undefined ? null : (
        <span aria-hidden="true" className="text-11 text-text-secondary">
          {info}
        </span>
      )}
    </div>
  );
}
