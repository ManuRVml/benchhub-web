import { useState } from 'react';

import { useT } from '@/shared/i18n';
import { CompanyLogoChip } from '@/shared/ui/composites/company-logo-chip';
import { EmptyState } from '@/shared/ui/composites/empty-state';
import { SectionCard } from '@/shared/ui/composites/section-card';
import { ArrowUpIcon, ArrowDownIcon } from '@/shared/ui/icons';
import { IconButton } from '@/shared/ui/primitives/icon-button';

import type { ReactElement } from 'react';

/** Peer news item derived from V03Response ok variant (see V03Response in @/shared/api/ports/responses.ts). */
export interface PeerNewsItem {
  /** Unique identifier */
  id: string;
  /** Company identifier */
  companyId: string;
  /** Company display name */
  companyName: string;
  /** Key for color lookup (e.g. color palette, logo sprite) */
  colorKey: string;
  /** Two-letter initials for placeholder avatar */
  initials: string;
  /** Impact direction */
  impact: 'up' | 'down';
  /** News headline */
  headline: string;
  /** News source name */
  source: string;
}

const PAGE_SIZE = 5;

// Prototype L339: auto-fill minmax(220px, 1fr) → 1 / 2 / 3 / 4 / 5 columns across the project breakpoints.
const GRID =
  'grid grid-cols-1 gap-14 tablet:grid-cols-2 laptop:grid-cols-3 desktop:grid-cols-4 canvas:grid-cols-5';

export interface PeerNewsCarouselProps {
  items: readonly PeerNewsItem[];
}

export function PeerNewsCarousel({ items }: PeerNewsCarouselProps): ReactElement | null {
  const t = useT();

  const [current, setCurrent] = useState(0);

  // Prototype L316-L335: uppercase group label with its "(i)" panel, straight on the page.
  const section = {
    title: t('home.sectionTitles.peerNews'),
    info: t('home.sectionInfo.peerNews'),
    titleVariant: 'eyebrow',
    surface: 'none',
    headingLevel: 2,
    testId: 'peer-news',
  } as const;

  if (items.length === 0) {
    return (
      <SectionCard {...section}>
        <EmptyState title={t('home.news.empty')} variant="inline" testId="peer-news-empty" />
      </SectionCard>
    );
  }

  const pageCount = Math.ceil(items.length / PAGE_SIZE);

  const goToPage = (page: number) => {
    setCurrent(page);
  };

  const prevPage = () => {
    setCurrent((prev) => Math.max(0, prev - 1));
  };

  const nextPage = () => {
    setCurrent((prev) => Math.min(pageCount - 1, prev + 1));
  };

  const currentItems = items.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE);

  const renderCard = (item: PeerNewsItem) => {
    const isUp = item.impact === 'up';
    const arrow = isUp ? <ArrowUpIcon size={14} /> : <ArrowDownIcon size={14} />;
    const colorClass = isUp ? 'text-status-success-base' : 'text-status-danger-base';

    return (
      <div
        key={item.id}
        data-testid="peer-news-card"
        className="rounded-card border border-border-default bg-surface-card p-16"
      >
        {/* Prototype L342-L353: company chip left, impact arrow right, then headline and source. */}
        <div className="mb-8 flex items-start justify-between gap-8">
          <CompanyLogoChip
            slug={item.colorKey}
            name={item.companyName}
            initials={item.initials}
            size="sm"
          />
          <span
            data-testid="peer-news-impact"
            className={`mt-2 flex shrink-0 items-center ${colorClass}`}
            aria-hidden
          >
            {arrow}
          </span>
        </div>
        <p className="mb-8 text-12 leading-snug text-text-body">{item.headline}</p>
        <p className="text-11 text-text-muted">{item.source}</p>
      </div>
    );
  };

  const pager = (
    <>
      <IconButton
        aria-label={t('home.carousel.prev')}
        icon={ArrowUpIcon}
        variant="ghost"
        size="sm"
        onClick={prevPage}
        disabled={current === 0}
        className="-rotate-90"
      />
      <div className="flex items-center gap-4">
        {Array.from({ length: pageCount }).map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => {
              goToPage(index);
            }}
            aria-current={index === current ? 'page' : undefined}
            aria-label={String(index + 1)}
            className={`size-7 rounded-full transition-colors ${
              index === current ? 'bg-brand-primary' : 'bg-border-subtle hover:bg-border-default'
            }`}
          />
        ))}
      </div>
      <IconButton
        aria-label={t('home.carousel.next')}
        icon={ArrowDownIcon}
        variant="ghost"
        size="sm"
        onClick={nextPage}
        disabled={current === pageCount - 1}
        className="-rotate-90"
      />
    </>
  );

  if (pageCount <= 1) {
    return (
      <SectionCard {...section}>
        <div data-testid="peer-news-grid" className={GRID}>
          {currentItems.map(renderCard)}
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard {...section} actions={pager}>
      <div data-testid="peer-news-grid" className={GRID}>
        {currentItems.map(renderCard)}
      </div>
    </SectionCard>
  );
}
