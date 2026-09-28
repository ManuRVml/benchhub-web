import { useT } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { formatNumber, formatPercent } from '@/shared/lib/format';
import { DonutChart } from '@/shared/ui/charts/donut';
import { SectionCard } from '@/shared/ui/composites/section-card';
import { Badge } from '@/shared/ui/primitives/badge';
import { createDataTableColumnHelper, DataTable } from '@/shared/ui/table';

import type {
  ValueMonitorCompositionCategory,
  ValueMonitorCompositionView,
} from '@/entities/value-monitor';
import type { CoverageStatus } from '@/shared/ui/primitives/badge';

export interface ValueMonitorCompositionProps {
  data: ValueMonitorCompositionView;
}

interface CategoryVisual {
  colorKey: string;
  dotClass: string;
}

// `id` is V-31's own lowercase category slug (P7-SWAP-VM: matches V-30's `rows[].category` enum; the hand-written
// V-31 mirror this map predates used the capitalized display name instead).
const CATEGORY_VISUAL: Record<string, CategoryVisual> = {
  financiero: { colorKey: 'chart.category.financiero', dotClass: 'bg-chart-category-financiero' },
  mercado: { colorKey: 'chart.category.mercado', dotClass: 'bg-chart-category-mercado' },
  estrategico: {
    colorKey: 'chart.category.estrategico',
    dotClass: 'bg-chart-category-estrategico',
  },
  grupos_interes: {
    colorKey: 'chart.category.gruposInteres',
    dotClass: 'bg-chart-category-grupos-interes',
  },
};
const FALLBACK_VISUAL: CategoryVisual = CATEGORY_VISUAL.mercado ?? {
  colorKey: 'chart.category.mercado',
  dotClass: 'bg-chart-category-mercado',
};
const categoryVisual = (id: string): CategoryVisual => CATEGORY_VISUAL[id] ?? FALLBACK_VISUAL;

/** Same ≥90 / 70–89 / <70 bands as the KVI table (kvi-band.ts); duplicated locally — widgets do not import widgets
 * (FSD, tools/architecture/fsd-rules.js). */
type ComplianceBand = 'ok' | 'watch' | 'risk' | 'tbd';
const COMPLIANCE_COVERAGE: Record<'ok' | 'watch' | 'risk', CoverageStatus> = {
  ok: 'complete',
  watch: 'partial',
  risk: 'missing',
};
function complianceBand(pct: number | null): ComplianceBand {
  if (pct === null) return 'tbd';
  if (pct >= 90) return 'ok';
  if (pct >= 70) return 'watch';
  return 'risk';
}

const col = createDataTableColumnHelper<ValueMonitorCompositionCategory>();

/**
 * SCR-11 §9 "Composición del Monitor por categoría" (V-31): a donut of category weights (centre = global compliance)
 * next to the category table (# KVIs, % peso, cumplimiento). Presentational, like its Monitor siblings (ranking,
 * history, KPIs) — the page owns the V-31 query and its SectionBoundary, so switching the snapshot select reloads it.
 */
export function ValueMonitorComposition({ data }: ValueMonitorCompositionProps) {
  const t = useT();

  const columns = [
    col.accessor('label', {
      header: () => t('value-monitor.composition.columnCategory'),
      meta: { rowHeader: true, width: 'minmax(160px, 2fr)' },
      cell: (info) => (
        <span className="flex items-center gap-8">
          <span
            aria-hidden="true"
            className={cn(
              'h-8 w-8 shrink-0 rounded-full',
              categoryVisual(info.row.original.id).dotClass,
            )}
          />
          <span className="text-body-strong text-text-heading">{info.getValue()}</span>
        </span>
      ),
    }),
    col.accessor('kviCount', {
      header: () => t('value-monitor.composition.columnCount'),
      meta: { align: 'end', width: '90px' },
      cell: (info) => (
        <span className="font-mono text-text-secondary">{formatNumber(info.getValue())}</span>
      ),
    }),
    col.accessor('weightPct', {
      header: () => t('value-monitor.composition.columnWeight'),
      meta: { align: 'end', width: '90px' },
      cell: (info) => (
        <span className="font-mono text-text-secondary">
          {formatPercent(info.getValue(), { decimals: 0 })}
        </span>
      ),
    }),
    col.accessor('compliancePct', {
      header: () => t('value-monitor.composition.columnCompliance'),
      meta: { align: 'end', width: '110px' },
      cell: (info) => {
        const pct = info.getValue();
        const band = complianceBand(pct);
        return band === 'tbd' ? (
          <Badge kind="tbd">{t('value-monitor.banners.tbd')}</Badge>
        ) : (
          <Badge kind="coverage" coverage={COMPLIANCE_COVERAGE[band]}>
            {formatPercent(pct, { decimals: 0 })}
          </Badge>
        );
      },
    }),
  ];

  return (
    <SectionCard
      title={t('value-monitor.composition.title')}
      subtitle={t('value-monitor.composition.subtitle')}
      info={t('value-monitor.composition.info')}
      testId="value-monitor-composition-card"
    >
      <div className="flex flex-wrap items-center gap-32">
        <DonutChart
          segments={data.categories.map((category) => ({
            id: category.id,
            label: category.label,
            value: category.weightPct,
            colorKey: categoryVisual(category.id).colorKey,
          }))}
          centerLabel={t('value-monitor.composition.centerLabel')}
          centerValue={data.centerPct}
          unit="percent"
          decimals={0}
          ariaLabel={t('value-monitor.composition.title')}
          segmentLabel={t('value-monitor.composition.columnCategory')}
          valueLabel={t('value-monitor.composition.columnWeight')}
          testId="value-monitor-composition-donut"
          // The ECharts box takes its width from the container: in this flex row the donut has no intrinsic width, so
          // without a fixed box it collapsed to 0px and drew an empty ring (SCR-11 fidelity, BencHUD.dc.html:2018).
          className="w-(--size-chart-donut) shrink-0"
        />
        {/* `min-w-280` resolved to 1120px on the 4px spacing scale and pushed the table under the donut. */}
        <div className="min-w-(--size-chart-donut-table) flex-1">
          <DataTable
            columns={columns}
            data={data.categories}
            caption={t('value-monitor.composition.title')}
            getRowId={(category) => category.id}
            testId="value-monitor-composition-table"
          />
        </div>
      </div>
    </SectionCard>
  );
}
