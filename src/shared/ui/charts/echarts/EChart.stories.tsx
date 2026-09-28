import { t } from '@/shared/i18n';

import { EChart, tokenColor } from '../echarts';

import type { ChartDataTable, ChartOption } from '../echarts';
import type { Meta, StoryObj } from '@storybook/react-vite';

// Utility to build static ECharts options from design tokens
function buildBarOption(): ChartOption {
  const barColor = tokenColor('chart.monitor');
  return {
    grid: { left: 32, right: 32, top: 32, bottom: 32 },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['2021', '2022', '2023', '2024', '2025'],
      axisLabel: { color: tokenColor('text.secondary') },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: tokenColor('text.secondary') },
      splitLine: { lineStyle: { color: tokenColor('border.subtle') } },
    },
    series: [
      {
        type: 'bar',
        data: [6.2, 6.8, 7.1, 7.4, 7.8],
        itemStyle: { color: barColor },
        label: {
          show: true,
          position: 'top',
          color: tokenColor('text.secondary'),
          fontWeight: 600,
          formatter: ({ value }) => `${Number(value).toFixed(1)}%`,
        },
      },
    ],
  };
}

function buildLineOption(): ChartOption {
  const lineColor = tokenColor('chart.category.financiero');
  return {
    grid: { left: 32, right: 32, top: 32, bottom: 32 },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['Q1', 'Q2', 'Q3', 'Q4'],
      axisLabel: { color: tokenColor('text.secondary') },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: tokenColor('text.secondary') },
      splitLine: { lineStyle: { color: tokenColor('border.subtle') } },
    },
    series: [
      {
        type: 'line',
        smooth: true,
        data: [4.2, 5.1, 6.3, 7.0],
        itemStyle: { color: lineColor },
        lineStyle: { color: lineColor, width: 2 },
        symbol: 'circle',
        symbolSize: 6,
        label: {
          show: true,
          position: 'top',
          color: tokenColor('text.secondary'),
          fontWeight: 600,
          formatter: ({ value }) => `${Number(value).toFixed(1)}%`,
        },
      },
    ],
  };
}

// Data tables for screen readers
const barDataTable: ChartDataTable = {
  caption: t('value-monitor.history.title'),
  rowHeader: t('value-monitor.history.columnYear'),
  columnHeaders: ['ROACE'],
  rows: [
    { label: '2021', cells: ['6.2%'] },
    { label: '2022', cells: ['6.8%'] },
    { label: '2023', cells: ['7.1%'] },
    { label: '2024', cells: ['7.4%'] },
    { label: '2025', cells: ['7.8%'] },
  ],
};

const lineDataTable: ChartDataTable = {
  caption: t('value-monitor.composition.title'),
  rowHeader: t('value-monitor.composition.columnCategory'),
  columnHeaders: ['Compliance'],
  rows: [
    { label: 'Q1', cells: ['4.2%'] },
    { label: 'Q2', cells: ['5.1%'] },
    { label: 'Q3', cells: ['6.3%'] },
    { label: 'Q4', cells: ['7.0%'] },
  ],
};

const meta = {
  title: 'Charts/EChart',
  component: EChart,
  args: {
    height: 320,
  },
} satisfies Meta<typeof EChart>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Static bar chart with design token colours. */
export const BarChart: Story = {
  args: {
    option: buildBarOption(),
    ariaLabel: t('value-monitor.history.title'),
    dataTable: barDataTable,
  },
};

/** Static line chart with design token colours. */
export const LineChart: Story = {
  args: {
    option: buildLineOption(),
    ariaLabel: t('value-monitor.composition.title'),
    dataTable: lineDataTable,
  },
};
