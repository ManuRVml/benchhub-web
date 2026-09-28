import { useT } from '@/shared/i18n';
import { VerticalBarSeries } from '@/shared/ui/charts/vertical-bars';
import { SectionCard } from '@/shared/ui/composites/section-card';
import { ChipGroup } from '@/shared/ui/primitives/chip';

import type { ChipGroupItem } from '@/shared/ui/primitives/chip';

// SCR-11 section 5 "Comparación con serie histórica": ROACE over the selected range (URL param `historico`).
// EChart's own data table already gives it an accessible text alternative (VerticalBarSeries).

export const VALUE_MONITOR_HISTORY_RANGE_IDS = ['actual', '5y', '8y', '10y'] as const;
export type ValueMonitorHistoryRangeId = (typeof VALUE_MONITOR_HISTORY_RANGE_IDS)[number];

export interface ValueMonitorHistoryPoint {
  year: number;
  /** Raw %. */
  value: number;
}

export interface ValueMonitorHistoryProps {
  range: ValueMonitorHistoryRangeId;
  /** Writes the page's `historico` URL param; the page refetches V-29 for the new range. */
  onRangeChange: (range: ValueMonitorHistoryRangeId) => void;
  points: readonly ValueMonitorHistoryPoint[];
}

export function ValueMonitorHistory({ range, onRangeChange, points }: ValueMonitorHistoryProps) {
  const t = useT();
  const items: ChipGroupItem[] = [
    { id: 'actual', label: t('value-monitor.history.range.current') },
    { id: '5y', label: t('value-monitor.history.range.fiveYears') },
    { id: '8y', label: t('value-monitor.history.range.eightYears') },
    { id: '10y', label: t('value-monitor.history.range.tenYears') },
  ];

  return (
    <SectionCard
      title={t('value-monitor.history.title')}
      info={t('value-monitor.history.info')}
      actions={
        <ChipGroup
          items={items}
          mode="single"
          value={[range]}
          onChange={(ids) => {
            const next = ids[0];
            if (next !== undefined && next !== range)
              onRangeChange(next as ValueMonitorHistoryRangeId);
          }}
          aria-label={t('value-monitor.history.title')}
          testIds={{ scope: 'value-monitor-history', component: 'range' }}
        />
      }
      testId="value-monitor-history"
    >
      <VerticalBarSeries
        periods={points.map((point) => ({ id: String(point.year), label: String(point.year) }))}
        series={[
          {
            id: 'roace',
            label: t('value-monitor.history.columnValue'),
            values: points.map((point) => point.value),
          },
        ]}
        unit="percent"
        ariaLabel={t('value-monitor.history.title')}
        periodLabel={t('value-monitor.history.columnYear')}
        testId="value-monitor-history-chart"
      />
    </SectionCard>
  );
}
