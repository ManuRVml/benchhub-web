import { useState } from 'react';

import {
  useExportBenchmarkRadar,
  useValueMonitorBenchmarkRadarView,
} from '@/entities/value-monitor';
import { isApiError } from '@/shared/api';
import { useT } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { formatPercent } from '@/shared/lib/format';
import { RadarChart } from '@/shared/ui/charts/radar';
import { CompanyLogoChip } from '@/shared/ui/composites/company-logo-chip';
import { SectionCard } from '@/shared/ui/composites/section-card';
import { Skeleton } from '@/shared/ui/composites/skeleton';
import { SectionBoundary } from '@/shared/ui/layout/section-boundary';
import { AiPill } from '@/shared/ui/primitives/ai-pill';
import { Button } from '@/shared/ui/primitives/button';

import { valueMonitorBenchmarkRadarTestIds } from './test-ids';

import type { ValueMonitorBenchmarkRadarView } from '@/entities/value-monitor';
import type { SectionResult } from '@/shared/api/section-result';

/** Test-id scope of this widget (`value-monitor-benchmark-radar-section-{state}`, `SectionBoundary`). */
export const VALUE_MONITOR_BENCHMARK_RADAR_SCOPE = 'value-monitor-benchmark-radar';

/** SCR-11 §10 "hasta 5 compañías". */
const MAX_SELECTED_COMPANIES = 5;

export interface ValueMonitorBenchmarkRadarProps {
  /**
   * Gate for the `benchmarkRadar` scope flag (CF-08; the real flag name is still pending P1-20). No scope-flag
   * system exists in this repo yet, so the caller passes this directly until one does — default `true`.
   */
  enabled?: boolean;
}

function toSectionResult(
  data: ValueMonitorBenchmarkRadarView | undefined,
  error: unknown,
): SectionResult<ValueMonitorBenchmarkRadarView> | undefined {
  if (data !== undefined) return { status: 'ok', data };
  if (error === null || error === undefined) return undefined;
  if (isApiError(error) && error.code === 'FORBIDDEN') return { status: 'forbidden' };
  return { status: 'error', errorCode: isApiError(error) ? error.code : 'UNKNOWN' };
}

/**
 * SCR-11 section 10 "Análisis multidimensional · Benchmark radial" **[gated]** (P5-54, V-36): a 20-axis radar (one
 * axis per KVI with data), up to 5 toggleable company series (colour-square toggles, the 6th disabled once 5 are
 * on), a strengths/opportunities ranking rail and the AI insight note, all independently-statused fields of the one
 * V-36 fetch. "PNG" fires C-14 (`radar-png`); "PDF"/"PPT" stay disabled — no matching C-14 `kind` exists yet
 * (flagged in the P5-54 reply). "Analizar con IA" stays inert: `ExecutiveNarrativeButton` hardcodes `scope:'results'`
 * and a required `analysisId`, neither of which fits Monitor de Valor. The radar's own data-table (`RadarChart` /
 * `EChart`) is the accessible text alternative — no separate table built here.
 *
 * Mounted on ValueMonitorPage (P5-54b) after the comments rail, per Pia's CF-05/CF-06 ordering — not before it as
 * this docstring originally said.
 */
