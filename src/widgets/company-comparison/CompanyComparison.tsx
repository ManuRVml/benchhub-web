import { useState } from 'react';
import { Link } from 'react-router';

import { useCompanyComparisonDetailView } from '@/entities/analysis';
import { ExecutiveNarrativeButton } from '@/features/executive-narrative';
import { isApiError } from '@/shared/api';
import { routes } from '@/shared/config';
import { useT } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { companyColorClasses } from '@/shared/lib/company-color';
import { EMPTY, formatDelta, formatPercent } from '@/shared/lib/format';
import { ChartLegend } from '@/shared/ui/charts/legend';
import { maxAbs, PairedBarRow, ProgressBar } from '@/shared/ui/charts/primitives';
import { Accordion } from '@/shared/ui/composites/accordion';
import { SectionCard } from '@/shared/ui/composites/section-card';
import { Skeleton } from '@/shared/ui/composites/skeleton';
import { SegmentedTabs } from '@/shared/ui/composites/tabs';
import { SectionBoundary } from '@/shared/ui/layout/section-boundary';

import { companyComparisonTestIds } from './test-ids';

import type {
  CompanyComparisonRow as CompanyComparisonRowData,
  CompanyComparisonUnit,
  CompanyComparisonView,
} from '@/entities/analysis';
import type { ResultsHorizon } from '@/shared/api';
import type { SectionResult } from '@/shared/api/section-result';

/** Test-id scope of this widget (`company-comparison-section-{state}`, `SectionBoundary`). */
export const COMPANY_COMPARISON_SCOPE = 'company-comparison';

export interface CompanyComparisonCompanyOption {
  id: string;
  name: string;
  colorKey: string;
}

export interface CompanyComparisonProps {
  analysisId: string;
  /**
   * Tab options (e.g. V-10 `companies.data.items`): id/name/colorKey only. V-12 itself only returns the currently
   * selected company, so the full company set for the tabs comes from the caller.
   */
  companies: readonly CompanyComparisonCompanyOption[];
  horizon?: ResultsHorizon;
  /** Controlled tab selection (P5-RES2: the page persists it in the URL); uncontrolled (first company) when omitted. */
  selectedId?: string;
  onSelectedChange?: (id: string) => void;
}

/** Diff unit suffix (spec L957: " pts" for %, "x" for ratio, "USD/B" for usd_b, …), all 13 V-12 unit values. */
const DIFF_UNIT_SUFFIX: Record<CompanyComparisonUnit, string> = {
  percent: 'pts',
  points: 'pts',
  ratio_x: 'x',
  rating: 'pts',
  kboe: 'KBOE',
  usd_b: 'USD/B',
  usd_bn: 'USD BN',
  cop_per_usd: 'COP/USD',
  bcop: 'BCOP',
  mmcop: 'MMCOP',
  cop: 'COP',
  musd: 'MUSD',
  cop_per_kwh: '$/kWh',
};

function formatDiff(diff: number | null, unit: CompanyComparisonUnit): string {
  if (diff === null) return EMPTY;
  return formatDelta(diff, { unit: DIFF_UNIT_SUFFIX[unit] });
}

const OUTCOME_CLASS = {
  above: 'bg-status-success-bg text-status-success-text',
  below: 'bg-status-danger-bg text-status-danger-text',
} as const;

function toSectionResult(
  data: CompanyComparisonView | undefined,
  error: unknown,
): SectionResult<CompanyComparisonView> | undefined {
  if (data !== undefined) return { status: 'ok', data };
  if (error === null || error === undefined) return undefined;
  if (isApiError(error) && error.code === 'FORBIDDEN') return { status: 'forbidden' };
  return { status: 'error', errorCode: isApiError(error) ? error.code : 'UNKNOWN' };
}

interface RowProps {
  row: CompanyComparisonRowData;
  analysisId: string;
  companyName: string;
  companyFillClassName: string;
}

