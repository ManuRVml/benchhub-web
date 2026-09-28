import { StackedShareBar } from './StackedShareBar';

import type { StackedShareSegment } from './StackedShareBar';
import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';

const narrow: Decorator = (Story) => (
  <div className="max-w-xl">
    <Story />
  </div>
);

// Prototype C7 "Peso por dimensión": shares of the three dimensions for one company.
const DIMENSIONS: StackedShareSegment[] = [
  { id: 'financiera', label: 'Financiera', value: 45, tone: 'financiera' },
  { id: 'operativa', label: 'Operativa', value: 30, tone: 'operativa' },
  { id: 'transversal', label: 'Transversal', value: 25, tone: 'transversal' },
];

const meta = {
  title: 'Charts/Primitives/StackedShareBar',
  component: StackedShareBar,
  args: { segments: DIMENSIONS, 'aria-label': 'Peso por dimensión · Ecopetrol', size: 'md' },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md'] } },
  decorators: [narrow],
} satisfies Meta<typeof StackedShareBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** A tip open: the other segments dim to 30 %. */
export const TipOpen: Story = { args: { openSegmentId: 'operativa' } };

export const Small: Story = { args: { size: 'sm' } };
