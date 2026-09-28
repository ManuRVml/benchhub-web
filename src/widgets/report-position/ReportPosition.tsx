import { useNavigate } from 'react-router';

import { TIER_NAME_KEY, TIER_TEXT_CLASS } from '@/entities/analysis';
import { routes } from '@/shared/config';
import { useT } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { formatPercent } from '@/shared/lib/format';
import { SectionCard } from '@/shared/ui/composites/section-card';
import { Button } from '@/shared/ui/primitives/button';

import { reportPositionTestIds } from './test-ids';

import type { VisualizationKpiTile, VisualizationTierId } from '@/entities/analysis';
import type { ReactNode } from 'react';

export type Dimension = 'fin' | 'op' | 'trans';

export interface KpiTileData {
  /** Mean weight of the peer set for this dimension (%, integer). */
  sectorAvg: number;
  /** Ecopetrol's own weight (%, integer). */
  ecopetrol: number;
  min: number;
  max: number;
}

export interface ReportPositionProps {
  analysisId: string;
  position: {
    tierId: VisualizationTierId;
    /** V-20's real shape ({@link VisualizationView}), not a pre-formatted string: the BFF period is `{year, quarter}`. */
    periodLabel: { year: number; quarter: number };
    indicatorCount: number;
    peerCount: number;
  };
  /** The page supplies the V-20 KPI SectionBoundary so a section error leaves the position header available. */
  kpiTilesSlot: ReactNode;
  canCreatePresentation: boolean;
}

const DIMENSIONS: readonly Dimension[] = ['fin', 'op', 'trans'];

const DIMENSION_LABEL_KEY = {
  fin: 'analysis-report.dimensionTabs.financial',
  op: 'analysis-report.dimensionTabs.operational',
  trans: 'analysis-report.dimensionTabs.transversal',
} as const satisfies Record<Dimension, string>;

/**
 * SCR-09 header card + KPI tiles slice (P5-47a). Everything else of the Visualización dashboard (heatmap, ranking,
 * radar, categories, indicator panel, weight composition, comments) is out of scope — P5-47b/c and P5-48.
 */
export function ReportPosition({
  analysisId,
  position,
  kpiTilesSlot,
  canCreatePresentation,
}: ReportPositionProps) {
  const t = useT();
  const navigate = useNavigate();
  const periodLabel = `T${String(position.periodLabel.quarter)} ${String(position.periodLabel.year)}`;

  return (
    <div data-testid={reportPositionTestIds.root} className="flex flex-col gap-16">
      <SectionCard
        padding="prototype"
        testId="report-position-header"
        eyebrow={
          <span data-testid={reportPositionTestIds.eyebrow}>
            {t('analysis-report.header.eyebrow', { periodLabel })}
          </span>
        }
        title={
          <span
            data-testid={reportPositionTestIds.tierName}
            className={cn('text-display-tier', TIER_TEXT_CLASS[position.tierId])}
          >
            {t(TIER_NAME_KEY[position.tierId])}
          </span>
        }
        subtitle={
          <span data-testid={reportPositionTestIds.contextLine}>
            {t('analysis-report.header.contextLine', {
              indicatorCount: position.indicatorCount,
              peerCount: position.peerCount,
            })}
          </span>
        }
        actions={
          <>
            {canCreatePresentation ? (
              <Button
                testId={reportPositionTestIds.createPresentation}
                onClick={() => {
                  void navigate(routes.presentationNew.build({}, { analysisId }));
                }}
              >
                {t('analysis-report.header.actions.createPresentation')}
              </Button>
            ) : null}
          </>
        }
      />
      {kpiTilesSlot}
    </div>
  );
}

export interface ReportKpiTilesProps {
  /** V-20's real shape: one tile per dimension, tagged (not keyed) — found by `.dimension` below. */
  kpiTiles: readonly VisualizationKpiTile[];
}

export function ReportKpiTiles({ kpiTiles }: ReportKpiTilesProps) {
  const t = useT();

  return (
    <div
      className="grid grid-cols-1 gap-12 tablet:grid-cols-3"
      data-testid="report-position-kpi-tiles"
    >
      {DIMENSIONS.map((dimension) => {
        const tile = kpiTiles.find((candidate) => candidate.dimension === dimension);
        if (!tile) return null;
        return (
          <div
            key={dimension}
            data-testid={reportPositionTestIds.kpiTile(dimension)}
            className="flex flex-col gap-8 rounded-md border-2 border-border-default bg-surface-page p-14"
          >
            <span className="text-11 font-semibold text-text-secondary uppercase">
              {t(DIMENSION_LABEL_KEY[dimension])}
            </span>
            <div className="flex items-baseline gap-6">
              <span className="text-24 font-bold text-text-heading">
                {formatPercent(tile.sectorAvg, { decimals: 0 })}
              </span>
              <span className="text-12 text-text-secondary">
                {t('analysis-report.panorama.kpiTiles.sectorAvgCaption')}
              </span>
            </div>
            <span className="inline-flex w-fit items-center gap-4 rounded-pill border border-chart-eco-chip-border bg-chart-eco-chip-bg px-8 py-2 text-11 text-chart-eco-chip-text">
              {t('analysis-report.panorama.kpiTiles.ecopetrolChip', { value: tile.ecopetrol })}
            </span>
            <span className="text-12 text-text-secondary">
              {t('analysis-report.panorama.kpiTiles.range', { min: tile.min, max: tile.max })}
            </span>
          </div>
        );
      })}
    </div>
  );
}
