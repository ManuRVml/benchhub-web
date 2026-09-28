import { useMemo } from 'react';

import { EChart, tokenColor } from '../echarts';
import { formatChartValue } from '../grouped-bar-chart';

import type { ChartDataTable, ChartOption } from '../echarts';
import type { GroupedBarUnit } from '../grouped-bar-chart';

export interface VerticalBarPeriod {
  id: string;
  /** Axis label, already formatted (e.g. "2025"). */
  label: string;
}

export interface VerticalBarSeriesItem {
  id: string;
  /** Series name, already translated (e.g. "ROACE"). */
  label: string;
  /** One value per period, in period order; `null` is missing data: no bar, "—" in the data table (CF-37). */
  values: readonly (number | null)[];
  /** Design-token path of the bar colour; default `chart.monitor` (SCR-11 history). */
  colorKey?: string;
}

export interface VerticalBarSeriesProps {
  periods: readonly VerticalBarPeriod[];
  series: readonly VerticalBarSeriesItem[];
  unit: GroupedBarUnit;
  /** Accessible name of the chart; also the caption of its data table. */
  ariaLabel: string;
  /** Period drawn at full strength (e.g. the current year); the other periods are dimmed. */
  highlightId?: string;
  /** Header of the period column in the data table (e.g. "Año"). */
  periodLabel?: string;
  /** Chart height in px. Default 200. */
  height?: number;
  testId?: string;
}

const DIMMED_OPACITY = 0.45;

/**
 * Vertical bars over time (catalogue chart "History"; SCR-11 "Comparación con serie histórica", V-29): one bar per
 * period and series, the value on top of each bar (es-CO), no legend for a single series. `highlightId` keeps one period
 * at full opacity and dims the rest; colour is never the only signal, the data table carries every value.
 */
export function VerticalBarSeries({
  periods,
  series,
  unit,
  ariaLabel,
  highlightId,
  periodLabel = '',
  height = 200,
  testId = 'vertical-bar-series',
}: VerticalBarSeriesProps) {
  const option = useMemo<ChartOption>(() => {
    const format = (value: unknown) =>
      formatChartValue(typeof value === 'number' ? value : null, unit);
    return {
      grid: { left: 8, right: 8, top: series.length > 1 ? 36 : 24, bottom: 8, containLabel: true },
      ...(series.length > 1 ? { legend: { top: 0, data: series.map((s) => s.label) } } : {}),
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: format },
      xAxis: { type: 'category', data: periods.map((period) => period.label) },
      yAxis: { type: 'value', axisLabel: { formatter: (value: number) => format(value) } },
      series: series.map((s) => ({
        id: s.id,
        name: s.label,
        type: 'bar',
        itemStyle: { color: tokenColor(s.colorKey ?? 'chart.monitor'), borderRadius: [4, 4, 0, 0] },
        // Value on top of each bar (SCR-11: 600 11px text.secondary), never dimmed with its bar.
        label: {
          show: true,
          position: 'top',
          color: tokenColor('text.secondary'),
          fontWeight: 600,
          formatter: ({ value }) => format(value),
        },
        // null stays null: ECharts draws no bar and no label for missing data.
        data: s.values.map((value, index) =>
          highlightId !== undefined && value !== null && periods[index]?.id !== highlightId
            ? { value, itemStyle: { opacity: DIMMED_OPACITY }, label: { opacity: 1 } }
            : value,
        ),
      })),
    };
  }, [highlightId, periods, series, unit]);

  const dataTable = useMemo<ChartDataTable>(
    () => ({
      caption: ariaLabel,
      rowHeader: periodLabel,
      columnHeaders: series.map((s) => s.label),
      rows: periods.map((period, index) => ({
        label: period.label,
        cells: series.map((s) => formatChartValue(s.values[index] ?? null, unit)),
      })),
    }),
    [ariaLabel, periodLabel, periods, series, unit],
  );

  return (
    <EChart
      option={option}
      ariaLabel={ariaLabel}
      dataTable={dataTable}
      height={height}
      testId={testId}
    />
  );
}
