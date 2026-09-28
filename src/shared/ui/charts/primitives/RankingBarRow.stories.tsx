import { maxAbs } from './bar-math';
import { RankingBarRow } from './RankingBarRow';

import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';

const narrow: Decorator = (Story) => (
  <div className="max-w-xl">
    <Story />
  </div>
);

// Prototype C6 / C8: ranking of ROACE (%) across the peer set, Ecopetrol row highlighted.
const RANKING = [
  { company: 'Ecopetrol', value: 10.2 },
  { company: 'ConocoPhillips', value: 9 },
  { company: 'Chevron', value: 8.1 },
  { company: 'Shell', value: 7.4 },
  { company: 'Petrobras', value: -2.3 },
  { company: 'Repsol', value: null },
] as const;
const MAX = maxAbs(RANKING.map((row) => row.value));

const meta = {
  title: 'Charts/Primitives/RankingBarRow',
  component: RankingBarRow,
  args: { rank: 1, label: 'Ecopetrol', value: 10.2, max: MAX, size: 16 },
  argTypes: {
    highlight: { control: 'inline-radio', options: ['ecopetrol', 'leader'] },
    size: { control: 'inline-radio', options: [16, 18] },
  },
  decorators: [narrow],
} satisfies Meta<typeof RankingBarRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ecopetrol: Story = { args: { highlight: 'ecopetrol' } };

export const Leader: Story = { args: { label: 'ConocoPhillips', value: 9, highlight: 'leader' } };

export const Peer: Story = { args: { rank: 3, label: 'Chevron', value: 8.1 } };

/** OQ-10: signed label, absolute length. */
export const Negative: Story = { args: { rank: 5, label: 'Petrobras', value: -2.3 } };

export const Missing: Story = { args: { rank: 6, label: 'Repsol', value: null } };

export const Ranking: Story = {
  render: (args) => (
    <ol className="grid gap-2">
      {RANKING.map((row, index) => (
        <li key={row.company}>
          <RankingBarRow
            {...args}
            rank={index + 1}
            label={row.company}
            value={row.value}
            {...(row.company === 'Ecopetrol' ? { highlight: 'ecopetrol' as const } : {})}
          />
        </li>
      ))}
    </ol>
  ),
};
