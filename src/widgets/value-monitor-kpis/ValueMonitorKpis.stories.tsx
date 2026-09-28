import { ValueMonitorKpis } from './ValueMonitorKpis';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Widgets/ValueMonitorKpis',
  component: ValueMonitorKpis,
} satisfies Meta<typeof ValueMonitorKpis>;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: { globalPct: 96.15, retoPct: 78.56, atRiskCount: 1, tbdCount: 3 },
};

export const AtRisk: Story = {
  args: { globalPct: 65, retoPct: 40, atRiskCount: 6, tbdCount: 3 },
};
