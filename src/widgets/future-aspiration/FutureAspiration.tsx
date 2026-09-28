import { useT } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { formatNumber } from '@/shared/lib/format';
import { ChartLegend } from '@/shared/ui/charts/legend';

import type { ReactNode } from 'react';

const SEGMENT_CLASS: Record<'crude' | 'gas' | 'unconventional' | 'lowEmissions', string> = {
  crude: 'bg-chart-aspiration-crudo',
  gas: 'bg-chart-aspiration-gas',
  unconventional: 'bg-chart-aspiration-no-convencional',
  lowEmissions: 'bg-chart-aspiration-bajas-emisiones',
};

export interface FutureAspirationProps {
  tiles: {
    ecopetrolProductionKbped: number;
    totalRank: number;
    of: number;
    lowEmissionsSharePct: {
      ecopetrol: number;
      peers: number;
    };
  };
  segments: readonly {
    id: 'total' | 'crude' | 'gas' | 'unconventional' | 'lowEmissions';
    label: string;
    colorKey?: string;
  }[];
  rows: {
    rank: number;
    companyId: string;
    name: string;
    isEcopetrol: boolean;
    segments: {
      crude: number;
      gas: number;
      unconventional: number;
      lowEmissions: number;
    };
    total: number;
  }[];
  selectedSegment: string;
  onSegmentChange: (id: string) => void;
}

function KpiStatCard({
  label,
  value,
  unit,
  className,
}: {
  label: ReactNode;
  value: string;
  unit?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-md border border-border-default bg-surface-card px-16 py-14',
        className,
      )}
    >
      <div aria-hidden="true" className="flex items-baseline gap-8">
        <span className="text-kpi text-text-heading">{value}</span>
        {unit}
      </div>
      <span aria-hidden="true" className="text-12 text-text-secondary">
        {label}
      </span>
    </div>
  );
}

