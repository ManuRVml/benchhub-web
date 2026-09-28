import { useRef } from 'react';

import { TEMPLATE_ACCENT } from '@/entities/presentation';
import { useT } from '@/shared/i18n';
import { cn } from '@/shared/lib';

import type { SlideTemplateId } from '@/entities/presentation';
import type { KeyboardEvent } from 'react';

export interface SlidePagerProps {
  /** Accessible names of the dots, one per slide (the slide labels, data from V-42). */
  labels: readonly string[];
  /** 0-based current slide. */
  current: number;
  onSelect: (index: number) => void;
  templateId: SlideTemplateId;
  /** Id of the slide panel the dots control; each dot's id is `<idPrefix>-<index>`. */
  panelId: string;
  idPrefix: string;
}

/**
 * SCR-14 pager (`Cmp:SlidePager` + `Cmp:PagerDots`): "‹" / "›" and one dot per slide. The dots are an ARIA tab list
 * with a roving tab stop: Tab reaches the current dot, Arrow Left / Right move and activate, Home / End jump to the ends,
 * and Enter / Space activate the focused dot. The active dot takes the template accent (HTML L4945).
 */
export function SlidePager({
  labels,
  current,
  onSelect,
  templateId,
  panelId,
  idPrefix,
}: SlidePagerProps) {
  const t = useT();
  const dots = useRef<(HTMLButtonElement | null)[]>([]);
  const last = labels.length - 1;

  const go = (index: number) => {
    const next = Math.min(Math.max(index, 0), last);
    onSelect(next);
    dots.current[next]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const target = { ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: last }[
      event.key
    ];
    if (target === undefined) return;
    event.preventDefault();
    go(target);
  };

  const arrow =
    'grid size-(--size-control-icon-button-md) place-items-center rounded-pill bg-surface-page text-17 text-text-secondary hover:bg-border-default disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <div className="flex items-center justify-center gap-6">
      <button
        type="button"
        data-testid="presentation-detail-previous"
        aria-label={t('common.a11y.previousSlide')}
        disabled={current <= 0}
        className={arrow}
        onClick={() => {
          onSelect(current - 1);
        }}
      >
        <span aria-hidden="true">{t('presentation-detail.pager.previous')}</span>
      </button>
      <div role="tablist" aria-label={t('common.a11y.slides')} className="flex items-center gap-6">
        {labels.map((label, index) => {
          const selected = index === current;
          return (
            <button
              key={`${String(index)}-${label}`}
              ref={(node) => {
                dots.current[index] = node;
              }}
              type="button"
              role="tab"
              id={`${idPrefix}-${String(index)}`}
              data-testid={`presentation-detail-dot-${String(index + 1)}`}
              aria-label={label}
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              className="grid size-20 place-items-center rounded-pill"
              onKeyDown={onKeyDown}
              onClick={() => {
                onSelect(index);
              }}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'size-8 rounded-pill',
                  selected ? TEMPLATE_ACCENT[templateId].fill : 'bg-border-default',
                )}
              />
            </button>
          );
        })}
      </div>
      <button
        type="button"
        data-testid="presentation-detail-next"
        aria-label={t('common.a11y.nextSlide')}
        disabled={current >= last}
        className={arrow}
        onClick={() => {
          onSelect(current + 1);
        }}
      >
        <span aria-hidden="true">{t('presentation-detail.pager.next')}</span>
      </button>
    </div>
  );
}
