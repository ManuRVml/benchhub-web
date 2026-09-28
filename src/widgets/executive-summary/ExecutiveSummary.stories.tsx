import { ExecutiveSummary } from './ExecutiveSummary';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'widgets/executive-summary/ExecutiveSummary',
  component: ExecutiveSummary,
} satisfies Meta<typeof ExecutiveSummary>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data: {
      total: 8,
      active: 6,
      published: 3,
      inProgress: 2,
      avgCoveragePct: 82,
    },
  },
};