export function ValueMonitorBenchmarkRadar({ enabled = true }: ValueMonitorBenchmarkRadarProps) {
  const t = useT();
  const query = useValueMonitorBenchmarkRadarView();
  const exportRadar = useExportBenchmarkRadar();
  const [selectedOverride, setSelectedOverride] = useState<string[] | null>(null);

  if (!enabled) return null;

  return (
    <SectionCard
      testId={valueMonitorBenchmarkRadarTestIds.root}
      title={t('value-monitor.benchmark.title')}
      subtitle={t('value-monitor.benchmark.subtitle')}
      actions={
        <div className="flex items-center gap-8">
          <AiPill size="sm" disabled testId={`${valueMonitorBenchmarkRadarTestIds.root}-ai-pill`}>
            {t('value-monitor.benchmark.actions.analyzeWithAI')}
          </AiPill>
          <Button
            variant="outline"
            size="sm"
            loading={exportRadar.isPending}
            onClick={() => {
              exportRadar.mutate();
            }}
            testId={valueMonitorBenchmarkRadarTestIds.exportPng}
          >
            {t('value-monitor.benchmark.actions.png')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled
            testId={valueMonitorBenchmarkRadarTestIds.exportPdf}
          >
            {t('value-monitor.benchmark.actions.pdf')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled
            testId={valueMonitorBenchmarkRadarTestIds.exportPpt}
          >
            {t('value-monitor.benchmark.actions.ppt')}
          </Button>
        </div>
      }
    >
      <SectionBoundary
        scope={VALUE_MONITOR_BENCHMARK_RADAR_SCOPE}
        result={toSectionResult(query.data, query.error)}
        isLoading={query.isFetching && query.data === undefined}
        onRetry={() => {
          void query.refetch();
        }}
        skeleton={<Skeleton shape="block" size={360} />}
      >
        {(data) => {
          const radarOk = data.radar.status === 'ok' ? data.radar.data : null;
          const rankingOk = data.ranking.status === 'ok' ? data.ranking.data : null;
          const insightOk = data.insight.status === 'ok' ? data.insight.data : null;

          const colorByCompany = new Map(
            (radarOk?.series ?? []).map((series) => [series.companyId, series.colorKey]),
          );
          const seriesIds = radarOk?.series.map((series) => series.companyId) ?? [];
          const defaultSelected = seriesIds.slice(0, 2);
          const selected = selectedOverride ?? defaultSelected;

          // The toggles list every company that has a series in this response (the plotted ones, first) plus the
          // extra `companyOptions`. Listing only `companyOptions` (V-36 example: BP, Equinor) hid the two plotted
          // companies (Ecopetrol, Shell) from the toggles and offered companies that toggle nothing. The port does not
          // forward `companies` yet (see the entity hook), so a company without a series here cannot be loaded and its
          // toggle stays disabled.
          const companies = [
            ...(radarOk?.series ?? []).map((series) => ({
              id: series.companyId,
              name: series.name,
              hasSeries: true,
            })),
            ...data.companyOptions
              .filter((company) => !colorByCompany.has(company.id))
              .map((company) => ({ ...company, hasSeries: false })),
          ];

          const toggleCompany = (companyId: string) => {
            const next = selected.includes(companyId)
              ? selected.filter((id) => id !== companyId)
              : [...selected, companyId];
            setSelectedOverride(next);
          };

          const visibleSeries = (radarOk?.series ?? []).filter((series) =>
            selected.includes(series.companyId),
          );

          return (
            <div className="grid grid-cols-1 gap-16 tablet:grid-cols-[180px_1fr_220px]">
              <div className="grid content-start gap-8">
                <span className="text-11 font-semibold text-text-secondary uppercase">
                  {t('value-monitor.benchmark.companiesLabel')}
                </span>
                <div className="grid content-start gap-6">
                  {companies.map((company) => {
                    const isSelected = selected.includes(company.id);
                    const isDisabled =
                      !company.hasSeries ||
                      (!isSelected && selected.length >= MAX_SELECTED_COMPANIES);
                    return (
                      <button
                        key={company.id}
                        type="button"
                        aria-pressed={isSelected}
                        disabled={isDisabled}
                        onClick={() => {
                          toggleCompany(company.id);
                        }}
                        data-testid={valueMonitorBenchmarkRadarTestIds.companyToggle(company.id)}
                        className={cn(
                          'rounded-control border px-10 py-6 text-left disabled:cursor-not-allowed disabled:opacity-50',
                          isSelected
                            ? 'border-brand-primary bg-surface-card'
                            : 'border-border-default bg-surface-page',
                        )}
                      >
                        <CompanyLogoChip
                          slug={colorByCompany.get(company.id)}
                          name={company.name}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {radarOk ? (
                <RadarChart
                  axes={radarOk.axes.map((axis) => ({ id: axis.kviId, label: axis.label }))}
                  series={visibleSeries.map((series) => ({
                    id: series.companyId,
                    label: `${series.name} ${String(series.year)}`,
                    colorKey: series.colorKey,
                    values: series.values,
                  }))}
                  unit="percent"
                  ariaLabel={t('value-monitor.benchmark.radarAriaLabel')}
                  testId={valueMonitorBenchmarkRadarTestIds.radar}
                />
              ) : null}

              <div className="grid gap-16">
                {rankingOk ? (
                  <>
                    <div
                      data-testid={valueMonitorBenchmarkRadarTestIds.strengths}
                      className="grid gap-4"
                    >
                      <span className="text-11 font-semibold text-status-success-text uppercase">
                        {t('value-monitor.benchmark.strengthsLabel')}
                      </span>
                      {rankingOk.strengths.map((item) => (
                        <div key={item.kviId} className="flex items-center justify-between gap-8">
                          <span className="text-small text-text-body">{item.label}</span>
                          <span className="font-mono text-small-medium text-status-success-text">
                            {formatPercent(item.pct, { decimals: 0 })}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div
                      data-testid={valueMonitorBenchmarkRadarTestIds.opportunities}
                      className="grid gap-4"
                    >
                      <span className="text-11 font-semibold text-status-danger-text uppercase">
                        {t('value-monitor.benchmark.opportunitiesLabel')}
                      </span>
                      {rankingOk.opportunities.map((item) => (
                        <div key={item.kviId} className="flex items-center justify-between gap-8">
                          <span className="text-small text-text-body">{item.label}</span>
                          <span className="font-mono text-small-medium text-status-danger-text">
                            {formatPercent(item.pct, { decimals: 0 })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}
                {insightOk ? (
                  <p className="rounded-sm bg-ai-bg px-12 py-8 text-small text-ai-text">
                    <span aria-hidden="true">{'✦ '}</span>
                    {insightOk.text}
                  </p>
                ) : null}
              </div>
            </div>
          );
        }}
      </SectionBoundary>
    </SectionCard>
  );
}