function ComparisonRow({ row, analysisId, companyName, companyFillClassName }: RowProps) {
  const t = useT();
  const max = maxAbs([row.geValue, row.companyValue]);
  return (
    <div
      data-testid={companyComparisonTestIds.row(row.indicatorId)}
      className="grid gap-8 border-t border-surface-page py-12 first:border-t-0"
    >
      <div className="flex items-center justify-between gap-8">
        <div className="flex items-center gap-8">
          <span className="text-body-strong text-text-heading">{row.label}</span>
          <span className="font-mono text-micro text-text-muted uppercase">{row.code}</span>
          {row.lowerIsBetter ? (
            <span className="text-micro text-text-muted">
              {t('analysis-results.companyComparison.polarity.lowerIsBetter')}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-8">
          <span className="font-mono text-body-strong text-text-heading">
            {formatDiff(row.diff, row.diffUnit)}
          </span>
          {row.outcome === null ? null : (
            <span
              className={cn('rounded-pill px-8 py-2 text-micro-strong', OUTCOME_CLASS[row.outcome])}
            >
              {t(`analysis-results.companyComparison.outcome.${row.outcome}`)}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-16">
        <div className="flex-1">
          <PairedBarRow
            label={row.label}
            primary={{
              label: t('analysis-results.peerAverageComparison.ge'),
              value: row.geValue,
              tone: 'highlight',
            }}
            secondary={{
              label: companyName,
              value: row.companyValue,
              fillClassName: companyFillClassName,
            }}
            max={max}
            testIds={{ scope: 'company-comparison', component: `row-${row.indicatorId}` }}
          />
        </div>
        {row.hasDetail ? (
          <Link
            to={routes.indicatorDetail.build({ analysisId, indicatorId: row.indicatorId })}
            className="shrink-0 text-small-medium text-brand-primary"
            data-testid={companyComparisonTestIds.verMas(row.indicatorId)}
          >
            {t('analysis-results.peerAverageComparison.verMas')}
          </Link>
        ) : null}
      </div>
    </div>
  );
}

/**
 * SCR-08 module 4 "Comparativo GE vs. compañía · detalle por indicador" (P5-42b/c, V-12): company tabs (colour dot),
 * a win-ratio summary box, per-category accordions (all open by default) of `PairedBarRow`s (GE vs. the selected
 * company), the `ChartLegend` "Grupo Ecopetrol" + company legend (its `swatchClassName`, added in P5-42c, overrides
 * the tone for the per-company colour, which isn't in the shared `BarTone` set), and the `ExecutiveNarrativeButton`
 * (OVL-08, C-15 `section="performance"` — the same bucket `PeerAverageComparison` and `TbgIndicatorComparator`
 * already use for their own indicator-comparison modules; C-15 has no per-company knob, so the narrative text is the
 * same regardless of the selected tab, only the modal title changes). Editable company values / autosave (C-06) are
 * out of scope here (this task's own Scope/Tests never mention them), matching `PeerAverageComparison`'s precedent;
 * values render read-only.
 *
 * Not mounted on the results page yet (Marco is composing it separately) — export from the widget index only.
 */
export function CompanyComparison({
  analysisId,
  companies,
  horizon = 'tbg',
  selectedId: selectedIdProp,
  onSelectedChange,
}: CompanyComparisonProps) {
  const t = useT();
  const [internalSelectedId, setInternalSelectedId] = useState(companies[0]?.id ?? '');
  const selectedId = selectedIdProp ?? internalSelectedId;
  const setSelectedId = onSelectedChange ?? setInternalSelectedId;
  const query = useCompanyComparisonDetailView(analysisId, selectedId, horizon);
  const selectedCompany = companies.find((company) => company.id === selectedId);

  return (
    <SectionCard
      padding="prototype"
      testId={companyComparisonTestIds.root}
      title={t('analysis-results.companyComparison.title')}
      subtitle={t('analysis-results.companyComparison.subtitle')}
      info={t('analysis-results.companyComparison.subtitleInfo')}
      actions={
        <ExecutiveNarrativeButton
          analysisId={analysisId}
          section="performance"
          title={t('analysis-results.companyComparison.narrativeTitle', {
            company: selectedCompany?.name ?? '',
          })}
          testId={companyComparisonTestIds.aiPill}
        />
      }
    >
      <div className="grid gap-16">
        {companies.length === 0 ? null : (
          <SegmentedTabs
            variant="withDot"
            aria-label={t('analysis-results.companyComparison.title')}
            value={selectedId}
            onChange={setSelectedId}
            items={companies.map((company) => ({
              id: company.id,
              label: company.name,
              dotClassName: companyColorClasses(company.colorKey).bg,
            }))}
            testIds={{ scope: 'company-comparison', component: 'company' }}
          />
        )}
        <ChartLegend
          testIds={{ scope: 'company-comparison', component: 'legend' }}
          items={[
            {
              id: 'ge',
              label: t('analysis-results.companyComparison.legend.ge'),
              tone: 'highlight',
            },
            ...(selectedCompany
              ? [
                  {
                    id: selectedCompany.id,
                    label: selectedCompany.name,
                    tone: 'peer' as const,
                    swatchClassName: companyColorClasses(selectedCompany.colorKey).bg,
                  },
                ]
              : []),
          ]}
        />

        <SectionBoundary
          scope={COMPANY_COMPARISON_SCOPE}
          result={toSectionResult(query.data, query.error)}
          isLoading={query.isFetching && query.data === undefined}
          onRetry={() => {
            void query.refetch();
          }}
          skeleton={<Skeleton shape="block" size={280} />}
        >
          {(data) => (
            <div className="grid gap-16">
              <div
                data-testid={companyComparisonTestIds.summary}
                className="grid gap-6 rounded-md bg-surface-page px-14 py-10"
              >
                <span className="text-micro text-text-muted">
                  {t('analysis-results.companyComparison.geBeat', { company: data.company.name })}
                </span>
                <div className="flex items-baseline gap-6">
                  <span className="text-24 font-bold text-text-heading">
                    {t('analysis-results.companyComparison.wins', {
                      wins: data.summary.wins,
                      total: data.summary.total,
                    })}
                  </span>
                  <span className="text-12 text-text-secondary">
                    {t('analysis-results.companyComparison.indicators')}
                  </span>
                </div>
                <ProgressBar
                  value={data.summary.winPct}
                  height={6}
                  aria-label={t('analysis-results.companyComparison.geBeat', {
                    company: data.company.name,
                  })}
                  valueText={formatPercent(data.summary.winPct, { decimals: 0 })}
                  className="w-80"
                />
                <span className="font-mono text-13 font-bold text-status-success-text">
                  {formatPercent(data.summary.winPct, { decimals: 0 })}
                </span>
              </div>

              <Accordion
                items={data.groups.map((group) => ({
                  id: group.category.id,
                  title: group.category.label,
                  summary: t('analysis-results.companyComparison.wins', {
                    wins: group.wins,
                    total: group.total,
                  }),
                  content: (
                    <div className="grid gap-0 px-16 py-4">
                      {group.rows.map((row) => (
                        <ComparisonRow
                          key={row.indicatorId}
                          row={row}
                          analysisId={analysisId}
                          companyName={data.company.name}
                          companyFillClassName={companyColorClasses(data.company.colorKey).bg}
                        />
                      ))}
                    </div>
                  ),
                }))}
                defaultOpen={data.groups.map((group) => group.category.id)}
                testIds={{ scope: 'company-comparison', component: 'category' }}
              />
            </div>
          )}
        </SectionBoundary>
      </div>
    </SectionCard>
  );
}
