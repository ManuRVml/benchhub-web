import { useState } from 'react';

import { useT } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { formatPercent } from '@/shared/lib/format';
import { BAR_TONE_CLASS, StackedShareBar } from '@/shared/ui/charts/primitives';
import { Popover, PopoverGroup } from '@/shared/ui/composites/popover';
import { SectionCard } from '@/shared/ui/composites/section-card';
import { SegmentedTabs } from '@/shared/ui/composites/tabs';

import { weightCompositionTestIds } from './test-ids';

import type {
  VisualizationLineLegendItem,
  VisualizationWeightComposition,
  VisualizationWeightCompositionCompany,
} from '@/entities/analysis';
import type { StackedShareSegment } from '@/shared/ui/charts/primitives';

export type WeightCompositionDimension = 'fin' | 'op' | 'trans';

const DIMENSIONS: readonly WeightCompositionDimension[] = ['fin', 'op', 'trans'];

const DIMENSION_LABEL_KEY = {
  fin: 'analysis-report.dimensionTabs.financial',
  op: 'analysis-report.dimensionTabs.operational',
  trans: 'analysis-report.dimensionTabs.transversal',
} as const satisfies Record<WeightCompositionDimension, string>;

const DIMENSION_TONE = {
  fin: 'financiera',
  op: 'operativa',
  trans: 'transversal',
} as const satisfies Record<WeightCompositionDimension, 'financiera' | 'operativa' | 'transversal'>;

const DIMENSION_TIP_KEY = {
  fin: 'analysis-report.weightComposition.legend.financial',
  op: 'analysis-report.weightComposition.legend.operational',
  trans: 'analysis-report.weightComposition.legend.transversal',
} as const satisfies Record<WeightCompositionDimension, string>;

const SUM_STATUS_CLASS = {
  ok: 'text-status-success-text',
  over: 'text-status-danger-text',
  under: 'text-status-warning-base',
} as const;

export interface WeightCompositionProps {
  data: VisualizationWeightComposition;
  lineLegend: readonly VisualizationLineLegendItem[];
  dimension: WeightCompositionDimension;
  onDimensionChange: (dimension: WeightCompositionDimension) => void;
}

function segmentsOf(
  t: ReturnType<typeof useT>,
  company: Pick<VisualizationWeightCompositionCompany, 'fin' | 'op' | 'trans'>,
): StackedShareSegment[] {
  return DIMENSIONS.map((id) => ({
    id,
    label: t(DIMENSION_LABEL_KEY[id]),
    value: company[id],
    tone: DIMENSION_TONE[id],
  }));
}

/**
 * SCR-09 "Composición de peso por línea de indicador" (P5-48, V-20 `weightComposition` + `lineLegend`): per-company
 * stacked bars by weight line, a dimension tab bar that dims the other two lines to opacity 0.3
 * (`StackedShareBar`'s `dimSegmentIds`, a small P5-48 addition to the shared primitive), the Ecopetrol reference box,
 * the overweight banner and the LIN-01/02/03 legend (`PopoverGroup` keeps only one formula popover open). Segment
 * clicks share one open-tip state across every row (lifted here, not per-bar) so opening one closes any other.
 */
