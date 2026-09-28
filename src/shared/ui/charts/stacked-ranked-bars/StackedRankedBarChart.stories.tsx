import { t } from '@/shared/i18n';

import { StackedRankedBarChart } from './StackedRankedBarChart';

import type { StackedRankedLegendItem, StackedRankedRow } from './StackedRankedBarChart';
import type { Meta, StoryObj } from '@storybook/react-vite';

// SCR-08 module 6 "Aspiración futura 2040+" (V-16, kbpe/d): the ASPIRATION_2040 totals of the capture
// (docs/design/mock-data-catalog.md), in source order so the chart does the ranking. The per-segment splits are not
// legible in the capture: these fixtures sum to the totals (Ecopetrol's low-emissions share is the captured 11 %).
const SEGMENTS: StackedRankedLegendItem[] = [
  {
    id: 'crude',
    label: t('analysis-results.futureAspiration.segmentChips.conventionalCrude'),
    colorKey: 'chart.aspiration.crudo',
  },
  {
    id: 'gas',
    label: t('analysis-results.futureAspiration.segmentChips.naturalGas'),
    colorKey: 'chart.aspiration.gas',
  },
  {
    id: 'unconventional',
    label: t('analysis-results.futureAspiration.segmentChips.unconventionalOffshore'),
    colorKey: 'chart.aspiration.noConvencional',
  },
  {
    id: 'lowEmissions',
    label: t('analysis-results.futureAspiration.segmentChips.lowEmissions'),
    colorKey: 'chart.aspiration.bajasEmisiones',
  },
];

/** One company row; values in SEGMENTS order, `null` = no data for that segment. */
const company = (id: string, label: string, values: (number | null)[]): StackedRankedRow => ({
  id,
  label,
  segments: SEGMENTS.map((segment, index) => ({ id: segment.id, value: values[index] ?? null })),
});

const ASPIRATION: StackedRankedRow[] = [
  company('ecopetrol', 'Ecopetrol', [500, 180, 81, 94]),
  company('shell', 'Shell', [900, 1500, 300, 370]),
  company('exxon', 'Exxon', [2600, 1400, 500, 250]),
  company('bp', 'BP', [900, 900, 300, 310]),
  company('petrobras', 'Petrobras', [1500, 500, 1200, 170]),
  company('ypf', 'YPF', [250, 150, 320, 30]),
  company('chevron', 'Chevron', [1600, 1000, 330, 190]),
  company('equinor', 'Equinor', [700, 800, 280, 280]),
  company('totalenergies', 'TotalEnergies', [800, 1300, 400, 430]),
  company('pemex', 'Pemex', [1400, 350, 150, 30]),
];

const meta = {
  title: 'Charts/StackedRankedBarChart',
  component: StackedRankedBarChart,
  args: {
    rows: ASPIRATION,
    segmentLegend: SEGMENTS,
    sort: 'desc',
    unit: 'number',
    ariaLabel: t('analysis-results.futureAspiration.title'),
  },
} satisfies Meta<typeof StackedRankedBarChart>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 1 Exxon 4.750 · 2 Petrobras 3.370 · … · 9 Ecopetrol 855 · 10 YPF 750 kbpe/d. */
export const Aspiracion2040: Story = { name: 'Aspiración futura 2040+' };

export const Ascending: Story = { args: { sort: 'asc' } };

/** A company without data ranks last with "—" as its total; a missing segment reads "—" and is not counted. */
export const MissingData: Story = {
  args: {
    rows: [
      ...ASPIRATION.slice(0, 4),
      company('repsol', 'Repsol', [null, null, null, null]),
      company('oxy', 'Oxy', [600, 300, null, 20]),
    ],
  },
};
