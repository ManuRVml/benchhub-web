import { useT } from '@/shared/i18n';
import { KpiStatCard } from '@/shared/ui/composites/kpi-stat-card';
import { SectionCard } from '@/shared/ui/composites/section-card';

import type { V03Response } from '@/shared/api';

export type ExecutiveSummaryData = Extract<
  V03Response['executiveSummary'],
  { status: 'ok' }
>['data'];

// SCR-05 KPI tile (prototype L264-L266): centred value and label, 16px padding, radius 12.
const TILE = 'rounded-card p-16 gap-2';

/**
 * SCR-05 "Resumen ejecutivo" (prototype L254-L270): an uppercase group label with its "(i)" panel over a strip of five
 * centred KPI tiles, straight on the page (no card around the strip).
 */
export function ExecutiveSummary({ data }: { data: ExecutiveSummaryData }) {
  const t = useT();

  return (
    <SectionCard
      title={t('home.sectionTitles.executiveSummary')}
      info={t('home.sectionInfo.executiveSummary')}
      titleVariant="eyebrow"
      surface="none"
      headingLevel={2}
      testId="executive-summary"
    >
      <div data-testid="executive-summary-strip" className="grid grid-cols-5 gap-12">
        <KpiStatCard
          label={t('home.executiveSummary.kpis.total')}
          value={data.total}
          align="center"
          className={TILE}
          tone="neutral"
          testId="kpi-total"
        />
        <KpiStatCard
          label={t('home.executiveSummary.kpis.active')}
          value={data.active}
          align="center"
          className={TILE}
          tone="info"
          testId="kpi-active"
        />
        <KpiStatCard
          label={t('home.executiveSummary.kpis.published')}
          value={data.published}
          align="center"
          className={TILE}
          tone="success"
          testId="kpi-published"
        />
        <KpiStatCard
          label={t('home.executiveSummary.kpis.inProgress')}
          value={data.inProgress}
          align="center"
          className={TILE}
          tone="warning"
          testId="kpi-in-progress"
        />
        <KpiStatCard
          label={t('home.executiveSummary.kpis.avgCoverage')}
          value={data.avgCoveragePct}
          unit="percent"
          decimals={0}
          align="center"
          className={TILE}
          tone="info"
          testId="kpi-avg-coverage"
        />
      </div>
    </SectionCard>
  );
}
