import { useEffect, useRef, useState } from 'react';

import { cn } from '@/shared/lib';

import { createChart } from './core';

import type { ChartInstance, ChartOption } from './core';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/** Tracks the user's reduced-motion preference (WCAG 2.2 AA, BR-27). */
function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(prefersReducedMotion);
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined;
    const query = window.matchMedia(REDUCED_MOTION_QUERY);
    const onChange = () => {
      setReduced(query.matches);
    };
    query.addEventListener('change', onChange);
    return () => {
      query.removeEventListener('change', onChange);
    };
  }, []);
  return reduced;
}

/** Text alternative of a chart: one row per category, one cell per series (already formatted for display). */
export interface ChartDataTable {
  /** Table caption; usually the chart's accessible name. */
  caption: string;
  /** Header of the row-label column (e.g. "Compañía"); empty leaves the corner cell without a header. */
  rowHeader: string;
  /** One header per series, in series order. */
  columnHeaders: readonly string[];
  rows: readonly { label: string; cells: readonly string[] }[];
}

export interface EChartProps {
  /** ECharts option; `animation` is forced off when the user prefers reduced motion. */
  option: ChartOption;
  /** Accessible name of the chart image. */
  ariaLabel: string;
  /** Visually hidden data table rendered from the same series, for screen readers. */
  dataTable: ChartDataTable;
  /** Chart height in px (the width follows the container). Default 280. */
  height?: number;
  /**
   * Makes each accessible data-table row label a button (e.g. OVL-13 company profile), called with the row's index
   * in `dataTable.rows`. The chart canvas itself stays informational only (SVG axis labels are not reliably
   * clickable/keyboard-operable); this is the one real interactive path for "click a row's name".
   */
  onRowLabelClick?: (rowIndex: number) => void;
  /** `data-testid` of the chart container; defaults to `chart`. */
  testId?: string;
  className?: string;
}

const seriesCount = (option: ChartOption): number => {
  const { series } = option;
  if (Array.isArray(series)) return series.length;
  return series ? 1 : 0;
};

/**
 * React wrapper around one ECharts instance (SVG renderer, token theme): creates it on mount, disposes it on unmount,
 * resizes it with its container and replaces the whole option on every change.
 */
export function EChart({
  option,
  ariaLabel,
  dataTable,
  height = 280,
  onRowLabelClick,
  testId = 'chart',
  className,
}: EChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ChartInstance | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    const chart = createChart(container);
    chartRef.current = chart;
    const observer =
      typeof ResizeObserver === 'function'
        ? new ResizeObserver(() => {
            chart.resize();
          })
        : null;
    observer?.observe(container);
    return () => {
      observer?.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    chartRef.current?.setOption({ ...option, animation: !reducedMotion }, { notMerge: true });
  }, [option, reducedMotion]);

  return (
    <div className={cn('w-full', className)}>
      <div
        ref={containerRef}
        role="img"
        aria-label={ariaLabel}
        data-testid={testId}
        data-series-count={seriesCount(option)}
        style={{ height }}
        className="w-full"
      />
      <table className="sr-only" data-testid={`${testId}-data-table`}>
        <caption>{dataTable.caption}</caption>
        <thead>
          <tr>
            {/* An empty header cell is not a header (axe empty-table-header): the corner stays a plain cell. */}
            {dataTable.rowHeader ? <th scope="col">{dataTable.rowHeader}</th> : <td />}
            {dataTable.columnHeaders.map((header) => (
              <th key={header} scope="col">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataTable.rows.map((row, rowIndex) => (
            <tr key={row.label}>
              <th scope="row">
                {onRowLabelClick ? (
                  <button
                    type="button"
                    onClick={() => {
                      onRowLabelClick(rowIndex);
                    }}
                  >
                    {row.label}
                  </button>
                ) : (
                  row.label
                )}
              </th>
              {row.cells.map((cell, index) => (
                <td key={dataTable.columnHeaders[index] ?? index}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
