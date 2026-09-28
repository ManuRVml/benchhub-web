import { useState } from 'react';

import {
  useComparisonProfilesView,
  useFutureAspirationView,
  usePeerAverageComparisonView,
  useReportSummaryView,
  useResultsHeaderView,
  useTbgDimensionWeightsView,
  useTbgHorizonSummaryView,
  useTbgIndicatorComparatorView,
} from '@/entities/analysis';
import { ExecutiveNarrativeButton } from '@/features/executive-narrative';
import { isApiError } from '@/shared/api';
import { useT } from '@/shared/i18n';
import { useTypedSearchParams } from '@/shared/lib/url';
import { SectionCard } from '@/shared/ui/composites/section-card';
import { Skeleton } from '@/shared/ui/composites/skeleton';
import { SectionBoundary } from '@/shared/ui/layout/section-boundary';
import { CompanyComparison } from '@/widgets/company-comparison';
import { ComparisonProfilesSummary } from '@/widgets/comparison-profiles';
import { FutureAspiration } from '@/widgets/future-aspiration';
import { PeerAverageComparison } from '@/widgets/peer-average-comparison';
import { ReportSummary } from '@/widgets/report-summary';
import { TbgDimensionWeights } from '@/widgets/tbg-dimension-weights';
import { TbgHorizonSummary } from '@/widgets/tbg-horizon';
import { TbgIndicatorComparator } from '@/widgets/tbg-indicator-comparator';

import { resultsSearchSchema, SEGMENT_PARAMS } from './results-search';

import type { SegmentParam } from './results-search';
import type { TbgDimension } from '@/entities/analysis';
import type { ModuleViewProps } from '@/widgets/analysis-modules';
import type { ReactNode } from 'react';

// SCR-08 module wrappers (P5-RES): each fetches its own view (a `SectionBoundary` per module, brief §4.1 rule 4),
// maps the response onto its presentational widget's props and — where the widget takes `analysisId` — passes it
// through so the ExecutiveNarrativeButton pills wired in P5-43d/P5-43b go live. These live at the PAGE layer, not
// inside `widgets/analysis-modules`: a widget may import only a lower layer, never a sibling widget (FSD boundary,
// `tools/architecture/fsd-rules.js`), and every wrapper here imports a sibling content widget — the same reason
// `AnalysisResultsPage.tsx` overrides `companyCoverage` at the page level instead of inside `ModuleFrame.tsx`.
//
// C-15 `section` mapping (overview | performance | trends | recommendations — none of the module ids literally
// match): peerAverageComparison/tbgIndicatorComparator → `performance` (indicator performance vs. peers/TBG),
// reportSummary → `overview` (whole-report summary), comparisonProfiles → `trends` (scenario-based positioning) —
// all flagged for PO confirmation, per the same reasoning already noted in P5-43d/P5-43b.

function toSectionResult<T>(
  data: T | undefined,
  error: unknown,
):
  | { status: 'ok'; data: T }
  | { status: 'error'; errorCode: string }
  | { status: 'forbidden' }
  | undefined {
  if (data !== undefined) return { status: 'ok', data };
  if (error === null || error === undefined) return undefined;
  if (isApiError(error) && error.code === 'FORBIDDEN') return { status: 'forbidden' };
  return { status: 'error', errorCode: isApiError(error) ? error.code : 'UNKNOWN' };
}

function ModuleSkeleton() {
  return <Skeleton shape="block" size={220} />;
}

/** Wraps a module body so it always carries `data-module` / `data-order` (matches `ModuleFrame`'s placeholder, so
 * the page order assertions keep working once a module graduates from placeholder to real). */
function ModuleShell({
  module,
  children,
}: {
  module: ModuleViewProps['module'];
  children: ReactNode;
}) {
  return (
    <div
      data-module={module.id}
      data-order={module.order}
      data-testid={`analysis-module-${module.id}`}
    >
      {children}
    </div>
  );
}

/** Module 3 — "Comparativo GE vs. Promedio Pares" (V-11). Category is URL state (`?categoria=`, shared with any
 * future module 10 filter reusing the same param). */
export function PeerAverageComparisonModule({ analysisId, module }: ModuleViewProps) {
  const [search, setSearch] = useTypedSearchParams(resultsSearchSchema);
  const query = usePeerAverageComparisonView(analysisId);
  return (
    <ModuleShell module={module}>
      <SectionBoundary
        scope="peer-average-comparison"
        result={toSectionResult(query.data, query.error)}
        isLoading={query.isFetching && query.data === undefined}
        onRetry={() => {
          void query.refetch();
        }}
        skeleton={<ModuleSkeleton />}
      >
        {(data) => (
          <PeerAverageComparison
            categories={data.categories}
            rows={data.rows}
            category={search.categoria ?? data.category}
            onCategoryChange={(id) => {
              setSearch({ categoria: id });
            }}
            analysisId={analysisId}
          />
        )}
      </SectionBoundary>
    </ModuleShell>
  );
}

