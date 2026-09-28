import { useId, useState } from 'react';
import { Link } from 'react-router';

import { useCategoryIndicatorsView } from '@/entities/analysis';
import { isApiError } from '@/shared/api';
import { routes } from '@/shared/config';
import { useT } from '@/shared/i18n';
import {
  formatDelta,
  formatMultiple,
  formatNumber,
  formatPercent,
  formatUnit,
} from '@/shared/lib/format';
import { InfoToggle, InlineInfoPanel } from '@/shared/ui/composites/section-card';
import { Skeleton } from '@/shared/ui/composites/skeleton';
import { SectionBoundary } from '@/shared/ui/layout/section-boundary';
import { Badge } from '@/shared/ui/primitives/badge';

import { reportIndicatorPanelTestIds } from './test-ids';

import type {
  CategoryIndicatorRow,
  CategoryIndicatorUnit,
  CategoryIndicatorValueKind,
} from '@/entities/analysis';
import type { SectionResult } from '@/shared/api/section-result';
import type { Tier } from '@/shared/ui/primitives/badge';

/** Test-id scope of this widget (`report-indicator-panel-section-{state}`, `SectionBoundary`). */
export const REPORT_INDICATOR_PANEL_SCOPE = 'report-indicator-panel';

/** Plain (unsigned) format of each unit; `null` renders "—" (every formatter's own CF-37 handling). */
const LEVEL_FORMATTER: Record<CategoryIndicatorUnit, (value: number | null) => string> = {
  percent: (value) => formatPercent(value, { decimals: 1 }),
  points: (value) => `${formatNumber(value, { decimals: 1 })} pts`,
  ratio_x: (value) => formatMultiple(value),
  rating: (value) => formatNumber(value, { decimals: 1 }),
  kboe: (value) => formatUnit(value, 'KBOE'),
  usd_b: (value) => formatUnit(value, 'USD/B'),
  usd_bn: (value) => `${formatNumber(value, { decimals: 1 })} USD BN`,
  cop_per_usd: (value) => `${formatNumber(value, { decimals: 1 })} COP/USD`,
  bcop: (value) => formatUnit(value, 'BCOP'),
  mmcop: (value) => formatUnit(value, 'MMCOP'),
  cop: (value) => `${formatNumber(value, { decimals: 1 })} COP`,
  musd: (value) => formatUnit(value, 'MUSD'),
  cop_per_kwh: (value) => formatUnit(value, '$/kWh'),
};

/** CF-70: the sign shows only for growth/delta indicators (`valueKind`); levels never force one. */
function formatIndicatorValue(
  value: number | null,
  unit: CategoryIndicatorUnit,
  valueKind: CategoryIndicatorValueKind,
): string {
  if (valueKind === 'growth') {
    if (unit === 'percent') return formatDelta(value, { unit: '%' });
    if (unit === 'points') return formatDelta(value, { unit: 'pts' });
  }
  return LEVEL_FORMATTER[unit](value);
}

export interface ReportIndicatorPanelProps {
  analysisId: string;
  /** Selected category id (V-20 `categories[].id`, the page's `categoria` URL param); drives the V-22 fetch. */
  category: string;
  /** Selected category's own `label` (V-20), header title. */
  categoryLabel: string;
  /** Selected category's own `message` (V-20), header right-hand note. */
  categoryMessage: string;
}

function toSectionResult(
  data: { rows: readonly CategoryIndicatorRow[] } | undefined,
  error: unknown,
): SectionResult<{ rows: readonly CategoryIndicatorRow[] }> | undefined {
  if (data !== undefined) return { status: 'ok', data };
  if (error === null || error === undefined) return undefined;
  if (isApiError(error) && error.code === 'FORBIDDEN') return { status: 'forbidden' };
  return { status: 'error', errorCode: isApiError(error) ? error.code : 'UNKNOWN' };
}

/**
 * SCR-09 indicator panel (V-22): one read-only row per indicator of the selected category, catalog order. A row
 * links to the indicator detail (SCR-10) only when `hasDetail`; without it, the row is a plain (non-link) row.
 */
export function ReportIndicatorPanel({
  analysisId,
  category,
  categoryLabel,
  categoryMessage,
}: ReportIndicatorPanelProps) {
  const t = useT();
  const query = useCategoryIndicatorsView(analysisId, category);
  const [infoOpen, setInfoOpen] = useState(false);
  const eyebrowId = useId();
  const panelId = useId();

  return (
    <div data-testid={reportIndicatorPanelTestIds.root} className="grid gap-8">
      <div className="flex flex-wrap items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <h4 id={eyebrowId} className="text-title-card text-text-heading">
            {categoryLabel}
          </h4>
          <InfoToggle
            expanded={infoOpen}
            controls={panelId}
            describedBy={eyebrowId}
            onToggle={() => {
              setInfoOpen((open) => !open);
            }}
          />
        </div>
        <span className="text-12 text-text-secondary">{categoryMessage}</span>
      </div>
      <InlineInfoPanel id={panelId} labelledBy={eyebrowId} open={infoOpen}>
        {t('analysis-report.indicatorPanel.headerInfo')}
      </InlineInfoPanel>
      <SectionBoundary
        scope={REPORT_INDICATOR_PANEL_SCOPE}
        result={toSectionResult(query.data, query.error)}
        isLoading={query.isFetching && query.data === undefined}
        onRetry={() => {
          void query.refetch();
        }}
        skeleton={<Skeleton shape="block" size={160} />}
      >
        {(data) => (
          <div className="grid gap-4">
            {data.rows.map((row) => {
              const content = (
                <>
                  <div className="grid gap-2">
                    <span className="text-small-medium text-text-heading">{row.label}</span>
                    <span className="font-mono text-micro text-text-secondary">{row.code}</span>
                  </div>
                  <div className="grid justify-items-end gap-2">
                    <span className="font-mono text-15 font-bold text-text-heading">
                      {formatIndicatorValue(row.ecopetrol, row.unit, row.valueKind)}
                    </span>
                    <span className="text-micro text-text-secondary">
                      {t('analysis-report.indicatorPanel.ecopetrol')}
                    </span>
                  </div>
                  <div className="grid justify-items-end gap-2">
                    <span className="font-mono text-15 font-semibold text-text-secondary">
                      {formatIndicatorValue(row.peerAvg, row.unit, row.valueKind)}
                    </span>
                    <span className="text-micro text-text-secondary">
                      {t('analysis-report.indicatorPanel.peerAverage')}
                    </span>
                  </div>
                  {/* V-22's real tierId is a runtime-validated 1-4 range typed as a plain number; see
                      VisualizationTierId in use-visualization-view.ts for the same narrowing. */}
                  <Badge kind="tier" tier={row.tierId as Tier} />
                  {row.hasDetail ? (
                    <span aria-hidden="true" className="text-text-secondary">
                      ›
                    </span>
                  ) : null}
                </>
              );
              const className =
                'grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-16 rounded-sm px-20 py-14 hover:bg-surface-page';
              return row.hasDetail ? (
                <Link
                  key={row.indicatorId}
                  to={routes.indicatorDetail.build(
                    { analysisId, indicatorId: row.indicatorId },
                    { origen: 'visualizacion' },
                  )}
                  data-testid={reportIndicatorPanelTestIds.row(row.indicatorId)}
                  className={className}
                >
                  {content}
                </Link>
              ) : (
                <div
                  key={row.indicatorId}
                  data-testid={reportIndicatorPanelTestIds.row(row.indicatorId)}
                  className={className}
                >
                  {content}
                </div>
              );
            })}
          </div>
        )}
      </SectionBoundary>
    </div>
  );
}
