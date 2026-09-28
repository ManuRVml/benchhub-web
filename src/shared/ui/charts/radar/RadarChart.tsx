import { useMemo } from 'react';

import { useT } from '@/shared/i18n';

import { EChart } from '../echarts';
import { formatChartValue } from '../grouped-bar-chart';

import { seriesColor } from './token-colors';

import type { ChartDataTable, ChartOption } from '../echarts';
import type { GroupedBarUnit } from '../grouped-bar-chart';

export interface RadarAxis {
  id: string;
  /** Axis label (dimension or KVI name); long labels are truncated on the chart, never in the data table. */
  label: string;
  /** Axis maximum; default 100, or the largest value when some value exceeds 100. */
  max?: number;
}

export interface RadarSeries {
  id: string;
  /** Legend and data-table column label, e.g. "Ecopetrol 2025". */
  label: string;
  /** Bare company slug (`ecopetrol`, `shell`, CF-137) or a token path (`chart.average`); unknown → `company.fallback`. */
  colorKey: string;
  /** One value per axis, in axis order; `null` is missing data: no vertex, "—" in the table (CF-37), never 0. */
  values: readonly (number | null)[];
}

export interface RadarChartProps {
  axes: readonly RadarAxis[];
  series: readonly RadarSeries[];
  /** Accessible name of the chart; also the caption of its data table. */
  ariaLabel: string;
  /** Value format of the tooltip and the data table; default `number`. */
  unit?: GroupedBarUnit;
  /** Header of the axis column of the data table; default "Eje". */
  axisLabel?: string;
  height?: number;
  testId?: string;
}

/** Axis labels longer than this are cut with "…" on the chart (SCR-11: ~16 characters for the 20-axis radar). */
const MAX_AXIS_LABEL = 16;
const truncate = (label: string) =>
  label.length > MAX_AXIS_LABEL ? `${label.slice(0, MAX_AXIS_LABEL - 1)}…` : label;

/** Shared geometry of the radar grid and the polar system that carries the series (they must overlap exactly). */
const CENTER = ['50%', '46%'];
const START_ANGLE = 90;

/**
 * Radar chart (SCR-09 Ecopetrol vs sector on 3 axes, SCR-11 benchmark radar on up to 20 KVI axes).
 *
 * ECharts' own radar series draws a missing value at the centre (a vertex at 0), which CF-37 forbids. So the `radar`
 * component only draws the grid and the axis names, and each series is a line in a polar system with the same centre,
 * radius and start angle: values are scaled to their axis max (0–100 % of the radius), the first value is repeated at 360° to
 * close the shape, and `null` breaks the line (no vertex, no 0). One line series per item of `series`, so the legend
 * and `data-series-count` follow the companies; the data table has one row per axis with the unscaled values.
 */
export function RadarChart({
  axes,
  series,
  ariaLabel,
  unit = 'number',
  axisLabel,
  height = 320,
  testId = 'radar-chart',
}: RadarChartProps) {
  const t = useT();

  const option = useMemo<ChartOption>(() => {
    const largest = Math.max(
      0,
      ...series.flatMap((s) => s.values.filter((v): v is number => v !== null)),
    );
    const defaultMax = largest > 100 ? Math.ceil(largest) : 100;
    const maxOf = (index: number) => axes[index]?.max ?? defaultMax;
    const radius = axes.length > 8 ? '62%' : '68%';
    // Axis i sits at i × 360 / n degrees from the start angle (counterclockwise, like the radar grid); 360° = axis 0.
    const step = 360 / Math.max(1, axes.length);
    return {
      legend: { bottom: 0, data: series.map((s) => s.label) },
      tooltip: {
        trigger: 'item',
        formatter: (params: unknown) => {
          const { seriesIndex = 0, dataIndex = 0 } = params as {
            seriesIndex?: number;
            dataIndex?: number;
          };
          const index = dataIndex % Math.max(1, axes.length);
          const item = series[seriesIndex];
          return `${item?.label ?? ''} · ${axes[index]?.label ?? ''}: ${formatChartValue(item?.values[index] ?? null, unit)}`;
        },
      },
      radar: {
        center: CENTER,
        radius,
        startAngle: START_ANGLE,
        shape: 'polygon',
        splitNumber: 4,
        indicator: axes.map((axis, index) => ({ name: truncate(axis.label), max: maxOf(index) })),
      },
      polar: { center: CENTER, radius },
      angleAxis: {
        type: 'value',
        min: 0,
        max: 360,
        startAngle: START_ANGLE,
        clockwise: false,
        show: false,
      },
      radiusAxis: { min: 0, max: 100, show: false },
      series: series.map((s) => {
        const color = seriesColor(s.colorKey);
        const points = s.values.map((v, index) => [
          v === null ? '-' : (v * 100) / maxOf(index),
          index * step,
        ]);
        return {
          id: s.id,
          name: s.label,
          type: 'line',
          coordinateSystem: 'polar',
          symbolSize: 5,
          connectNulls: false,
          itemStyle: { color },
          lineStyle: { color, width: 2 },
          // A polar area closes each segment on the centre, so a series with gaps is drawn as a line only: the missing
          // axis must not read as a wedge down to 0.
          ...(s.values.includes(null) ? {} : { areaStyle: { color, opacity: 0.12 } }),
          // '-' is ECharts' empty value: the line breaks there instead of dropping to the centre (0).
          // [radius, angle] pairs; the first value is repeated at 360° to close the shape.
          data: [...points, [points[0]?.[0] ?? '-', 360]],
        };
      }),
    };
  }, [axes, series, unit]);

  const dataTable = useMemo<ChartDataTable>(
    () => ({
      caption: ariaLabel,
      rowHeader: axisLabel ?? t('common.chart.axis'),
      columnHeaders: series.map((s) => s.label),
      rows: axes.map((axis, index) => ({
        label: axis.label,
        cells: series.map((s) => formatChartValue(s.values[index] ?? null, unit)),
      })),
    }),
    [ariaLabel, axisLabel, axes, series, t, unit],
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
