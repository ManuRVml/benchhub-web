import { lazy, Suspense } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';

import { useIndicatorDetailView } from '@/entities/indicator';
import { useSession } from '@/entities/session';
import { routes } from '@/shared/config';
import { useT } from '@/shared/i18n';
import { formatDelta } from '@/shared/lib/format';
import { KpiStatCard } from '@/shared/ui/composites/kpi-stat-card';
import { SectionCard } from '@/shared/ui/composites/section-card';
import { SectionBoundary, SectionErrorPanel } from '@/shared/ui/layout/section-boundary';

import { displayUnitOf } from './model/indicator-units';
import { IndicatorComments } from './ui/IndicatorComments';
import { IndicatorTraceability } from './ui/IndicatorTraceability';

import type { IndicatorOrigin } from '@/entities/indicator';

// The chart pulls in ECharts: its own chunk, loaded when the series section has data.
const IndicatorSeriesChart = lazy(async () => ({
  default: (await import('./ui/IndicatorSeriesChart')).IndicatorSeriesChart,
}));

const ORIGINS: readonly IndicatorOrigin[] = ['resultados', 'visualizacion', 'presentacion'];
const parseOrigin = (value: string | null): IndicatorOrigin | null =>
  ORIGINS.find((origin) => origin === value) ?? null;

export interface IndicatorDetailPageProps {
  /** Reference time of relative dates (tests pin it). */
  now?: number;
}

/**
 * SCR-10 Detalle de indicador (V-24 + V-26). The indicator and its permissions are the primary datum (a V-24 failure is
 * a full-page error with retry); KPIs, chart, insight and traceability are independent sections (each fails alone with
 * its own retry), and the comments load separately (V-26). "Solicitar ajuste" is offered only to executive_integral
 * with `canRequestChange` (SCR-10 Role visibility, M-05).
 */
