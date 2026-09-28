import { useT } from '@/shared/i18n';
import { dataStateAttrs } from '@/shared/lib/data-state';

import { sectionBoundaryTestIds } from './test-ids';

import type { SectionResult } from '@/shared/api/section-result';
import type { ReactNode } from 'react';

export interface SectionBoundaryProps<T> {
  /** Owner of the section for test ids, `{page|widget}` in kebab-case (e.g. `home-peer-news`). */
  scope: string;
  /** The section's SectionResult; `undefined` while it loads. */
  result: SectionResult<T> | undefined;
  /** Forces the loading state (e.g. a refetch after retry). */
  isLoading?: boolean;
  /** Decides whether ok data is empty; empty data renders the empty slot instead of children. */
  isEmpty?: (data: T) => boolean;
  /** Retry for the error state; without it the error panel shows no button. */
  onRetry?: () => void;
  /** Skeleton slot shown while loading (default: a neutral block). */
  skeleton?: ReactNode;
  /** Empty slot (default: the common "no data" line). */
  empty?: ReactNode;
  children: (data: T) => ReactNode;
}

/**
 * Renders one independently loaded section (brief §4.1 rule 4): skeleton while loading, children on ok, an empty slot
 * for empty data, an error panel with retry on error and a forbidden panel that never renders the children. Every
 * state root carries `data-state` and `data-testid` (brief §5.6).
 */
export function SectionBoundary<T>({
  scope,
  result,
  isLoading = false,
  isEmpty,
  onRetry,
  skeleton,
  empty,
  children,
}: SectionBoundaryProps<T>) {
  const t = useT();

  if (isLoading || result === undefined) {
    return (
      <div
        {...dataStateAttrs('loading')}
        data-testid={sectionBoundaryTestIds.root(scope, 'loading')}
        aria-busy="true"
      >
        {skeleton ?? (
          <div className="h-24 animate-pulse rounded-card bg-surface-page motion-reduce:animate-none" />
        )}
        <span className="sr-only">{t('common.section.loading')}</span>
      </div>
    );
  }

  if (result.status === 'error') {
    return (
      <SectionErrorPanel
        testId={sectionBoundaryTestIds.root(scope, 'error')}
        retryTestId={sectionBoundaryTestIds.retry(scope)}
        errorCode={result.errorCode}
        title={t('common.section.error.title')}
        retryLabel={t('common.section.error.retry')}
        {...(onRetry ? { onRetry } : {})}
      />
    );
  }

  if (result.status === 'forbidden') {
    return (
      <div
        {...dataStateAttrs('forbidden')}
        data-testid={sectionBoundaryTestIds.root(scope, 'forbidden')}
        role="status"
        className="rounded-card bg-surface-page p-16 text-text-muted"
      >
        {t('common.section.forbidden.title')}
      </div>
    );
  }

  if (isEmpty?.(result.data)) {
    return (
      <div {...dataStateAttrs('empty')} data-testid={sectionBoundaryTestIds.root(scope, 'empty')}>
        {empty ?? <p className="p-16 text-text-muted">{t('common.section.empty')}</p>}
      </div>
    );
  }

  return (
    <div {...dataStateAttrs('ready')} data-testid={sectionBoundaryTestIds.root(scope, 'ready')}>
      {children(result.data)}
    </div>
  );
}

export interface SectionErrorPanelProps {
  testId: string;
  retryTestId: string;
  errorCode: string;
  title: string;
  retryLabel: string;
  onRetry?: () => void;
}

/** Error state of a section. Presentational (no hooks): copy arrives already translated. */
export function SectionErrorPanel({
  testId,
  retryTestId,
  errorCode,
  title,
  retryLabel,
  onRetry,
}: SectionErrorPanelProps) {
  return (
    <div
      {...dataStateAttrs('error')}
      data-testid={testId}
      data-error-code={errorCode}
      role="alert"
      className="flex items-center justify-between gap-12 rounded-card bg-status-danger-bg p-16 text-status-danger-text"
    >
      <p>{title}</p>
      {onRetry ? (
        <button
          type="button"
          data-testid={retryTestId}
          onClick={onRetry}
          className="rounded-control border border-border-default bg-surface-card px-12 py-6 text-text-body"
        >
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}
