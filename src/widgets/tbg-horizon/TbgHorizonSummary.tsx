import { testId } from '@/shared/config/test-ids';
import { useT } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { formatPercent } from '@/shared/lib/format';
import { KpiStatCard } from '@/shared/ui/composites/kpi-stat-card';
import { SectionCard } from '@/shared/ui/composites/section-card';
import { SegmentedTabs } from '@/shared/ui/composites/tabs';
import { AiPill } from '@/shared/ui/primitives/ai-pill';

// SCR-08 module 7 "Horizonte TBG" (S-TBG, slice A, P5-44a): only the "Resumen general" tab's two sub-sections
// (KPIs generales, Comparativo de composición por compañía). "Por compañía" is an inert disabled tab — its weight
// editor, OVL-15, OVL-01, the ILP/UNION variants and "Principales indicadores por dimensión" are out of scope.

export interface TbgHorizonSummaryComposition {
  companyId: string;
  name: string;
  finPct: number;
  opPct: number;
  transPct: number;
  /** Hybrid dimension: present only when the company reports one (V-17). */
  finOpPct?: number;
  totalPct: number;
  sumStatus: 'ok' | 'over' | 'under';
}

export interface TbgHorizonSummaryProps {
  kpis: {
    companies: number;
    avgFinPct: number;
    avgOpPct: number;
    avgTransPct: number;
  };
  composition: readonly TbgHorizonSummaryComposition[];
}

/** "Total:" label colour by `sumStatus` (tolerance 99.5–100.5, V-17): the closest AA-safe status text tokens. */
const TOTAL_TONE_CLASS: Readonly<Record<TbgHorizonSummaryComposition['sumStatus'], string>> = {
  ok: 'text-status-success-text',
  over: 'text-status-danger-text',
  under: 'text-status-warning-text',
};

/** Composition bar segment fill + its AA-contrast text colour (the dimension accent tokens; same pairing as the
 * presentation slide renderer's weight bars). */
const SEGMENT_CLASS: Record<'fin' | 'op' | 'trans' | 'finOp', { bg: string; text: string }> = {
  fin: { bg: 'bg-dimension-accent-financiera', text: 'text-text-inverse' },
  op: { bg: 'bg-dimension-accent-operativa', text: 'text-dark-bg' },
  trans: { bg: 'bg-dimension-accent-transversal', text: 'text-dark-bg' },
  finOp: { bg: 'bg-dimension-accent-fin-op', text: 'text-dark-bg' },
};

const SCOPE = 'tbg-horizon';