export function IndicatorDetailPage({ now }: IndicatorDetailPageProps) {
  const t = useT();
  const { analysisId = '', indicatorId = '' } = useParams();
  const [search] = useSearchParams();
  const session = useSession();
  const detail = useIndicatorDetailView(analysisId, indicatorId, parseOrigin(search.get('origen')));
  const retry = () => {
    void detail.refetch();
  };

  const backLink = (
    <Link
      to={routes.analysisResults.build({ analysisId })}
      className="text-13 font-medium text-brand-primary hover:underline"
    >
      {t('indicator-detail.backLink')}
    </Link>
  );

  if (detail.isError) {
    return (
      <section
        data-testid="indicator-detail-page"
        className="flex max-w-(--size-layout-max-width-detalle) flex-col gap-14"
      >
        {backLink}
        <SectionErrorPanel
          testId="indicator-detail-error"
          retryTestId="indicator-detail-retry"
          errorCode={detail.error.code}
          title={t('common.section.error.title')}
          retryLabel={t('common.section.error.retry')}
          onRetry={retry}
        />
      </section>
    );
  }

  const view = detail.data;
  const refetching = detail.isFetching;
  const canRequestChange =
    view?.permissions.canRequestChange === true && session?.role === 'executive_integral';

  return (
    <section
      data-testid="indicator-detail-page"
      aria-busy={view ? undefined : true}
      className="flex max-w-(--size-layout-max-width-detalle) flex-col gap-20"
    >
      {backLink}
      <header className="flex flex-col gap-6">
        <h2 className="text-title-detail text-text-heading">
          {view ? view.indicator.label : t('indicator-detail.pageTitle')}
          {view ? (
            <span className="font-normal text-text-secondary">
              {' | '}
              {view.indicator.contextKey === 'above_peers'
                ? t('indicator-detail.title.aboveContext')
                : t('indicator-detail.title.belowContext')}
            </span>
          ) : null}
        </h2>
        {view?.series.status === 'ok' ? (
          <p className="flex flex-wrap items-center gap-10 text-13 text-text-secondary">
            {t('indicator-detail.title.subtitle', {
              previous: view.series.data.periods.previous.label,
              current: view.series.data.periods.current.label,
            })}
            {view.kpis.status === 'ok' ? (
              <span
                className={
                  view.kpis.data.deltaVsPeersPct >= 0
                    ? 'text-12 font-semibold text-status-success-text'
                    : 'text-12 font-semibold text-status-danger-text'
                }
              >
                {t('indicator-detail.title.deltaVsPeers', {
                  value: formatDelta(view.kpis.data.deltaVsPeersPct, { unit: '%' }),
                })}
              </span>
            ) : null}
          </p>
        ) : null}
      </header>

      <SectionBoundary
        scope="indicator-detail-kpis"
        result={view?.kpis}
        isLoading={refetching}
        onRetry={retry}
      >
        {(kpis) => (
          <div className="grid grid-cols-1 gap-14 laptop:grid-cols-3">
            <KpiStatCard
              label={t('indicator-detail.sections.kpi.ecopetrol')}
              value={kpis.ecopetrol}
              unit={displayUnitOf(view?.indicator.unit ?? 'percent')}
              tone="brand"
              testId="indicator-detail-kpi-ecopetrol"
            />
            <KpiStatCard
              label={t('indicator-detail.sections.kpi.peerAverageGeneral')}
              value={kpis.peerAvg}
              unit={displayUnitOf(view?.indicator.unit ?? 'percent')}
              testId="indicator-detail-kpi-peer-average"
            />
            <KpiStatCard
              label={t('indicator-detail.sections.kpi.geVsPeerAverage')}
              value={kpis.geVsAvgPct}
              unit="percent"
              tone={kpis.geVsAvgPct >= 0 ? 'success' : 'danger'}
              testId="indicator-detail-kpi-ge-vs-average"
            />
          </div>
        )}
      </SectionBoundary>

      <SectionCard
        title={view?.indicator.label ?? t('indicator-detail.pageTitle')}
        info={t('indicator-detail.sections.chart.infoText')}
        testId="indicator-detail-chart-card"
      >
        <SectionBoundary
          scope="indicator-detail-series"
          result={view?.series}
          isLoading={refetching}
          onRetry={retry}
        >
          {(series) => (
            <Suspense
              fallback={
                <div className="h-72 animate-pulse rounded-card bg-surface-page motion-reduce:animate-none" />
              }
            >
              <IndicatorSeriesChart
                data={series}
                unit={view?.indicator.unit ?? 'percent'}
                indicatorLabel={view?.indicator.label ?? ''}
              />
            </Suspense>
          )}
        </SectionBoundary>
      </SectionCard>

      <SectionBoundary
        scope="indicator-detail-insight"
        result={view?.insight}
        isLoading={refetching}
        onRetry={retry}
      >
        {(insight) => (
          <aside
            aria-label={t('indicator-detail.sections.insight.label')}
            className="flex flex-col gap-8 rounded-card border border-ai-border bg-ai-bg p-18"
          >
            <p className="flex items-center gap-8 text-eyebrow text-ai-text">
              {t('indicator-detail.sections.insight.label')}
              <span className="rounded-pill border border-ai-border px-6 text-micro">
                {t('indicator-detail.sections.insight.suggestion')}
              </span>
            </p>
            <p className="text-13 text-text-body">{insight.text}</p>
          </aside>
        )}
      </SectionBoundary>

      <SectionCard
        title={t('indicator-detail.sections.traceability.title')}
        testId="indicator-detail-traceability-card"
      >
        <SectionBoundary
          scope="indicator-detail-traceability"
          result={view?.traceability}
          isLoading={refetching}
          onRetry={retry}
        >
          {(traceability) => (
            <IndicatorTraceability data={traceability} {...(now === undefined ? {} : { now })} />
          )}
        </SectionBoundary>
      </SectionCard>

      <SectionCard
        title={t('indicator-detail.sections.comments.title')}
        testId="indicator-detail-comments-card"
      >
        {view ? (
          <IndicatorComments
            entityId={`${analysisId}/${indicatorId}`}
            canComment={view.permissions.canComment !== false}
            canRequestChange={canRequestChange}
          />
        ) : null}
      </SectionCard>
    </section>
  );
}
