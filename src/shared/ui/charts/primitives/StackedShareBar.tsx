import { useId, useState } from 'react';

import { cn } from '@/shared/lib';
import { formatPercent } from '@/shared/lib/format';

import { BAR_TONE_CLASS, ON_TONE_TEXT_CLASS } from './bar-tones';
import { chartTestIds } from './test-ids';

import type { BarTone } from './bar-tones';
import type { KeyboardEvent, ReactNode } from 'react';

export interface StackedShareSegment {
  id: string;
  /** Segment name, already translated (e.g. "Financiera"). */
  label: string;
  /** Share of the bar in % (the widths are value / Σ values, so shares need not add up to exactly 100). */
  value: number;
  tone: BarTone;
}

export interface StackedShareBarProps {
  segments: readonly StackedShareSegment[];
  /** Accessible name of the whole bar, already translated (e.g. "Peso por dimensión · Ecopetrol"). */
  'aria-label': string;
  /** Controlled open tip; omit to let the bar manage it. */
  openSegmentId?: string | null;
  onOpenSegmentChange?: (id: string | null) => void;
  /** Tip content of a segment; default "{label} · {share}". */
  renderTip?: (segment: StackedShareSegment) => ReactNode;
  /** Segment ids forced to opacity 0.3 regardless of the open tip (e.g. dimensions not selected by an outer tab). */
  dimSegmentIds?: readonly string[];
  /** Bar height: sm 24px, md 28px (prototype 26 / 30px; nearest spacing tokens). */
  size?: 'sm' | 'md';
  /** Test-id owner: segments `{scope}-{component}-segment-{id}`, tip `{scope}-{component}-tip-{id}`. */
  testIds?: { scope: string; component: string };
  className?: string;
}

const SIZE_CLASS = {
  sm: 'h-(--size-chart-stacked-bar-sm)',
  md: 'h-(--size-chart-stacked-bar-md)',
} as const;

const shareText = (segment: StackedShareSegment) => formatPercent(segment.value, { decimals: 0 });

/**
 * In-bar share label. Only the fill layer dims, so a dimmed segment (a 30 % tint) takes dark text; a tone without an
 * AA text colour (`ON_TONE_TEXT_CLASS` null) shows no in-bar label; its share stays in the name and the tip.
 */
function label(segment: StackedShareSegment, dimmed: boolean) {
  const textClass = dimmed ? 'text-text-heading' : ON_TONE_TEXT_CLASS[segment.tone];
  if (textClass === null) return null;
  return (
    <span aria-hidden="true" className={cn('relative', textClass)}>
      {shareText(segment)}
    </span>
  );
}

/**
 * 100 % stacked horizontal bar of shares (catalogue "StackedBar" composition; prototype C7 peso por dimensión).
 * Each segment is a native button: click / Enter / Space toggles its tip, Escape closes it, one tip is open at a time
 * and the other segments dim to 30 % while it is open. Segment width = value / Σ values.
 */
export function StackedShareBar({
  segments,
  'aria-label': ariaLabel,
  openSegmentId,
  onOpenSegmentChange,
  renderTip,
  dimSegmentIds,
  size = 'md',
  testIds,
  className,
}: StackedShareBarProps) {
  const baseId = useId();
  const [uncontrolledOpen, setUncontrolledOpen] = useState<string | null>(null);
  const openId = openSegmentId === undefined ? uncontrolledOpen : openSegmentId;
  const setOpen = (id: string | null) => {
    if (openSegmentId === undefined) setUncontrolledOpen(id);
    onOpenSegmentChange?.(id);
  };
  const total = segments.reduce((sum, s) => sum + Math.max(0, s.value), 0);
  const open = segments.find((s) => s.id === openId);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Escape' && openId !== null) {
      event.stopPropagation();
      setOpen(null);
    }
  };

  return (
    <div role="group" aria-label={ariaLabel} className={cn('grid gap-6', className)}>
      <div className={cn('flex w-full overflow-hidden rounded-sm', SIZE_CLASS[size])}>
        {segments.map((segment) => {
          const isOpen = segment.id === openId;
          const dimmed =
            (openId !== null && !isOpen) || (dimSegmentIds?.includes(segment.id) ?? false);
          const width = total > 0 ? (Math.max(0, segment.value) / total) * 100 : 0;
          return (
            <button
              key={segment.id}
              type="button"
              aria-label={`${segment.label}: ${shareText(segment)}`}
              aria-expanded={isOpen}
              aria-controls={isOpen ? `${baseId}-tip` : undefined}
              data-selected={isOpen}
              data-dimmed={dimmed}
              {...(testIds
                ? {
                    'data-testid': chartTestIds.segment(
                      testIds.scope,
                      testIds.component,
                      segment.id,
                    ),
                  }
                : {})}
              onClick={() => {
                setOpen(isOpen ? null : segment.id);
              }}
              onKeyDown={onKeyDown}
              className="relative flex h-full items-center justify-center text-micro-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
              style={{ width: `${String(width)}%` }}
            >
              <span
                aria-hidden="true"
                data-fill=""
                className={cn(
                  'absolute inset-0 transition-opacity motion-reduce:transition-none',
                  BAR_TONE_CLASS[segment.tone],
                  dimmed ? 'opacity-30' : 'opacity-100',
                )}
              />
              {label(segment, dimmed)}
            </button>
          );
        })}
      </div>
      {open ? (
        <div
          id={`${baseId}-tip`}
          role="status"
          {...(testIds
            ? { 'data-testid': chartTestIds.tip(testIds.scope, testIds.component, open.id) }
            : {})}
          className="rounded-sm bg-surface-page px-12 py-6 text-small text-text-body"
        >
          {renderTip ? renderTip(open) : `${open.label} · ${shareText(open)}`}
        </div>
      ) : null}
    </div>
  );
}
