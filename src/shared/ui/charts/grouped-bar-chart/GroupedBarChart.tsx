import { useMemo } from 'react';

import { formatMultiple, formatNumber, formatPercent, formatUnit } from '@/shared/lib/format';

import { EChart } from '../echarts';

import type { ChartDataTable, ChartOption } from '../echarts';
import type { DisplayUnit } from '@/shared/lib/format';

/** How values are formatted (es-CO): `percent` 7,4%, `multiple` 1,3x, `number` 4.102, or a display unit. */
export type GroupedBarUnit = 'percent' | 'multiple' | 'number' | DisplayUnit;

export interface GroupedBarSeries {
  id: string;
  label: string;
  /** One value per category, in category order; `null` is missing data and renders as a gap, never as 0. */
  values: readonly (number | null)[];
}

export interface GroupedBarChartProps {
  /** Category axis labels (e.g. company names). */
  categories: readonly string[];
  series: readonly GroupedBarSeries[];
  unit: GroupedBarUnit;
  /** Accessible name of the chart; also the caption of its data table. */
  ariaLabel: string;
  /** Header of the category column in the data table (e.g. "Compañía"). */
  categoryLabel?: string;
  height?: number;
  testId?: string;
}

export function formatChartValue(value: number | null | undefined, unit: GroupedBarUnit): string {
  switch (unit) {
    case 'percent':
      return formatPercent(value);
    case 'multiple':
      return formatMultiple(value);
    case 'number':
      return formatNumber(value);
    default:
      return formatUnit(value, unit);
  }
}

/** Grouped vertical bars: one group per category, one bar per series; colours follow `chart.series.*`. */
export function GroupedBarChart({
  categories,
  series,
  unit,
  ariaLabel,
  categoryLabel = '',
  height,
  testId = 'grouped-bar-chart',
}: GroupedBarChartProps) {
  const option = useMemo<ChartOption>(
    () => ({
      grid: { left: 8, right: 8, top: 36, bottom: 8, containLabel: true },
      legend: { top: 0, data: series.map((s) => s.label) },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        valueFormatter: (value) => formatChartValue(typeof value === 'number' ? value : null, unit),
      },
      xAxis: { type: 'category', data: [...categories] },
      yAxis: {
        type: 'value',
        axisLabel: { formatter: (value: number) => formatChartValue(value, unit) },
      },
      series: series.map((s) => ({
        id: s.id,
        name: s.label,
        type: 'bar',
        // null stays null: ECharts leaves a gap for missing data.
        data: [...s.values],
      })),
    }),
    [categories, series, unit],
  );

  const dataTable = useMemo<ChartDataTable>(
    () => ({
      caption: ariaLabel,
      rowHeader: categoryLabel,
      columnHeaders: series.map((s) => s.label),
      rows: categories.map((category, index) => ({
        label: category,
        cells: series.map((s) => formatChartValue(s.values[index] ?? null, unit)),
      })),
    }),
    [ariaLabel, categoryLabel, categories, series, unit],
  );

  return (
    <EChart
      option={option}
      ariaLabel={ariaLabel}
      dataTable={dataTable}
      testId={testId}
      {...(height === undefined ? {} : { height })}
    />
  );
}
