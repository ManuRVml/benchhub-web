import { KpiStatCard } from './KpiStatCard';

import type { Meta, StoryObj } from '@storybook/react-vite';

// Labels and values are sample data of the contracts (V-03 marketIndicators / executiveSummary, V-27 kpis).
const meta = {
  title: 'Composites/KpiStatCard',
  component: KpiStatCard,
  args: { label: 'Brent', value: 71.4, unit: 'USD/B' },
  argTypes: {
    tone: {
      control: 'inline-radio',
      options: ['neutral', 'brand', 'info', 'success', 'warning', 'danger'],
    },
  },
} satisfies Meta<typeof KpiStatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Market indicator with a positive delta (SCR-05). */
export const MarketUp: Story = { args: { delta: { value: 0.6 } } };

export const MarketDown: Story = { args: { label: 'WTI', value: 67.8, delta: { value: -0.3 } } };

/** Percent value with a tone (SCR-05 "Cobertura prom."). */
export const Percent: Story = {
  args: {
    label: 'Cobertura prom.',
    value: 82,
    unit: 'percent',
    decimals: 0,
    tone: 'info',
  },
};

/** Currency value (SCR-05 TRM). */
export const Currency: Story = {
  args: { label: 'TRM', value: 4102, unit: 'cop', delta: { value: 0.2 } },
};

/** Missing value (CF-37): "—", never 0. */
export const Missing: Story = { args: { value: null, delta: { value: null } } };

/** Caption under the label (SCR-09 weight tiles: range). */
export const WithInfo: Story = {
  args: {
    label: 'Financiera',
    value: 45,
    unit: 'percent',
    decimals: 0,
    delta: { value: 2, unit: 'pts' },
    info: 'Rango 33–62',
    tone: 'brand',
  },
};

/** Every tone. */
export const Tones: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-12">
      {(['neutral', 'brand', 'info', 'success', 'warning', 'danger'] as const).map((tone) => (
        <KpiStatCard key={tone} label={tone} value={8} tone={tone} testId={`kpi-${tone}`} />
      ))}
    </div>
  ),
};

/** Centred tile (SCR-05 executive summary, prototype L264). */
export const Centered: Story = {
  args: {
    label: 'Total análisis',
    value: 8,
    align: 'center',
    className: 'rounded-card p-16 gap-2',
  },
};

/** Label above the value as a small muted caption (SCR-11 Monitor de Valor tiles). */
export const LabelAbove: Story = {
  args: {
    label: 'Cumplimiento global',
    value: 96.15,
    unit: 'percent',
    decimals: 0,
    tone: 'success',
    labelPosition: 'above',
  },
};
