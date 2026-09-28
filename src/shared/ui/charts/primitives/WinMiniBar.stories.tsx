import { WinMiniBar } from './WinMiniBar';

import type { Meta, StoryObj } from '@storybook/react-vite';

// Prototype C2 "GE vs. par": indicators where Ecopetrol beats each peer.
const meta = {
  title: 'Charts/Primitives/WinMiniBar',
  component: WinMiniBar,
  args: { wins: 6, total: 10, 'aria-label': 'GE vs. Chevron', showLabel: true },
} satisfies Meta<typeof WinMiniBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllWins: Story = { args: { wins: 10, total: 10, 'aria-label': 'GE vs. Repsol' } };

export const NoWins: Story = { args: { wins: 0, total: 10, 'aria-label': 'GE vs. Shell' } };

export const WithoutLabel: Story = { args: { showLabel: false } };
