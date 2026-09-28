import { useMemo } from 'react';

import { useT } from '@/shared/i18n';

import { EChart, tokenColor } from '../echarts';
import { formatChartValue } from '../grouped-bar-chart';

import type { ChartDataTable, ChartOption } from '../echarts';
import type { GroupedBarUnit } from '../grouped-bar-chart';

export interface StackedRankedSegmentValue {
  /** Id of a `segmentLegend` entry. */
  id: string;
  /** `null` is missing data: no segment, "—" in the data table, left out of the total (CF-37). */
  value: number | null;
}

export interface StackedRankedRow {
  id: string;
  /** Row name, already translated or a company name (e.g. "Ecopetrol"). */
  label: string;
  segments: readonly StackedRankedSegmentValue[];
}

export interface StackedRankedLegendItem {
  id: string;
  /** Segment name, already translated (e.g. "Gas natural"). */
  label: string;
  /** Design-token path of the segment colour, e.g. `chart.aspiration.gas`. */
  colorKey: string;
}

export type StackedRankedSort = 'desc' | 'asc';

export interface StackedRankedBarChartProps {
  rows: readonly StackedRankedRow[];
  /** Segments in stacking order (left to right); also the legend and the data table columns. */
  segmentLegend: readonly StackedRankedLegendItem[];
  /** Ranking by row total: `desc` puts the largest first (SCR-08 Aspiración), `asc` the smallest. */
  sort: StackedRankedSort;
  unit: GroupedBarUnit;
  /** Accessible name of the chart; also the caption of its data table. */
  ariaLabel: string;
  /** Header of the row column in the data table (e.g. "Compañía"). */
  rowLabel?: string;
  /** Chart height in px; default 32px per row plus the legend. */
  height?: number;
  testId?: string;
}

export interface RankedRow extends StackedRankedRow {
  /** Sum of the non-null segment values; `null` when every segment is missing. */
  total: number | null;
}

/** Row total: the sum of the known segments, `null` when none is known (never 0 for missing data). */
export function rowTotal(row: StackedRankedRow): number | null {
  const known = row.segments.flatMap((segment) => (segment.value === null ? [] : [segment.value]));
  return known.length === 0 ? null : known.reduce((sum, value) => sum + value, 0);
}

/** Rows ranked by total in the given direction; rows without a total go last. Stable for equal totals. */
export function rankRows(rows: readonly StackedRankedRow[], sort: StackedRankedSort): RankedRow[] {
  const direction = sort === 'desc' ? -1 : 1;
  return rows
    .map((row) => ({ ...row, total: rowTotal(row) }))
    .sort((a, b) => {
      if (a.total === null || b.total === null) {
        return a.total === b.total ? 0 : a.total === null ? 1 : -1;
      }
      return direction * (a.total - b.total);
    });
}

const ROW_HEIGHT = 32;
const LEGEND_HEIGHT = 40;

const valueOf = (row: StackedRankedRow, segmentId: string): number | null =>
  row.segments.find((segment) => segment.id === segmentId)?.value ?? null;

/**
 * Ranked horizontal stacked bars (catalogue "RankedStackedBarList"; SCR-08 "Aspiración futura 2040+", production per
 * segment): one row per entity, ranked by its total with the first rank on top, segments stacked in legend order with
 * token colours, the row total (es-CO) at the right end. The visually hidden data table lists the rows in rank order
 * with every segment and the total.
 */
export function StackedRankedBarChart({
  rows,
  segmentLegend,
  sort,
  unit,
  ariaLabel,
  rowLabel = '',
  height,
  testId = 'stacked-ranked-bar-chart',
}: StackedRankedBarChartProps) {
  const t = useT();
  const ranked = useMemo(() => rankRows(rows, sort), [rows, sort]);

  const option = useMemo<ChartOption>(() => {
    const format = (value: unknown) =>
      formatChartValue(typeof value === 'number' ? value : null, unit);
    const labels = ranked.map((row) => row.label);
    return {
      grid: { left: 8, right: 8, top: LEGEND_HEIGHT, bottom: 8, containLabel: true },
      legend: { top: 0, data: segmentLegend.map((segment) => segment.label) },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: format },
      xAxis: { type: 'value', show: false },
      // Rank 1 on top (`inverse`); the right-hand axis carries the row totals, so no helper series is needed.
      yAxis: [
        { type: 'category', data: labels, inverse: true, axisTick: { show: false } },
        {
          type: 'category',
          data: ranked.map((row) => format(row.total)),
          inverse: true,
          position: 'right',
          axisLine: { show: false },
          axisTick: { show: false },
        },
      ],
      series: segmentLegend.map((segment) => ({
        id: segment.id,
        name: segment.label,
        type: 'bar',
        stack: 'total',
        barWidth: 18,
        itemStyle: { color: tokenColor(segment.colorKey) },
        data: ranked.map((row) => valueOf(row, segment.id)),
      })),
    };
  }, [ranked, segmentLegend, unit]);

  const dataTable = useMemo<ChartDataTable>(
    () => ({
      caption: ariaLabel,
      rowHeader: rowLabel,
      columnHeaders: [...segmentLegend.map((segment) => segment.label), t('common.chart.total')],
      rows: ranked.map((row) => ({
        label: row.label,
        cells: [
          ...segmentLegend.map((segment) => formatChartValue(valueOf(row, segment.id), unit)),
          formatChartValue(row.total, unit),
        ],
      })),
    }),
    [ariaLabel, ranked, rowLabel, segmentLegend, t, unit],
  );

  return (
    <EChart
      option={option}
      ariaLabel={ariaLabel}
      dataTable={dataTable}
      height={height ?? LEGEND_HEIGHT + ranked.length * ROW_HEIGHT + 16}
      testId={testId}
    />
  );
}
