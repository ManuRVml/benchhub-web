import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { createHttpClient, ServiceContext } from '@/shared/api';
import { createMockPorts } from '@/shared/api/mock';

import { WeightSimulator } from './WeightSimulator';

import type { ServiceContainer } from '@/shared/api';
import type { Meta, StoryObj } from '@storybook/react-vite';

// No global decorators / MSW addon in Storybook (docs/architecture/adding-a-screen.md §8): the widget calls
// `useServices()` through V-38 / V-39 / C-24, so it needs its own ServiceContext + QueryClientProvider. `mode: 'mock'`
// serves V-38 / V-39 from their docs fixtures (src/test/fixtures/contracts) and C-24 from the vendored mock port.
const mockServices: ServiceContainer = {
  ...createMockPorts(),
  http: createHttpClient(),
  mode: 'mock',
};
const storyQueryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

const meta = {
  title: 'Widgets/WeightSimulator',
  component: WeightSimulator,
  decorators: [
    (Story) => (
      <ServiceContext.Provider value={mockServices}>
        <QueryClientProvider client={storyQueryClient}>
          <Story />
        </QueryClientProvider>
      </ServiceContext.Provider>
    ),
  ],
} satisfies Meta<typeof WeightSimulator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
