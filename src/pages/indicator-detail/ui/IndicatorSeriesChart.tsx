import { useT } from '@/shared/i18n';
import { formatDelta } from '@/shared/lib/format';
import { EChart, tokenColor } from '@/shared/ui/charts/echarts';

import { formatIndicatorValue } from '../model/indicator-units';

import type { IndicatorDetailView, IndicatorUnit } from '@/shared/api';
import type { ChartDataTable, ChartOption } from '@/shared/ui/charts/echarts';

type SeriesData = Extract<IndicatorDetailView['series'], { status: 'ok' }>['data'];

export interface IndicatorSeriesChartProps {
  data: SeriesData;
  unit: IndicatorUnit;
  indicatorLabel: string;
}

/**
 * SCR-10 chart: previous vs current period per company (grouped bars, `border.default` / `chart.series.1`, SCR-10 L1377)
 * with the dashed peer-average line of the current period (`brand.primary`). Levels use the indicator unit (KBOE-aware);
 * the data table adds each company's variation in %.
 */
export function IndicatorSeriesChart({ data, unit, indicatorLabel }: IndicatorSeriesChartProps) {
  const t = useT();

  const format = (value: number | null) => formatIndicatorValue(value, unit);
  const average = data.peerAvgCurrent;
  // Built per render (a few rows): this component re-renders only when the V-24 query data changes. A manual useMemo
  // over the nested `data` trips react-hooks/preserve-manual-memoization.
  const option: ChartOption = {
    grid: { left: 8, right: 8, top: 36, bottom: 8, containLabel: true },
    legend: { top: 0, data: [data.periods.previous.label, data.periods.current.label] },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      valueFormatter: (value) => format(typeof value === 'number' ? value : null),
    },
    xAxis: { type: 'category', data: data.rows.map((row) => row.name) },
    yAxis: { type: 'value', axisLabel: { formatter: (value: number) => format(value) } },
    series: [
      {
        id: 'previous',
        name: data.periods.previous.label,
        type: 'bar',
        itemStyle: { color: tokenColor('border.default') },
        data: data.rows.map((row) => row.previous),
      },
      {
        id: 'current',
        name: data.periods.current.label,
        type: 'bar',
        itemStyle: { color: tokenColor('chart.series.1') },
        data: data.rows.map((row) => row.current),
        // V-24's real `peerAvgCurrent` is a non-nullable number (the old mirror allowed null), so the line always shows.
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: { type: 'dashed', width: 1.5, color: tokenColor('brand.primary') },
          label: {
            position: 'insideEndTop',
            color: tokenColor('brand.primary'),
            formatter: t('indicator-detail.sections.chart.peerAverageLabel', {
              value: format(average),
            }),
          },
          data: [{ yAxis: average }],
        },
      },
    ],
  };

  const dataTable: ChartDataTable = {
    caption: t('indicator-detail.sections.chart.ariaLabel', {
      indicator: indicatorLabel,
      previous: data.periods.previous.label,
      current: data.periods.current.label,
    }),
    rowHeader: t('indicator-detail.sections.chart.companyHeader'),
    columnHeaders: [
      data.periods.previous.label,
      data.periods.current.label,
      t('indicator-detail.sections.chart.variation'),
    ],
    rows: data.rows.map((row) => ({
      label: row.name,
      cells: [format(row.previous), format(row.current), formatDelta(row.deltaPct, { unit: '%' })],
    })),
  };

  return (
    <EChart
      option={option}
      ariaLabel={dataTable.caption}
      dataTable={dataTable}
      height={300}
      testId="indicator-detail-chart"
    />
  );
}
