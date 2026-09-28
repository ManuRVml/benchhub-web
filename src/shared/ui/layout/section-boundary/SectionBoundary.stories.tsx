import { SectionBoundary } from './SectionBoundary';

import type { SectionBoundaryProps } from './SectionBoundary';
import type { Meta, StoryObj } from '@storybook/react-vite';

function StringListBoundary(props: SectionBoundaryProps<string[]>) {
  return <SectionBoundary {...props} />;
}

const SCOPE = 'home-peer-news';

const meta = {
  title: 'Layout/SectionBoundary',
  component: StringListBoundary,
  args: {
    scope: SCOPE,
    result: undefined,
    isLoading: false,
    children: (data: string[]) => (
      <ul data-testid="child">
        {data.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    ),
  },
  argTypes: {
    isLoading: { control: 'boolean' },
    isEmpty: { control: 'boolean' },
    onRetry: { control: 'boolean' },
  },
} satisfies Meta<typeof StringListBoundary>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Loading: while the result is undefined or isLoading is true. */
export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

/** Ready: renders children with the data. */
export const Ready: Story = {
  args: {
    result: { status: 'ok', data: ['Item 1', 'Item 2', 'Item 3'] },
  },
};

/** Empty: renders the empty slot instead of children. */
export const Empty: Story = {
  args: {
    result: { status: 'ok', data: [] },
    isEmpty: (items) => items.length === 0,
  },
};

/** Error: error panel with retry button. */
export const Error: Story = {
  args: {
    result: { status: 'error', errorCode: 'PROVIDER_TIMEOUT' },
    onRetry: () => {
      // Intentionally left empty - mock retry callback
    },
  },
};

/** Forbidden: hides the children, shows permission message. */
export const Forbidden: Story = {
  args: {
    result: { status: 'forbidden' },
  },
};
