import { Link } from 'react-router';

import { routes } from '@/shared/config';
import { useT } from '@/shared/i18n';
import { formatRelativeTime } from '@/shared/lib/format';
import { SectionCard } from '@/shared/ui/composites/section-card';
import { Badge } from '@/shared/ui/primitives/badge';

import type { V03Response } from '@/shared/api';
import type { ReactElement } from 'react';

export type EnabledAnalysis = Extract<
  V03Response['enabledAnalyses'],
  { status: 'ok' }
>['data'][number];

export interface EnabledAnalysesGridProps {
  items: readonly EnabledAnalysis[];
}

export function EnabledAnalysesGrid({ items }: EnabledAnalysesGridProps): ReactElement | null {
  const t = useT();

  const statusLabels: Record<EnabledAnalysis['status'], string> = {
    draft: t('home.status.draft'),
    in_progress: t('home.status.inProgress'),
    in_review: t('home.status.inReview'),
    published: t('home.status.published'),
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <SectionCard
      title={t('home.sectionTitles.enabledAnalyses')}
      info={t('home.sectionInfo.enabledAnalyses')}
      titleVariant="eyebrow"
      surface="none"
      headingLevel={2}
      actions={
        <Link to={routes.analyses.build()} className="text-12 font-medium text-brand-primary">
          {t('home.enabledAnalyses.verTodos')}
        </Link>
      }
      testId="enabled-analyses"
    >
      {/* Prototype L283: auto-fill minmax(280px, 1fr) → 1 / 2 / 3 columns across the project breakpoints. */}
      <div
        data-testid="enabled-analyses-grid"
        className="grid grid-cols-1 gap-16 tablet:grid-cols-2 desktop:grid-cols-3"
      >
        {items.map((item) => {
          return (
            <Link
              key={item.id}
              to={item.targetRoute}
              className="rounded-card border border-border-default bg-surface-card p-20 transition-colors hover:border-brand-primary"
            >
              <span className="mb-10 flex items-start justify-between gap-8">
                <span className="text-15 font-semibold text-text-heading">{item.title}</span>
                <Badge kind="status" status={item.status} className="shrink-0">
                  {statusLabels[item.status]}
                </Badge>
              </span>
              {item.description && (
                <span className="mb-14 block text-13 text-text-secondary">{item.description}</span>
              )}
              <span className="block text-12 text-text-muted">
                {t('home.meta.updated', {
                  updated: formatRelativeTime(item.updatedAt),
                  owner: item.ownerName,
                })}
              </span>
            </Link>
          );
        })}
      </div>
    </SectionCard>
  );
}
