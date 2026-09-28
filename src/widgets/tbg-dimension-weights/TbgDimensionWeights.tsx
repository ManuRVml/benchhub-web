import { useT } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { formatDelta } from '@/shared/lib/format';
import { RankingBarRow } from '@/shared/ui/charts/primitives';
import { SectionCard } from '@/shared/ui/composites/section-card';
import { SegmentedTabs } from '@/shared/ui/composites/tabs';
import { AiPill } from '@/shared/ui/primitives/ai-pill';

const SCOPE = 'tbg-dimension-weights';

export type Dimension = 'fin' | 'op' | 'trans';

export interface TbgDimensionWeightsProps {
  dimension: Dimension;
  onDimensionChange: (dimension: Dimension) => void;
  ecopetrolPct: number;
  peerAvgPct: number;
  diffPts: number;
  detail: readonly { rank: number; companyId: string; name: string; pct: number }[];
}

export function TbgDimensionWeights({
  dimension,
  onDimensionChange,
  ecopetrolPct,
  peerAvgPct,
  diffPts,
  detail,
}: TbgDimensionWeightsProps) {
  const t = useT();

  const dimensionLabels = [
    { id: 'fin', label: t('analysis-results.tbgDimensionWeights.dimensionTabs.financiera') },
    { id: 'op', label: t('analysis-results.tbgDimensionWeights.dimensionTabs.operativa') },
    { id: 'trans', label: t('analysis-results.tbgDimensionWeights.dimensionTabs.transversal') },
  ];

  const getDiffMessageClass = (): string => {
    if (diffPts > 0) return 'text-status-success-text';
    if (diffPts < 0) return 'text-status-danger-text';
    return 'text-text-secondary';
  };

  const dimensionTitles: Record<Dimension, string> = {
    fin: t('analysis-results.tbgDimensionWeights.dimensionTabs.financiera'),
    op: t('analysis-results.tbgDimensionWeights.dimensionTabs.operativa'),
    trans: t('analysis-results.tbgDimensionWeights.dimensionTabs.transversal'),
  };
  const dimensionTitle = dimensionTitles[dimension];

  return (
    <SectionCard
      title={t('analysis-results.tbgDimensionWeights.title')}
      subtitle={t('analysis-results.tbgDimensionWeights.subtitle')}
      actions={
        <AiPill disabled size="sm">
          {t('analysis-results.tbgDimensionWeights.aiPill')}
        </AiPill>
      }
      data-testid={SCOPE}
    >
      <div className="flex flex-col gap-16">
        {/* Dimension tabs */}
        <SegmentedTabs
          items={dimensionLabels}
          value={dimension}
          variant="dimension"
          size="sm"
          onChange={(id) => {
            onDimensionChange(id as Dimension);
          }}
          aria-label={t('analysis-results.tbgDimensionWeights.title')}
          testIds={{ scope: SCOPE, component: 'dimension' }}
        />

        {/* Comparison bars */}
        <section>
          <div className="flex flex-col gap-10">
            <RankingBarRow
              label={t('analysis-results.tbgDimensionWeights.comparison.ecopetrol')}
              value={ecopetrolPct}
              max={100}
              tone="highlight"
              highlight="ecopetrol"
              data-testid={`${SCOPE}-ecopetrol-row`}
            />
            <RankingBarRow
              label={t('analysis-results.tbgDimensionWeights.comparison.peerAverage')}
              value={peerAvgPct}
              max={100}
              tone="brand"
              data-testid={`${SCOPE}-peer-average-row`}
            />
          </div>
        </section>

        {/* Diff message */}
        <section>
          <p className={cn('text-small-medium', getDiffMessageClass())}>
            {t('analysis-results.tbgDimensionWeights.diffMessage', {
              diff: formatDelta(diffPts, { unit: 'pts', decimals: 0 }),
              dimension: dimensionTitle,
            })}
          </p>
        </section>

        {/* Detail by company */}
        <section>
          <h4 className="m-0 mb-12 text-body-strong text-text-heading">
            {t('analysis-results.tbgDimensionWeights.detail.title', {
              dimension: dimensionTitle,
            })}
          </h4>
          <div className="flex flex-col gap-10">
            {detail.map((item) => (
              <RankingBarRow
                key={item.companyId}
                rank={item.rank}
                label={item.name}
                value={item.pct}
                max={100}
                tone="peer"
                data-testid={`${SCOPE}-detail-row-${String(item.rank)}`}
              />
            ))}
          </div>
        </section>
      </div>
    </SectionCard>
  );
}
