import { useState } from 'react';

import {
  useComparisonProfilesView,
  useFutureAspirationView,
  useTbgDimensionWeightsView,
  useTbgHorizonSummaryView,
  useTbgIndicatorComparatorView,
} from '@/entities/analysis';
import { ExecutiveNarrativeButton } from '@/features/executive-narrative';
import { isApiError } from '@/shared/api';
import { useT } from '@/shared/i18n';
import { SectionCard } from '@/shared/ui/composites/section-card';
import { Skeleton } from '@/shared/ui/composites/skeleton';
import { SectionBoundary } from '@/shared/ui/layout/section-boundary';
import { ComparisonProfilesSummary } from '@/widgets/comparison-profiles';
import { FutureAspiration } from '@/widgets/future-aspiration';
import { TbgDimensionWeights } from '@/widgets/tbg-dimension-weights';
import { TbgHorizonSummary } from '@/widgets/tbg-horizon';
import { TbgIndicatorComparator } from '@/widgets/tbg-indicator-comparator';

import type { TbgDimension } from '@/entities/analysis';

function toSectionResult<T>(data: T | undefined, error: unknown) {
  if (data !== undefined) return { status: 'ok' as const, data };
  if (error === null || error === undefined) return undefined;
  if (isApiError(error) && error.code === 'FORBIDDEN') return { status: 'forbidden' as const };
  return { status: 'error' as const, errorCode: isApiError(error) ? error.code : 'UNKNOWN' };
}

function ModuleSkeleton() {
  return <Skeleton shape="block" size={220} />;
}

const TBG_SCOPE_LABEL_KEY = {
  all: 'analysis-results.tbgIndicatorComparator.controls.companyScope',
} as const;

const FUTURE_ASPIRATION_SEGMENT_LABEL_KEY = {
  crude: 'analysis-results.futureAspiration.segmentChips.conventionalCrude',
  gas: 'analysis-results.futureAspiration.segmentChips.naturalGas',
  unconventional: 'analysis-results.futureAspiration.segmentChips.unconventionalOffshore',
  lowEmissions: 'analysis-results.futureAspiration.segmentChips.lowEmissions',
} as const;

/** The five TBG/ILP modules follow the visualization dashboard, as in the prototype's Visualización view. */
export function VisualizationTbgModules({ analysisId }: { analysisId: string }) {
  return (
    <>
      <TbgIndicatorComparatorModule analysisId={analysisId} />
      <FutureAspirationModule analysisId={analysisId} />
      <TbgHorizonModule analysisId={analysisId} />
      <TbgDimensionWeightsModule analysisId={analysisId} />
      <ComparisonProfilesModule analysisId={analysisId} />
    </>
  );
}

function TbgIndicatorComparatorModule({ analysisId }: { analysisId: string }) {
  const t = useT();
  const [indicatorId, setIndicatorId] = useState('');
  const [companyScope, setCompanyScope] = useState('');
  const query = useTbgIndicatorComparatorView(analysisId, indicatorId, companyScope || 'all');
  const data = query.data;
  return (
    <SectionBoundary
      scope="visualization-tbg-indicator-comparator"
      result={toSectionResult(query.data, query.error)}
      isLoading={query.isFetching && query.data === undefined}
      onRetry={() => {
        void query.refetch();
      }}
      skeleton={<ModuleSkeleton />}
    >
      {(view) => (
        <TbgIndicatorComparator
          indicators={view.indicatorOptions}
          scopes={view.scopeOptions.map((scope) => ({
            id: scope.id,
            label: t(TBG_SCOPE_LABEL_KEY[scope.id]),
          }))}
          selectedIndicator={
            indicatorId === '' ? (data?.indicator.id ?? view.indicator.id) : indicatorId
          }
          selectedScope={companyScope || 'all'}
          onIndicatorChange={setIndicatorId}
          onScopeChange={setCompanyScope}
          tiles={view.tiles}
          ranking={view.ranking}
          membership={view.membership}
          gapToLeader={view.gapToLeaderPts}
          unit={view.indicator.unit}
          analysisId={analysisId}
        />
      )}
    </SectionBoundary>
  );
}