export function FutureAspiration({
  tiles,
  segments,
  rows,
  selectedSegment,
  onSegmentChange,
}: FutureAspirationProps) {
  const t = useT();
  const unit = t('analysis-results.futureAspiration.unit');

  const maxPerSegment = {
    crude: Math.max(...rows.map((r) => r.segments.crude)),
    gas: Math.max(...rows.map((r) => r.segments.gas)),
    unconventional: Math.max(...rows.map((r) => r.segments.unconventional)),
    lowEmissions: Math.max(...rows.map((r) => r.segments.lowEmissions)),
  };

  const segmentMax =
    selectedSegment === 'total' ? 0 : maxPerSegment[selectedSegment as keyof typeof maxPerSegment];

  return (
    <section className="rounded-card border border-border-default bg-surface-card p-20">
      <header className="mb-16">
        <h2 className="text-title-card text-text-heading">
          {t('analysis-results.futureAspiration.title')}
        </h2>
        <p className="mt-4 text-small text-text-secondary">
          {t('analysis-results.futureAspiration.subtitle')}
        </p>
      </header>

      {/* KPI Tiles */}
      <div className="mb-20 grid grid-cols-1 gap-12 tablet:grid-cols-3">
        <KpiStatCard
          label={t('analysis-results.futureAspiration.kpiTiles.production')}
          value={formatNumber(tiles.ecopetrolProductionKbped)}
          unit={unit}
          className="tablet:col-span-1"
        />
        <KpiStatCard
          label={t('analysis-results.futureAspiration.kpiTiles.position')}
          value={`${formatNumber(tiles.totalRank)} de ${formatNumber(tiles.of)}`}
          className="tablet:col-span-1"
        />
        <KpiStatCard
          label={t('analysis-results.futureAspiration.kpiTiles.lowEmissionsShare')}
          value={`${formatNumber(tiles.lowEmissionsSharePct.ecopetrol)}% vs. ${formatNumber(
            tiles.lowEmissionsSharePct.peers,
          )}%`}
          className="tablet:col-span-1"
        />
      </div>

      {/* Segment Chips */}
      <div className="mb-20">
        <div
          role="group"
          aria-label={t('analysis-results.futureAspiration.segmentChipsLabel')}
          className="flex flex-wrap gap-8"
        >
          {segments.map((segment) => {
            const isSelected = selectedSegment === segment.id;
            const baseClasses = cn(
              'inline-flex items-center gap-4 whitespace-nowrap rounded-pill border px-12 py-6 text-small-medium cursor-pointer transition-colors',
              isSelected
                ? 'border-brand-primary bg-brand-primary text-text-inverse'
                : 'border-border-default bg-surface-page text-text-secondary hover:border-brand-primary-border',
            );
            const segmentClass =
              segment.colorKey && segment.colorKey in SEGMENT_CLASS
                ? SEGMENT_CLASS[segment.colorKey as keyof typeof SEGMENT_CLASS]
                : undefined;
            return (
              <button
                key={segment.id}
                type="button"
                aria-pressed={isSelected}
                data-selected={isSelected}
                onClick={() => {
                  onSegmentChange(segment.id);
                }}
                className={baseClasses}
              >
                {segment.label}
                {segmentClass && !isSelected && (
                  <span
                    aria-hidden="true"
                    className={cn('h-8 w-8 shrink-0 rounded-full', segmentClass)}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend (SCR-08 L587): the segment chips above already carry their own colour square; this adds the one item
          they can't — the outlined "Grupo Ecopetrol" marker explaining the highlighted Ecopetrol row below. */}
      <div className="mb-20">
        <ChartLegend
          items={[
            {
              id: 'ge',
              label: t('analysis-results.futureAspiration.legend.ge'),
              tone: 'highlight',
              variant: 'outlined',
            },
          ]}
          testIds={{ scope: 'future-aspiration', component: 'ge' }}
        />
      </div>

      {/* Ranked Stacked Bars */}
      <div className="space-y-12">
        {rows.map((row, idx) => {
          const rankClasses = cn(
            'flex h-32 w-32 items-center justify-center rounded-full text-title-3 font-bold',
            row.isEcopetrol
              ? 'bg-status-success-bg text-status-success-text'
              : idx === 0
                ? 'bg-brand-primary text-text-inverse'
                : 'bg-surface-card border border-border-default text-text-secondary',
          );
          const rowClasses = cn(
            'flex items-center gap-12 rounded-md p-12',
            row.isEcopetrol ? 'bg-status-success-bg/20' : 'bg-surface-card',
          );
          const barSegments = row.segments;
          const total = row.total;

          const totalValue = (
            <span className="shrink-0 font-mono text-small-medium whitespace-nowrap text-text-secondary">
              {formatNumber(total)} {unit}
            </span>
          );

          if (selectedSegment !== 'total') {
            const segmentKey = selectedSegment as keyof typeof barSegments;
            const value = barSegments[segmentKey];
            const width = segmentMax > 0 ? (value / segmentMax) * 100 : 0;
            return (
              <div key={row.companyId} className={rowClasses} data-testid="future-aspiration-row">
                <div className={rankClasses}>{row.rank}</div>
                <div className="flex-1">
                  <div className="text-small-medium text-text-heading">{row.name}</div>
                </div>
                <div className="h-20 w-full max-w-160 rounded-full bg-surface-card">
                  <div
                    className={`h-full rounded-full ${SEGMENT_CLASS[segmentKey]}`}
                    style={{
                      width: `${String(width)}%`,
                    }}
                  />
                </div>
                {totalValue}
              </div>
            );
          }

          return (
            <div key={row.companyId} className={rowClasses} data-testid="future-aspiration-row">
              <div className={rankClasses}>{row.rank}</div>
              <div className="flex-1">
                <div className="text-small-medium text-text-heading">{row.name}</div>
              </div>
              <div className="flex h-20 w-full max-w-160 overflow-hidden rounded-full bg-surface-card">
                <div
                  className={`h-full ${SEGMENT_CLASS.crude}`}
                  style={{
                    width: `${String((barSegments.crude / total) * 100)}%`,
                  }}
                />
                <div
                  className={`h-full ${SEGMENT_CLASS.gas}`}
                  style={{
                    width: `${String((barSegments.gas / total) * 100)}%`,
                  }}
                />
                <div
                  className={`h-full ${SEGMENT_CLASS.unconventional}`}
                  style={{
                    width: `${String((barSegments.unconventional / total) * 100)}%`,
                  }}
                />
                <div
                  className={`h-full ${SEGMENT_CLASS.lowEmissions}`}
                  style={{
                    width: `${String((barSegments.lowEmissions / total) * 100)}%`,
                  }}
                />
              </div>
              {totalValue}
            </div>
          );
        })}
      </div>

      {/* Footnote */}
      <p className="mt-16 text-11 text-text-muted">
        {t('analysis-results.futureAspiration.footnote')}
      </p>
    </section>
  );
}
