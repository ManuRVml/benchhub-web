import { useMemo } from 'react';

import { EChart } from '../echarts';
import { formatChartValue } from '../grouped-bar-chart';
import { colorOfToken, contrast, mixColor } from '../radar/token-colors';

import type { ChartDataTable, ChartOption } from '../echarts';
import type { GroupedBarUnit } from '../grouped-bar-chart';

export interface HeatmapChartProps {
  /** Row labels (e.g. companies), top to bottom. */
  rows: readonly string[];
  /** Column labels (e.g. dimensions), left to right. */
  columns: readonly string[];
  /** `values[row][column]`; `null` is missing data: an empty cell and "—" in the table (CF-37), never 0. */
  values: readonly (readonly (number | null)[])[];
  /** Value format of the cells, tooltip and data table. */
  unit: GroupedBarUnit;
  /** Accessible name of the chart; also the caption of its data table. */
  ariaLabel: string;
  /** Value at full ramp intensity; default 100 (weights in %). */
  max?: number;
  /**
   * Ramp end colour per column as token paths (SCR-09 heatmap: `dimension.accent.*`); one path for every column, or
   * absent for `chart.average`. The ramp starts at `surface.page` (prototype `mixHex('#F5F6F7', dimColor, v / 100)`).
   */
  columnColorKeys?: readonly string[];
  /** Header of the row-label column of the data table (e.g. "Compañía"); empty leaves the corner cell headerless. */
  rowHeader?: string;
  /** Makes each row's name a button in the accessible data table (e.g. OVL-13 company profile). See EChartProps. */
  onRowLabelClick?: (rowIndex: number) => void;
  height?: number;
  testId?: string;
}

/**
 * Heatmap of `values` (SCR-09 "Composición de peso": peer weight per dimension). Each cell's colour mixes
 * `surface.page` into its column's ramp colour by value / max, and its label takes whichever ink (`dark.bg` or
 * `text.inverse`) contrasts more with that colour.
 */
export function HeatmapChart({
  rows,
  columns,
  values,
  unit,
  ariaLabel,
  max = 100,
  columnColorKeys,
  rowHeader = '',
  onRowLabelClick,
  height,
  testId = 'heatmap-chart',
}: HeatmapChartProps) {
  const option = useMemo<ChartOption>(() => {
    const start = colorOfToken('surface.page');
    const inkDark = colorOfToken('dark.bg');
    const inkLight = colorOfToken('text.inverse');
    const rampOf = (column: number) =>
      colorOfToken(columnColorKeys?.[column] ?? columnColorKeys?.[0] ?? 'chart.average');
    const fills: string[] = [];
    const cells = rows.flatMap((_, row) =>
      columns.flatMap((__, column) => {
        const value = values[row]?.[column] ?? null;
        // Missing data stays an empty cell: no item, so the grid background shows through.
        if (value === null) return [];
        const fill = mixColor(start, rampOf(column), value / max);
        const ink = contrast(fill, inkDark) >= contrast(fill, inkLight) ? inkDark : inkLight;
        fills.push(fill);
        return [
          {
            // The 4th dimension is the cell's index in `fills`, read by the visualMap below.
            value: [column, row, value, fills.length - 1],
            itemStyle: { color: fill },
            label: { show: true, color: ink, formatter: () => formatChartValue(value, unit) },
          },
        ];
      }),
    );
    return {
      // ECharts renders a heatmap only through a visualMap. Each column has its own ramp, which one continuous map
      // cannot express, so a hidden piecewise map gives every cell (dimension 3 = its index) the fill computed above.
      visualMap: {
        type: 'piecewise',
        show: false,
        seriesIndex: 0,
        dimension: 3,
        pieces: fills.map((color, index) => ({ value: index, color })),
      },
      grid: { left: 8, right: 8, top: 32, bottom: 8, containLabel: true },
      tooltip: {
        trigger: 'item',
        formatter: (params: unknown) => {
          const [column = 0, row = 0, value = null] = ((params as { value?: unknown }).value ??
            []) as [number?, number?, number?];
          return `${rows[row] ?? ''} · ${columns[column] ?? ''}: ${formatChartValue(value, unit)}`;
        },
      },
      xAxis: {
        type: 'category',
        position: 'top',
        data: [...columns],
        splitArea: { show: false },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'category',
        inverse: true,
        data: [...rows],
        axisTick: { show: false },
      },
      series: [
        {
          type: 'heatmap',
          data: cells,
          itemStyle: { borderColor: colorOfToken('surface.card'), borderWidth: 2 },
        },
      ],
    };
  }, [columnColorKeys, columns, max, rows, unit, values]);

  const dataTable = useMemo<ChartDataTable>(
    () => ({
      caption: ariaLabel,
      rowHeader,
      columnHeaders: [...columns],
      rows: rows.map((label, row) => ({
        label,
        cells: columns.map((_, column) => formatChartValue(values[row]?.[column] ?? null, unit)),
      })),
    }),
    [ariaLabel, columns, rowHeader, rows, unit, values],
  );

  return (
    <EChart
      option={option}
      ariaLabel={ariaLabel}
      dataTable={dataTable}
      testId={testId}
      {...(height === undefined ? {} : { height })}
      {...(onRowLabelClick ? { onRowLabelClick } : {})}
    />
  );
}