export function WeightComposition({
  data,
  lineLegend,
  dimension,
  onDimensionChange,
}: WeightCompositionProps) {
  const t = useT();
  const [openSegment, setOpenSegment] = useState<{ companyId: string; segmentId: string } | null>(
    null,
  );
  const dimSegmentIds = DIMENSIONS.filter((id) => id !== dimension);
  const rows = [...data.companies].sort((a, b) => b[dimension] - a[dimension]);

  return (
    <SectionCard
      padding="prototype"
      testId={weightCompositionTestIds.root}
      title={t('analysis-report.weightComposition.title')}
      subtitle={t('analysis-report.weightComposition.subtitle')}
      info={t('analysis-report.weightComposition.info')}
    >
      <div className="grid gap-16">
        {data.hasOverweight ? (
          <div
            data-testid={weightCompositionTestIds.overweightBanner}
            role="status"
            className="rounded-sm bg-status-danger-bg px-12 py-8 text-small-medium text-status-danger-text"
          >
            {t('analysis-report.weightComposition.overweightBanner')}
          </div>
        ) : null}

        <div
          data-testid={weightCompositionTestIds.ecopetrolBox}
          className="grid gap-8 rounded-sm border-2 border-brand-primary bg-brand-primary-subtle p-12"
        >
          <span className="text-micro-strong text-brand-primary-dark uppercase">
            {t('analysis-report.weightComposition.ecopetrolReference')}
          </span>
          <StackedShareBar
            aria-label={t('analysis-report.weightComposition.ecopetrolReference')}
            segments={segmentsOf(t, data.ecopetrol)}
            dimSegmentIds={dimSegmentIds}
            size="md"
          />
          <div className="flex flex-wrap gap-16 text-small text-text-body">
            <span>
              {t('analysis-report.weightComposition.diffFinancial', { n: data.diffs.fin })}
            </span>
            <span>
              {t('analysis-report.weightComposition.diffOperational', { n: data.diffs.op })}
            </span>
            <span>
              {t('analysis-report.weightComposition.diffTransversal', { n: data.diffs.trans })}
            </span>
          </div>
        </div>

        <SegmentedTabs
          variant="dimension"
          aria-label={t('analysis-report.weightComposition.title')}
          value={dimension}
          onChange={(id) => {
            onDimensionChange(id as WeightCompositionDimension);
          }}
          items={DIMENSIONS.map((id) => ({
            id,
            label: t(DIMENSION_LABEL_KEY[id]),
            dimension: DIMENSION_TONE[id],
          }))}
          testIds={{ scope: 'weight-composition', component: 'dimension' }}
        />

        <div className="grid gap-12">
          {rows.map((company) => {
            const isOpenRow = openSegment?.companyId === company.companyId;
            return (
              <div
                key={company.companyId}
                data-testid={weightCompositionTestIds.row(company.companyId)}
                className="grid gap-4"
              >
                <div className="flex items-center justify-between gap-8">
                  <span className="text-small-strong text-text-heading">{company.name}</span>
                  <span
                    data-testid={weightCompositionTestIds.total(company.companyId)}
                    className={cn('text-micro-strong', SUM_STATUS_CLASS[company.sumStatus])}
                  >
                    {t('analysis-report.weightComposition.total', { total: company.totalPct })}
                  </span>
                </div>
                <StackedShareBar
                  aria-label={company.name}
                  segments={segmentsOf(t, company)}
                  size="sm"
                  dimSegmentIds={dimSegmentIds}
                  openSegmentId={isOpenRow ? openSegment.segmentId : null}
                  onOpenSegmentChange={(id) => {
                    setOpenSegment(id ? { companyId: company.companyId, segmentId: id } : null);
                  }}
                  renderTip={(segment) =>
                    `${formatPercent(segment.value, { decimals: 0 })} — ${t(
                      DIMENSION_TIP_KEY[segment.id as WeightCompositionDimension],
                    )}`
                  }
                  testIds={weightCompositionTestIds.barOwner(company.companyId)}
                />
              </div>
            );
          })}
        </div>

        <PopoverGroup>
          <div className="flex flex-wrap gap-16">
            {lineLegend.map((item) => {
              // V-20's real lineLegend items carry `dimension` (fin/op/trans), not a pre-picked `label`/`colorKey`:
              // derive both from the same maps this widget already keys its tabs/bars by.
              const label = t(DIMENSION_LABEL_KEY[item.dimension]);
              const tone = DIMENSION_TONE[item.dimension];
              return (
                <div key={item.code} className="flex items-center gap-6">
                  <span
                    aria-hidden="true"
                    className={cn('size-9 rounded-full', BAR_TONE_CLASS[tone])}
                  />
                  <span className="font-mono text-micro-strong text-text-muted">{item.code}</span>
                  <span className="text-small text-text-body">{label}</span>
                  <Popover
                    trigger={
                      <button
                        type="button"
                        aria-label={label}
                        data-testid={weightCompositionTestIds.legendInfo(item.code)}
                        className={cn(
                          'grid size-16 place-items-center rounded-pill text-11 text-text-inverse',
                          BAR_TONE_CLASS[tone],
                        )}
                      >
                        {'i'}
                      </button>
                    }
                    label={label}
                    testId={weightCompositionTestIds.legendPanel(item.code)}
                  >
                    {item.formula}
                  </Popover>
                </div>
              );
            })}
          </div>
        </PopoverGroup>

        <div
          data-testid={weightCompositionTestIds.footer}
          className="rounded-sm bg-surface-page px-12 py-8 text-small text-text-secondary"
        >
          {t('analysis-report.weightComposition.groupAverage', {
            fin: data.groupAvg.fin,
            op: data.groupAvg.op,
            trans: data.groupAvg.trans,
          })}
        </div>
      </div>
    </SectionCard>
  );
}
