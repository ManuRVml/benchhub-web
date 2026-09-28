import { t } from '@/shared/i18n';
import { formatPercent } from '@/shared/lib/format';

import { RangeSlider } from './RangeSlider';

import type { Meta, StoryObj } from '@storybook/react-vite';

// SCR-12 simulation variables: brand-coloured thumb and range on the chart track (OQ-11).
const meta = {
  title: 'Primitives/Inputs/RangeSlider',
  component: RangeSlider,
  args: {
    label: t('sensitivities.sections.simulationVariables.productivityLabel'),
    min: -5,
    max: 10,
    step: 1,
    defaultValue: 0,
    formatValue: (value: number) => formatPercent(value, { decimals: 0 }),
  },
  decorators: [
    (Story) => (
      <div className="max-w-120">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RangeSlider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OperatingCosts: Story = {
  args: {
    label: t('sensitivities.sections.simulationVariables.operatingCostsLabel'),
    min: -15,
    max: 10,
    defaultValue: -5,
  },
};

export const Disabled: Story = { args: { disabled: true } };