function FutureAspirationModule({ analysisId }: { analysisId: string }) {
  const t = useT();
  const [segment, setSegment] = useState('total');
  const query = useFutureAspirationView(analysisId, segment);
  return (
    <SectionBoundary
      scope="visualization-future-aspiration"
      result={toSectionResult(query.data, query.error)}
      isLoading={query.isFetching && query.data === undefined}
      onRetry={() => {
        void query.refetch();
      }}
      skeleton={<ModuleSkeleton />}
    >
      {(data) => (
        <FutureAspiration
          tiles={data.tiles}
          segments={[
            {
              id: 'total' as const,
              label: t('analysis-results.futureAspiration.segmentChips.total'),
            },
            ...data.segments.map((item) => ({
              id: item.id,
              label: t(FUTURE_ASPIRATION_SEGMENT_LABEL_KEY[item.id]),
              colorKey: item.id,
            })),
          ]}
          rows={data.rows}
          selectedSegment={segment}
          onSegmentChange={setSegment}
        />
      )}
    </SectionBoundary>
  );
}

function TbgHorizonModule({ analysisId }: { analysisId: string }) {
  const query = useTbgHorizonSummaryView(analysisId, 'tbg');
  return (
    <SectionBoundary
      scope="visualization-tbg-horizon"
      result={toSectionResult(query.data, query.error)}
      isLoading={query.isFetching && query.data === undefined}
      onRetry={() => {
        void query.refetch();
      }}
      skeleton={<ModuleSkeleton />}
    >
      {(data) => (
        <TbgHorizonSummary
          kpis={data.kpis}
          composition={data.composition.map(({ finOpPct, ...row }) => ({
            ...row,
            ...(finOpPct === null ? {} : { finOpPct }),
          }))}
        />
      )}
    </SectionBoundary>
  );
}

function TbgDimensionWeightsModule({ analysisId }: { analysisId: string }) {
  const [dimension, setDimension] = useState<TbgDimension>('fin');
  const query = useTbgDimensionWeightsView(analysisId, 'tbg', dimension);
  return (
    <SectionBoundary
      scope="visualization-tbg-dimension-weights"
      result={toSectionResult(query.data, query.error)}
      isLoading={query.isFetching && query.data === undefined}
      onRetry={() => {
        void query.refetch();
      }}
      skeleton={<ModuleSkeleton />}
    >
      {(data) => (
        <TbgDimensionWeights
          dimension={dimension}
          onDimensionChange={setDimension}
          ecopetrolPct={data.ecopetrolPct}
          peerAvgPct={data.peerAvgPct}
          diffPts={data.diffPts}
          detail={data.detail}
        />
      )}
    </SectionBoundary>
  );
}

function ComparisonProfilesModule({ analysisId }: { analysisId: string }) {
  const t = useT();
  const [profileId, setProfileId] = useState<string | undefined>(undefined);
  const query = useComparisonProfilesView(analysisId, profileId);
  return (
    <SectionCard
      padding="prototype"
      title={t('analysis-results.comparisonProfiles.title')}
      subtitle={t('analysis-results.comparisonProfiles.subtitle')}
      actions={
        <ExecutiveNarrativeButton
          analysisId={analysisId}
          section="trends"
          title={t('analysis-results.comparisonProfiles.title')}
          testId="comparison-profiles-ai-pill"
        />
      }
      testId="visualization-comparison-profiles-card"
    >
      <SectionBoundary
        scope="visualization-comparison-profiles"
        result={toSectionResult(query.data, query.error)}
        isLoading={query.isFetching && query.data === undefined}
        onRetry={() => {
          void query.refetch();
        }}
        skeleton={<ModuleSkeleton />}
      >
        {(data) => (
          <ComparisonProfilesSummary
            result={{ ...data.result, insight: data.result.insight.text }}
            summaryTable={data.summaryTable}
            onSelectProfile={setProfileId}
          />
        )}
      </SectionBoundary>
    </SectionCard>
  );
}