export function TbgHorizonSummary({ kpis, composition }: TbgHorizonSummaryProps) {
  const t = useT();
  return (
    <SectionCard
      title={t('analysis-results.tbgHorizon.titleTbg')}
      subtitle={t('analysis-results.tbgHorizon.subtitle')}
      actions={
        <AiPill testId={testId(SCOPE, 'ai-pill', 'trigger')}>
          {t('analysis-results.tbgHorizon.aiPill')}
        </AiPill>
      }
      testId="analysis-module-tbgHorizon"
    >
      <div className="flex flex-col gap-20">
        <SegmentedTabs
          items={[
            { id: 'summary', label: t('analysis-results.tbgHorizon.viewTabs.summary') },
            {
              id: 'byCompany',
              label: t('analysis-results.tbgHorizon.viewTabs.byCompany'),
              disabled: true,
            },
          ]}
          value="summary"
          aria-label={t('analysis-results.tbgHorizon.titleTbg')}
          testIds={{ scope: SCOPE, component: 'view' }}
        />

        <section>
          <h4 className="m-0 mb-12 text-body-strong text-text-heading">
            {t('analysis-results.tbgHorizon.kpis.title')}
          </h4>
          <div className="grid grid-cols-2 gap-12 tablet:grid-cols-4">
            <KpiStatCard
              label={t('analysis-results.tbgHorizon.kpis.analyzedCompanies')}
              value={kpis.companies}
              unit="number"
              tone="neutral"
              testId={testId(SCOPE, 'kpi', 'companies')}
            />
            <KpiStatCard
              label={t('analysis-results.tbgHorizon.kpis.avgFinWeight')}
              value={kpis.avgFinPct}
              unit="percent"
              decimals={0}
              tone="brand"
              testId={testId(SCOPE, 'kpi', 'avg-fin')}
            />
            <KpiStatCard
              label={t('analysis-results.tbgHorizon.kpis.avgOpWeight')}
              value={kpis.avgOpPct}
              unit="percent"
              decimals={0}
              tone="info"
              testId={testId(SCOPE, 'kpi', 'avg-op')}
            />
            <KpiStatCard
              label={t('analysis-results.tbgHorizon.kpis.avgTransWeight')}
              value={kpis.avgTransPct}
              unit="percent"
              decimals={0}
              tone="warning"
              testId={testId(SCOPE, 'kpi', 'avg-trans')}
            />
          </div>
        </section>

        <section>
          <h4 className="m-0 mb-12 text-body-strong text-text-heading">
            {t('analysis-results.tbgHorizon.comparison.title')}
          </h4>
          <div className="mb-10 flex items-center gap-16">
            <LegendSwatch swatchClassName={SEGMENT_CLASS.fin.bg}>
              {t('analysis-results.tbgHorizon.comparison.legend.financiera')}
            </LegendSwatch>
            <LegendSwatch swatchClassName={SEGMENT_CLASS.op.bg}>
              {t('analysis-results.tbgHorizon.comparison.legend.operativa')}
            </LegendSwatch>
            <LegendSwatch swatchClassName={SEGMENT_CLASS.trans.bg}>
              {t('analysis-results.tbgHorizon.comparison.legend.transversal')}
            </LegendSwatch>
          </div>
          <div className="flex flex-col gap-10">
            {composition.map((row) => (
              <CompositionRow
                key={row.companyId}
                row={row}
                totalLabel={t('analysis-results.tbgHorizon.comparison.total')}
              />
            ))}
          </div>
        </section>
      </div>
    </SectionCard>
  );
}

function LegendSwatch({
  swatchClassName,
  children,
}: {
  swatchClassName: string;
  children: string;
}) {
  return (
    <span className="inline-flex items-center gap-6 text-11 text-text-secondary">
      <span aria-hidden="true" className={cn('size-8 rounded-xs', swatchClassName)} />
      {children}
    </span>
  );
}

interface CompositionRowProps {
  row: TbgHorizonSummaryComposition;
  totalLabel: string;
}

function CompositionRow({ row, totalLabel }: CompositionRowProps) {
  const segments = [
    { key: 'fin', pct: row.finPct, tone: SEGMENT_CLASS.fin },
    { key: 'op', pct: row.opPct, tone: SEGMENT_CLASS.op },
    { key: 'trans', pct: row.transPct, tone: SEGMENT_CLASS.trans },
    ...(row.finOpPct === undefined
      ? []
      : [{ key: 'finOp', pct: row.finOpPct, tone: SEGMENT_CLASS.finOp }]),
  ];

  return (
    <div
      data-testid={testId(SCOPE, 'composition-row', row.companyId)}
      className="flex items-center gap-10"
    >
      <span className="w-[96px] shrink-0 truncate text-12 font-medium text-text-heading">
        {row.name}
      </span>
      <div className="flex h-24 flex-1 overflow-hidden rounded-sm">
        {segments
          .filter((segment) => segment.pct > 0)
          .map((segment) => (
            <div
              key={segment.key}
              data-testid={testId(SCOPE, 'segment', `${row.companyId}-${segment.key}`)}
              style={{ width: `${String(segment.pct)}%` }}
              className={cn(
                'flex items-center justify-center text-10 font-semibold whitespace-nowrap',
                segment.tone.bg,
                segment.tone.text,
              )}
            >
              {formatPercent(segment.pct, { decimals: 0 })}
            </div>
          ))}
      </div>
      <span
        data-testid={testId(SCOPE, 'total', row.companyId)}
        className={cn(
          'w-[90px] shrink-0 text-right text-12 font-semibold',
          TOTAL_TONE_CLASS[row.sumStatus],
        )}
      >
        {totalLabel} {formatPercent(row.totalPct, { decimals: 1 })}
      </span>
    </div>
  );
}
