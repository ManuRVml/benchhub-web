import { useT } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { StackedShareBar } from '@/shared/ui/charts/primitives';
import { SectionCard } from '@/shared/ui/composites/section-card';

// SCR-11 section 3 "Peso por dimensión · Financiera / Operativa / Transversal": Ecopetrol's own weight split,
// read-only (P5-50b). No pares here — those are compared in Resultados y Visualización.

export interface ValueMonitorDimensionWeightsProps {
  /** Ecopetrol's own weight per dimension (%, integers). */
  fin: number;
  op: number;
  trans: number;
}

const SCOPE = 'value-monitor-dimension-weights';

export function ValueMonitorDimensionWeights({
  fin,
  op,
  trans,
}: ValueMonitorDimensionWeightsProps) {
  const t = useT();
  return (
    <SectionCard
      title={t('value-monitor.dimensionWeights.title')}
      subtitle={t('value-monitor.dimensionWeights.subtitle')}
      info={t('value-monitor.dimensionWeights.info')}
      testId="value-monitor-dimension-weights"
    >
      <div className="rounded-md border-2 border-brand-primary bg-brand-primary-subtle p-14">
        <p className="m-0 mb-10 text-11 font-bold tracking-wide text-brand-primary-dark uppercase">
          {t('value-monitor.dimensionWeights.groupEcopetrol')}
        </p>
        <StackedShareBar
          aria-label={t('value-monitor.dimensionWeights.title')}
          segments={[
            {
              id: 'fin',
              label: t('value-monitor.dimensionWeights.legend.financial'),
              value: fin,
              tone: 'financiera',
            },
            {
              id: 'op',
              label: t('value-monitor.dimensionWeights.legend.operational'),
              value: op,
              tone: 'operativa',
            },
            {
              id: 'trans',
              label: t('value-monitor.dimensionWeights.legend.transversal'),
              value: trans,
              tone: 'transversal',
            },
          ]}
          testIds={{ scope: SCOPE, component: 'bar' }}
        />
        <div className="mt-10 flex flex-wrap items-center gap-16">
          <Legend swatchClass="bg-dimension-share-financiera">
            {t('value-monitor.dimensionWeights.legend.financial')}
          </Legend>
          <Legend swatchClass="bg-dimension-share-operativa">
            {t('value-monitor.dimensionWeights.legend.operational')}
          </Legend>
          <Legend swatchClass="bg-dimension-share-transversal">
            {t('value-monitor.dimensionWeights.legend.transversal')}
          </Legend>
        </div>
      </div>
    </SectionCard>
  );
}

function Legend({ swatchClass, children }: { swatchClass: string; children: string }) {
  return (
    <span className="inline-flex items-center gap-6 text-11 text-text-secondary">
      <span aria-hidden="true" className={cn('size-8 rounded-xs', swatchClass)} />
      {children}
    </span>
  );
}
