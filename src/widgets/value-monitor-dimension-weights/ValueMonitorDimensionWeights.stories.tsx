import { ValueMonitorDimensionWeights } from './ValueMonitorDimensionWeights';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Widgets/ValueMonitorDimensionWeights',
  component: ValueMonitorDimensionWeights,
} satisfies Meta<typeof ValueMonitorDimensionWeights>;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: { fin: 45, op: 30, trans: 25 },
};
