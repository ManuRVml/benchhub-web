import { useT } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { dataStateAttrs } from '@/shared/lib/data-state';

import { barWidthPct, defaultFormat } from './bar-math';
import { BAR_TONE_CLASS, TRACK_CLASS } from './bar-tones';
import { chartTestIds } from './test-ids';
import { barTransitionClass, usePrefersReducedMotion } from './use-prefers-reduced-motion';

import type { BarValue } from './bar-math';
import type { BarTone } from './bar-tones';
import type { ChangeEvent } from 'react';

export type PairedBarSide = 'primary' | 'secondary';

export interface PairedBarSeries {
  /** Series name shown before the bar, already translated (e.g. "GE", "Pares", "Chevron"). */
  label: string;
  value: BarValue;
  /** Fill colour; defaults: primary `highlight` (Ecopetrol), secondary `peer`. */
  tone?: BarTone;
  /** Fill class overriding `tone` (e.g. a per-company brand colour outside the `BarTone` set). */
  fillClassName?: string;
}

export interface PairedBarRowProps {
  /** Indicator name, already translated; names the row group. */
  label: string;
  primary: PairedBarSeries;
  secondary: PairedBarSeries;
  /** Largest |value| of the whole chart (see `maxAbs`); bar width = |value| / (max × 1.15). */
  max: number;
  /** Value label formatter (es-CO); default 1 decimal, signed (OQ-10). */
  format?: (value: BarValue) => string;
  /** Which values render as number inputs (controlled). */
  editable?: PairedBarSide | 'both';
  /** Parsed value of an edited input: a number, or `null` when the input is cleared. */
  onValueChange?: (side: PairedBarSide, value: number | null) => void;
  /** Bar thickness in px (catalogue: 14 company, 18 peer average). */
  size?: 14 | 18;
  /** Test-id owner: bars/inputs get `{scope}-{component}-bar|input-{primary|secondary}`. */
  testIds?: { scope: string; component: string };
  className?: string;
}

const SIZE_CLASS = { 14: 'h-14', 18: 'h-18' } as const;

/** Parses a number input: empty → null; otherwise the number (NaN → null). */
export function parseBarInput(raw: string): number | null {
  if (raw.trim() === '') return null;
  const value = Number(raw);
  return Number.isNaN(value) ? null : value;
}

/**
 * One indicator with two horizontal bars, e.g. GE vs promedio de pares (catalogue "PairedBarRow"; prototype C1, C2).
 * Width = |value| / (max × 1.15); negative values keep their absolute length and a signed label (OQ-10); `null`
 * renders an empty track and "—". Each bar is `role="img"` named "{series}: {value}"; editable values are controlled
 * number inputs that report the parsed number.
 */
export function PairedBarRow({
  label,
  primary,
  secondary,
  max,
  format = defaultFormat,
  editable,
  onValueChange,
  size = 18,
  testIds,
  className,
}: PairedBarRowProps) {
  const t = useT();
  const reducedMotion = usePrefersReducedMotion();
  const series: [PairedBarSide, PairedBarSeries, BarTone][] = [
    ['primary', primary, primary.tone ?? 'highlight'],
    ['secondary', secondary, secondary.tone ?? 'peer'],
  ];

  return (
    <div role="group" aria-label={label} className={cn('grid gap-6', className)}>
      {series.map(([side, s, tone]) => {
        const width = barWidthPct(s.value, max);
        const missing = width === null;
        const text = missing ? t('common.chart.noValue') : format(s.value);
        const isEditable = editable === side || editable === 'both';
        return (
          <div key={side} className="grid grid-cols-[auto_1fr_auto] items-center gap-8">
            <span className="text-micro text-text-secondary">{s.label}</span>
            <div
              role="img"
              aria-label={`${s.label}: ${text}`}
              {...dataStateAttrs(missing ? 'empty' : 'ready')}
              {...(testIds
                ? { 'data-testid': chartTestIds.bar(testIds.scope, testIds.component, side) }
                : {})}
              className={cn('w-full overflow-hidden rounded-bar', TRACK_CLASS, SIZE_CLASS[size])}
            >
              {missing ? null : (
                <div
                  data-bar=""
                  className={cn(
                    'h-full rounded-bar',
                    s.fillClassName ?? BAR_TONE_CLASS[tone],
                    barTransitionClass(reducedMotion),
                  )}
                  style={{ width: `${String(width)}%` }}
                />
              )}
            </div>
            {isEditable ? (
              <input
                type="number"
                step="0.1"
                inputMode="decimal"
                aria-label={t('common.chart.editValue', { label: `${label} · ${s.label}` })}
                value={s.value ?? ''}
                {...(testIds
                  ? { 'data-testid': chartTestIds.input(testIds.scope, testIds.component, side) }
                  : {})}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  onValueChange?.(side, parseBarInput(event.target.value));
                }}
                className="w-64 rounded-control border border-border-default bg-surface-card px-6 py-2 font-mono text-small text-text-body"
              />
            ) : (
              <span aria-hidden="true" className="font-mono text-small text-text-body">
                {missing ? defaultFormat(null) : format(s.value)}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
