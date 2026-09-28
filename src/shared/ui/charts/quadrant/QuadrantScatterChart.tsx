import { useMemo } from 'react';

import { useT } from '@/shared/i18n';

import { EChart } from '../echarts';
import { formatChartValue } from '../grouped-bar-chart';
import { colorOfToken, seriesColor } from '../radar/token-colors';

import type { ChartDataTable, ChartOption } from '../echarts';
import type { GroupedBarUnit } from '../grouped-bar-chart';

export interface QuadrantPoint {
  id: string;
  /** Point label drawn next to the dot and used as the data-table row label. */
  label: string;
  x: number;
  y: number;
  /** Bare company slug (`ecopetrol`, CF-137) or a token path; unknown → `company.fallback`. */
  colorKey: string;
}

export interface QuadrantLabels {
  topLeft: string;
  topRight: string;
  bottomLeft: string;
  bottomRight: string;
}

export interface QuadrantScatterChartProps {
  points: readonly QuadrantPoint[];
  /** Horizontal axis name. */
  xLabel: string;
  /** Vertical axis name. */
  yLabel: string;
  /** Vertical mid line (x value that splits left / right). */
  xMid: number;
  /** Horizontal mid line (y value that splits bottom / top). */
  yMid: number;
  /** Text of each quadrant, drawn in the grid corners and given per point in the data table. */
  quadrantLabels: QuadrantLabels;
  /** Accessible name of the chart; also the caption of its data table. */
  ariaLabel: string;
  /** Value format of both axes, the tooltip and the data table; default `number`. */
  unit?: GroupedBarUnit;
  height?: number;
  testId?: string;
}

const GRID = { left: 56, right: 32, top: 32, bottom: 48 } as const;

/**
 * Symmetric range around `mid` that holds every value with a 15 % margin, rounded up to a multiple of 5 so the axis
 * ends read as round numbers; the mid line stays centred.
 */
function rangeAround(mid: number, values: readonly number[]): { min: number; max: number } {
  const reach = Math.max(1, ...values.map((value) => Math.abs(value - mid))) * 1.15;
  const rounded = Math.ceil(reach / 5) * 5;
  return { min: mid - rounded, max: mid + rounded };
}

/** Quadrant of a point; a value on a mid line counts as the upper / right side. */
function quadrantOf(point: QuadrantPoint, xMid: number, yMid: number): keyof QuadrantLabels {
  const top = point.y >= yMid;
  const right = point.x >= xMid;
  return top ? (right ? 'topRight' : 'topLeft') : right ? 'bottomRight' : 'bottomLeft';
}

/**
 * Scatter with two dashed mid lines and a label per quadrant (SCR-08 comparison profiles, prototype `QUADRANT_*`).
 * Points are labelled on the chart; the data table lists x, y and the quadrant of every point.
 */
export function QuadrantScatterChart({
  points,
  xLabel,
  yLabel,
  xMid,
  yMid,
  quadrantLabels,
  ariaLabel,
  unit = 'number',
  height = 360,
  testId = 'quadrant-scatter-chart',
}: QuadrantScatterChartProps) {
  const t = useT();

  const option = useMemo<ChartOption>(() => {
    const xRange = rangeAround(
      xMid,
      points.map((p) => p.x),
    );
    const yRange = rangeAround(
      yMid,
      points.map((p) => p.y),
    );
    const muted = colorOfToken('text.secondary');
    const cornerText = (text: string, position: Record<string, number>) => ({
      type: 'text' as const,
      silent: true,
      ...position,
      style: { text, fill: muted, fontSize: 11, fontWeight: 600 },
    });
    const format = (value: number) => formatChartValue(value, unit);
    return {
      grid: { ...GRID },
      tooltip: {
        trigger: 'item',
        formatter: (params: unknown) => {
          const { name = '', value = [] } = params as { name?: string; value?: number[] };
          const [x = null, y = null] = value;
          return `${name}: ${xLabel} ${formatChartValue(x, unit)} · ${yLabel} ${formatChartValue(y, unit)}`;
        },
      },
      xAxis: {
        type: 'value',
        name: xLabel,
        nameLocation: 'middle',
        nameGap: 28,
        ...xRange,
        splitLine: { show: false },
        axisLabel: { formatter: format },
      },
      yAxis: {
        type: 'value',
        name: yLabel,
        nameLocation: 'middle',
        nameGap: 40,
        ...yRange,
        splitLine: { show: false },
        axisLabel: { formatter: format },
      },
      graphic: [
        cornerText(quadrantLabels.topLeft, { left: GRID.left + 8, top: GRID.top + 6 }),
        cornerText(quadrantLabels.topRight, { right: GRID.right + 8, top: GRID.top + 6 }),
        cornerText(quadrantLabels.bottomLeft, { left: GRID.left + 8, bottom: GRID.bottom + 6 }),
        cornerText(quadrantLabels.bottomRight, { right: GRID.right + 8, bottom: GRID.bottom + 6 }),
      ],
      series: [
        {
          type: 'scatter',
          symbolSize: 12,
          label: { show: true, formatter: '{b}', color: colorOfToken('text.body') },
          data: points.map((p) => ({
            id: p.id,
            name: p.label,
            value: [p.x, p.y],
            itemStyle: { color: seriesColor(p.colorKey) },
            // Labels point inwards so names near the right edge are not clipped.
            label: { position: p.x >= xMid ? 'left' : 'right' },
          })),
          markLine: {
            silent: true,
            symbol: 'none',
            label: { show: false },
            lineStyle: { type: 'dashed', color: colorOfToken('border.default'), width: 1 },
            data: [{ xAxis: xMid }, { yAxis: yMid }],
          },
        },
      ],
    };
  }, [points, quadrantLabels, unit, xLabel, xMid, yLabel, yMid]);

  const dataTable = useMemo<ChartDataTable>(
    () => ({
      caption: ariaLabel,
      rowHeader: '',
      columnHeaders: [xLabel, yLabel, t('common.chart.quadrant')],
      rows: points.map((p) => ({
        label: p.label,
        cells: [
          formatChartValue(p.x, unit),
          formatChartValue(p.y, unit),
          quadrantLabels[quadrantOf(p, xMid, yMid)],
        ],
      })),
    }),
    [ariaLabel, points, quadrantLabels, t, unit, xLabel, xMid, yLabel, yMid],
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
