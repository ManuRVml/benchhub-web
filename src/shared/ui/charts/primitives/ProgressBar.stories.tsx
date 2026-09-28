import { formatPercent } from '@/shared/lib/format';

import { coverageTone } from './bar-math';
import { ProgressBar } from './ProgressBar';

import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';

const narrow: Decorator = (Story) => (
  <div className="max-w-xl">
    <Story />
  </div>
);

// Prototype C3 "Cobertura de datos por empresa": coverage % per company, tone by the 90 / 70 thresholds.
const COVERAGE = [
  { company: 'Chevron', value: 96 },
  { company: 'Shell', value: 88 },
  { company: 'Repsol', value: 74 },
  { company: 'ISA', value: 52 },
] as const;

const meta = {
  title: 'Charts/Primitives/ProgressBar',
  component: ProgressBar,
  args: {
    value: 96,
    tone: 'success',
    height: 5,
    'aria-label': 'Cobertura Chevron',
    valueText: formatPercent(96, { decimals: 0 }),
  },
  argTypes: {
    tone: {
      control: 'inline-radio',
      options: ['success', 'warning', 'danger', 'brand', 'highlight'],
    },
    height: { control: 'inline-radio', options: [5, 6, 8] },
  },
  decorators: [narrow],
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Complete: Story = {};

export const Partial: Story = {
  args: {
    value: 88,
    tone: 'warning',
    'aria-label': 'Cobertura Shell',
    valueText: formatPercent(88, { decimals: 0 }),
  },
};

export const Missing: Story = { args: { value: null, 'aria-label': 'Cobertura ISA' } };

export const CoverageList: Story = {
  render: () => (
    <ul className="grid gap-8">
      {COVERAGE.map(({ company, value }) => (
        <li key={company} className="grid grid-cols-[auto_1fr_auto] items-center gap-8">
          <span className="text-small text-text-body">{company}</span>
          <ProgressBar
            value={value}
            tone={coverageTone(value)}
            aria-label={company}
            valueText={formatPercent(value, { decimals: 0 })}
          />
          <span className="font-mono text-small text-text-body">
            {formatPercent(value, { decimals: 0 })}
          </span>
        </li>
      ))}
    </ul>
  ),
};
