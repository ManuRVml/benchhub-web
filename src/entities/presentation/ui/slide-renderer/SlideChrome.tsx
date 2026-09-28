import { useT } from '@/shared/i18n';
import { cn } from '@/shared/lib';

import { TEMPLATE_ACCENT, slideGlow } from './slide-theme';

import type { SlideTemplateId } from './types';
import type { ReactNode } from 'react';

export interface SlideChromeProps {
  template: SlideTemplateId;
  templateName: string;
  /** Eyebrow: the module label (`moduleLabel`). */
  eyebrow: string;
  /** Title row text. */
  title: string;
  /** Id of the title element, used as the slide figure's accessible name. */
  titleId: string;
  /** "{n} / {total}" from the BFF. */
  pageLabel: string;
  /** Analyst note (comment band). */
  note?: string | undefined;
  children: ReactNode;
}

/**
 * Chrome of every kind except title / appendix / empty (slide-renderer.md "Shared chrome", HTML L2113–2330): 6px
 * accent bar, corner glow, eyebrow, title row with a 36×4 accent bar, content box, optional comment band and footer
 * "ECOPETROL · COMPARADOR FINANCIERO · {templateName}" + page label.
 */
export function SlideChrome({
  template,
  templateName,
  eyebrow,
  title,
  titleId,
  pageLabel,
  note,
  children,
}: SlideChromeProps) {
  const t = useT();
  const accent = TEMPLATE_ACCENT[template];
  return (
    <div className="relative flex size-full flex-col bg-surface-card">
      <span aria-hidden="true" className={cn('absolute inset-y-0 left-0 z-2 w-6', accent.fill)} />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-0 size-[220px]"
        style={{ backgroundImage: slideGlow(template) }}
      />
      <p
        className={cn(
          'absolute top-14 left-[60px] m-0 text-10 font-bold tracking-[.08em] uppercase',
          accent.text,
        )}
      >
        {eyebrow}
      </p>
      <div className="flex min-h-0 flex-1 flex-col gap-14 px-[60px] pt-[34px] pb-6">
        <div className="flex items-center justify-between gap-12">
          <h3 id={titleId} className="m-0 text-title-slide text-text-heading">
            {title}
          </h3>
          <span
            aria-hidden="true"
            className={cn('h-4 w-[36px] shrink-0 rounded-xs', accent.fill)}
          />
        </div>
        <div className="min-h-0 flex-1">{children}</div>
      </div>
      {note === undefined || note === '' ? null : (
        <div className="mx-[60px] mb-8 rounded-control border border-status-warning-note-border bg-status-warning-note-bg px-12 py-8">
          <p className="m-0 text-10 font-bold tracking-[.06em] text-status-warning-text uppercase">
            {t('presentation-detail.slides.comment')}
          </p>
          <p className="m-0 text-12 leading-[1.45] text-status-warning-note-text">{note}</p>
        </div>
      )}
      {/* A plain div, not <footer>: several slides on one page must not add contentinfo landmarks. */}
      <div
        data-testid="slide-footer"
        className="mx-[60px] flex h-[26px] shrink-0 items-center justify-between border-t border-border-subtle text-10 font-medium tracking-[.04em] text-text-secondary"
      >
        <span>{t('presentation-detail.slides.footer', { templateName })}</span>
        <span className="font-mono font-semibold">{pageLabel}</span>
      </div>
    </div>
  );
}
