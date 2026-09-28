import { useMemo } from 'react';

import { useT } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { formatMultiple, formatNumber, formatPercent, formatUnit } from '@/shared/lib/format';

import { EChart, tokenColor } from '../echarts';
import { formatChartValue } from '../grouped-bar-chart';

import type { ChartDataTable, ChartOption } from '../echarts';
import type { GroupedBarUnit } from '../grouped-bar-chart';

export interface DonutSegment {
  id: string;
  /** Segment name, already translated (e.g. "Financiero"). */
  label: string;
  /** Size of the segment (e.g. the category weight); `null` is missing data: no arc, "—" in the data table. */
  value: number | null;
  /** Design-token path of the segment colour, e.g. `chart.category.financiero` (theme palette, never a hex). */
  colorKey: string;
}

export interface DonutChartProps {
  segments: readonly DonutSegment[];
  /** Caption above the centre value, already translated (e.g. "Cumplimiento"). */
  centerLabel: string;
  /** Centre figure (e.g. the global compliance); `null` shows "—". */
  centerValue: number | null;
  /** es-CO format of the segment values and the centre value. */
  unit: GroupedBarUnit;
  /** Decimals of the segment values (tooltip, data table); default the unit's formatter default. SCR-11 weights: 0. */
  decimals?: number;
  /** Accessible name of the chart; also the caption of its data table. */
  ariaLabel: string;
  /** Header of the segment column in the data table (e.g. "Categoría"). */
  segmentLabel?: string;
  /** Header of the value column in the data table; default "Valor". */
  valueLabel?: string;
  /** Chart height in px; the ring keeps its proportions. Default 180 (SCR-11). */
  height?: number;
  testId?: string;
  className?: string;
}

/** `formatChartValue` with an explicit number of decimals when given. */
function formatSegmentValue(
  value: number | null,
  unit: GroupedBarUnit,
  decimals: number | undefined,
): string {
  if (decimals === undefined) return formatChartValue(value, unit);
  switch (unit) {
    case 'percent':
      return formatPercent(value, { decimals });
    case 'multiple':
      return formatMultiple(value, { decimals });
    case 'number':
      return formatNumber(value, { decimals });
    default:
      return formatUnit(value, unit, { decimals });
  }
}

/**
 * Ring of segments (catalogue "DonutChart"; SCR-11 "Composición del Monitor por categoría", SCR-09 composition) on the
 * ECharts wrapper: starts at 12 o'clock, colours from design tokens, a hover tooltip "Categoría · valor". The centre
 * label and value are HTML over the chart, not canvas text, so assistive technology reads them and tokens style them.
 * Missing values draw no arc and read "—" in the visually hidden data table (CF-37).
 */
export function DonutChart({
  segments,
  centerLabel,
  centerValue,
  unit,
  decimals,
  ariaLabel,
  segmentLabel = '',
  valueLabel,
  height = 180,
  testId = 'donut-chart',
  className,
}: DonutChartProps) {
  const t = useT();

  const option = useMemo<ChartOption>(
    () => ({
      tooltip: {
        trigger: 'item',
        valueFormatter: (value) =>
          formatSegmentValue(typeof value === 'number' ? value : null, unit, decimals),
      },
      series: [
        {
          id: 'segments',
          type: 'pie',
          radius: ['62%', '88%'],
          startAngle: 90,
          label: { show: false },
          labelLine: { show: false },
          emphasis: { scale: false },
          // A null segment has no size: it is left out of the ring instead of drawn as 0.
          data: segments.flatMap((segment) =>
            segment.value === null
              ? []
              : [
                  {
                    id: segment.id,
                    name: segment.label,
                    value: segment.value,
                    itemStyle: { color: tokenColor(segment.colorKey) },
                  },
                ],
          ),
        },
      ],
    }),
    [decimals, segments, unit],
  );

  const dataTable = useMemo<ChartDataTable>(
    () => ({
      caption: ariaLabel,
      rowHeader: segmentLabel,
      columnHeaders: [valueLabel ?? t('common.chart.value')],
      rows: segments.map((segment) => ({
        label: segment.label,
        cells: [formatSegmentValue(segment.value, unit, decimals)],
      })),
    }),
    [ariaLabel, decimals, segmentLabel, segments, t, unit, valueLabel],
  );

  return (
    <div className={cn('relative', className)} style={{ height }}>
      <EChart
        option={option}
        ariaLabel={ariaLabel}
        dataTable={dataTable}
        height={height}
        testId={testId}
      />
      <p
        data-testid={`${testId}-center`}
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
      >
        <span className="text-label text-text-secondary">{centerLabel}</span>
        <span className="text-kpi-lg text-text-heading">{formatChartValue(centerValue, unit)}</span>
      </p>
    </div>
  );
}
