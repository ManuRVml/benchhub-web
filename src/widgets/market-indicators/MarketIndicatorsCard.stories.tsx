import { MarketIndicatorsCard } from './MarketIndicatorsCard';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'widgets/market-indicators/MarketIndicatorsCard',
  component: MarketIndicatorsCard,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof MarketIndicatorsCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default story with the 5 SCR-05 market indicator items.
 */
export const Default: Story = {
  args: {
    items: [
      { id: 'COLCAP', label: 'COLCAP', value: 42563.5, unit: 'points', deltaPct: 1.2, trend: 'up' },
      {
        id: 'cop_per_usd',
        label: 'COP/USD',
        value: 3945.8,
        unit: 'cop_per_usd',
        deltaPct: -0.8,
        trend: 'down',
      },
      { id: 'usd_bn', label: 'USD/B', value: 12.4, unit: 'usd_bn', deltaPct: 0.5, trend: 'up' },
      { id: 'kboe', label: 'KBOE', value: 712.3, unit: 'kboe', deltaPct: -1.1, trend: 'down' },
      {
        id: 'percent',
        label: 'Tasa de desempleo',
        value: 11.2,
        unit: 'percent',
        deltaPct: 0.3,
        trend: 'up',
      },
    ],
  },
};