/** Module 4 — "Comparativo GE vs. compañía" (V-12, P5-42b/c widget). The widget owns its own SectionCard, pill and
 * SectionBoundary; this wrapper only supplies the company tab list (V-09 `companySet` — V-12 itself only returns the
 * selected company) and lifts the selected tab into the URL (`?empresa=`) per this task's URL-state list. */
export function CompanyComparisonModule({ analysisId, horizon, module }: ModuleViewProps) {
  const [search, setSearch] = useTypedSearchParams(resultsSearchSchema);
  const header = useResultsHeaderView(analysisId, horizon);
  const companies = header.data?.companySet ?? [];
  const selectedId =
    search.empresa !== undefined && companies.some((company) => company.id === search.empresa)
      ? search.empresa
      : (companies[0]?.id ?? '');
  return (
    <ModuleShell module={module}>
      <CompanyComparison
        analysisId={analysisId}
        companies={companies}
        horizon={horizon}
        selectedId={selectedId}
        onSelectedChange={(id) => {
          setSearch({ empresa: id });
        }}
      />
    </ModuleShell>
  );
}

/** Module 10 — "Resumen del informe" (V-13). No selector state of its own. */
export function ReportSummaryModule({ analysisId, module }: ModuleViewProps) {
  const query = useReportSummaryView(analysisId);
  return (
    <ModuleShell module={module}>
      <SectionBoundary
        scope="report-summary"
        result={toSectionResult(query.data, query.error)}
        isLoading={query.isFetching && query.data === undefined}
        onRetry={() => {
          void query.refetch();
        }}
        skeleton={<ModuleSkeleton />}
      >
        {(data) => (
          <ReportSummary
            rows={data.rows.map((row) => ({
              rowId: row.indicatorId,
              category: row.category.label,
              // V-13's tier is a runtime-validated 1..4 int (zod .max(4)); ReportSummaryRow wants the literal union.
              tier: row.category.tier as 1 | 2 | 3 | 4,
              kpi: row.label,
              unit: row.unit,
              geValue: row.geValue,
              peerAvg: row.peerAvg,
            }))}
            onValueChange={() => {
              // C-06 value overrides are out of this task's scope (module 2 owns editing via PendingOverrides).
            }}
            onExport={() => {
              // C-14 export wiring is a separate task; the button stays present but currently a no-op.
            }}
            exporting={false}
            analysisId={analysisId}
          />
        )}
      </SectionBoundary>
    </ModuleShell>
  );
}

// V-15's `scopeOptions[].labelKey` is a BFF-side key (e.g. "comparator.scope.all"), not one of ours; the enum has
// only `all` at contract 0.1.0, so it maps to the front's own existing label instead of being translated verbatim.
const TBG_SCOPE_LABEL_KEY = {
  all: 'analysis-results.tbgIndicatorComparator.controls.companyScope',
} as const;

/** Module 5 — "Comparador de Indicadores TBG" (V-15). Indicator/scope are local state — the task's URL-state list
 * names only tabs/dimension/segment. */
export function TbgIndicatorComparatorModule({ analysisId, module }: ModuleViewProps) {
  const t = useT();
  const [indicatorId, setIndicatorId] = useState('');
  const [companyScope, setCompanyScope] = useState('');
  const query = useTbgIndicatorComparatorView(analysisId, indicatorId, companyScope || 'all');
  const data = query.data;
  // Once the first response names the available options, default the selects to its own current selection.
  const effectiveIndicatorId = indicatorId || (data?.indicator.id ?? '');
  const effectiveScope = companyScope || 'all';

  return (
    <ModuleShell module={module}>
      <SectionBoundary
        scope="tbg-indicator-comparator"
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
            selectedIndicator={effectiveIndicatorId || view.indicator.id}
            selectedScope={effectiveScope}
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
    </ModuleShell>
  );
}

// V-16's `segments[].labelKey` is a BFF-side key (e.g. "aspiration.segment.crude"), not one of ours, and its
// `colorKey` (e.g. "aspiration.crude") doesn't match the widget's own CSS class map (keyed by segment id) — both
// map through the front's own keys instead. V-16 never lists a "total" chip (it's the aggregate filter value), so
// it's prepended here from the front's own i18n key.
const FUTURE_ASPIRATION_SEGMENT_LABEL_KEY = {
  crude: 'analysis-results.futureAspiration.segmentChips.conventionalCrude',
  gas: 'analysis-results.futureAspiration.segmentChips.naturalGas',
  unconventional: 'analysis-results.futureAspiration.segmentChips.unconventionalOffshore',
  lowEmissions: 'analysis-results.futureAspiration.segmentChips.lowEmissions',
} as const;

