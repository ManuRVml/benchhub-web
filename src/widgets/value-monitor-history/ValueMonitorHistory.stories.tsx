import { useState } from 'react';

import { ValueMonitorHistory } from './ValueMonitorHistory';

import type { ValueMonitorHistoryRangeId } from './ValueMonitorHistory';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Widgets/ValueMonitorHistory',
  component: ValueMonitorHistory,
} satisfies Meta<typeof ValueMonitorHistory>;

export default meta;
type Story = StoryObj;

const POINTS_BY_RANGE: Record<ValueMonitorHistoryRangeId, { year: number; value: number }[]> = {
  actual: [
    { year: 2024, value: 6.2 },
    { year: 2025, value: 7.8 },
  ],
  '5y': [
    { year: 2021, value: 5.9 },
    { year: 2022, value: 6.5 },
    { year: 2023, value: 7.1 },
    { year: 2024, value: 7.4 },
    { year: 2025, value: 7.8 },
  ],
  '8y': [
    { year: 2018, value: 5.7 },
    { year: 2019, value: 6.0 },
    { year: 2020, value: 4.2 },
    { year: 2021, value: 5.9 },
    { year: 2022, value: 6.5 },
    { year: 2023, value: 7.1 },
    { year: 2024, value: 7.4 },
    { year: 2025, value: 7.8 },
  ],
  '10y': [
    { year: 2016, value: 8.8 },
    { year: 2017, value: 6.9 },
    { year: 2018, value: 5.7 },
    { year: 2019, value: 6.0 },
    { year: 2020, value: 4.2 },
    { year: 2021, value: 5.9 },
    { year: 2022, value: 6.5 },
    { year: 2023, value: 7.1 },
    { year: 2024, value: 7.4 },
    { year: 2025, value: 7.8 },
  ],
};

export const Default: Story = {
  render: () => {
    function Wrapper() {
      const [range, setRange] = useState<ValueMonitorHistoryRangeId>('actual');
      return (
        <ValueMonitorHistory
          range={range}
          onRangeChange={setRange}
          points={POINTS_BY_RANGE[range]}
        />
      );
    }
    return <Wrapper />;
  },
};
