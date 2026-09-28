import { Skeleton } from './Skeleton';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Composites/Skeleton',
  component: Skeleton,
  args: { shape: 'line', lines: 3 },
  argTypes: { shape: { control: 'inline-radio', options: ['line', 'block', 'circle'] } },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Text lines; the last one is shorter. Pulses unless the OS asks for reduced motion. */
export const Lines: Story = {};

export const Block: Story = { args: { shape: 'block', size: 160 } };

export const Circle: Story = { args: { shape: 'circle', size: 36 } };