/** Module 6 — "Aspiración futura 2040+" (V-16). Segment is URL state (`?segmento=`). */
export function FutureAspirationModule({ analysisId, module }: ModuleViewProps) {
  const t = useT();
  const [search, setSearch] = useTypedSearchParams(resultsSearchSchema);
  const query = useFutureAspirationView(analysisId, search.segmento);
  return (
    <ModuleShell module={module}>
      <SectionBoundary
        scope="future-aspiration"
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
              ...data.segments.map((segment) => ({
                id: segment.id,
                label: t(FUTURE_ASPIRATION_SEGMENT_LABEL_KEY[segment.id]),
                colorKey: segment.id,
              })),
            ]}
            rows={data.rows}
            selectedSegment={search.segmento}
            onSegmentChange={(id) => {
              if ((SEGMENT_PARAMS as readonly string[]).includes(id)) {
                setSearch({ segmento: id as SegmentParam });
              }
            }}
          />
        )}
      </SectionBoundary>
    </ModuleShell>
  );
}

/** Module 7 — "Horizonte TBG" ("Resumen general" slice, V-17). */
export function TbgHorizonModule({ analysisId, horizon, module }: ModuleViewProps) {
  const query = useTbgHorizonSummaryView(analysisId, horizon);
  return (
    <ModuleShell module={module}>
      <SectionBoundary
        scope="tbg-horizon"
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
              // V-17's `finOpPct` is nullable; the widget's own prop is a plain optional.
              ...(finOpPct === null ? {} : { finOpPct }),
            }))}
          />
        )}
      </SectionBoundary>
    </ModuleShell>
  );
}

/** Module 8 — "Peso en TBG por dimensión · GE vs. pares" (V-18). Dimension is URL state (`?dimension=`). */
export function TbgDimensionWeightsModule({ analysisId, horizon, module }: ModuleViewProps) {
  const [search, setSearch] = useTypedSearchParams(resultsSearchSchema);
  const query = useTbgDimensionWeightsView(analysisId, horizon, search.dimension);
  return (
    <ModuleShell module={module}>
      <SectionBoundary
        scope="tbg-dimension-weights"
        result={toSectionResult(query.data, query.error)}
        isLoading={query.isFetching && query.data === undefined}
        onRetry={() => {
          void query.refetch();
        }}
        skeleton={<ModuleSkeleton />}
      >
        {(data) => (
          <TbgDimensionWeights
            dimension={search.dimension}
            onDimensionChange={(dimension: TbgDimension) => {
              setSearch({ dimension });
            }}
            ecopetrolPct={data.ecopetrolPct}
            peerAvgPct={data.peerAvgPct}
            diffPts={data.diffPts}
            detail={data.detail}
          />
        )}
      </SectionBoundary>
    </ModuleShell>
  );
}

/**
 * Module 9 — "Perfiles de comparación" (V-19; "Ecopetrol en cada perfil" slice — the profile editor, business-type
 * chips, weight sliders and `profiles`/`config` are out of this task's scope). The widget itself has no card or
 * header (its own doc: "the AI pill ... are out of scope, a later task composes them around this widget") — this
 * IS that later task, so the card, title and OVL-08 pill are composed here.
 */
export function ComparisonProfilesModule({ analysisId, module }: ModuleViewProps) {
  const t = useT();
  const [profileId, setProfileId] = useState<string | undefined>(undefined);
  const query = useComparisonProfilesView(analysisId, profileId);
  return (
    <ModuleShell module={module}>
      <SectionCard
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
        testId="comparison-profiles-card"
      >
        <SectionBoundary
          scope="comparison-profiles"
          result={toSectionResult(query.data, query.error)}
          isLoading={query.isFetching && query.data === undefined}
          onRetry={() => {
            void query.refetch();
          }}
          skeleton={<ModuleSkeleton />}
        >
          {(data) => (
            <ComparisonProfilesSummary
              // V-19's `result.insight` is `{text, status}`; the widget's own prop is just the text.
              result={{ ...data.result, insight: data.result.insight.text }}
              summaryTable={data.summaryTable}
              onSelectProfile={setProfileId}
            />
          )}
        </SectionBoundary>
      </SectionCard>
    </ModuleShell>
  );
}
