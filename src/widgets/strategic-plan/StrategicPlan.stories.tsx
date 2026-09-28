import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { createHttpClient, ServiceContext } from '@/shared/api';
import { createMockPorts } from '@/shared/api/mock';
import { ToastProvider } from '@/shared/ui/composites/toast';

import { StrategicPlan } from './StrategicPlan';

import type { ServiceContainer } from '@/shared/api';
import type { Meta, StoryObj } from '@storybook/react-vite';

// No global decorators / MSW addon in Storybook (docs/architecture/adding-a-screen.md §8): the widget calls
// `useServices()` through V-39 / C-25 / C-26 / C-14, so it needs its own ServiceContext + QueryClientProvider, plus
// ToastProvider for the save confirmation. `mode: 'mock'` serves V-39 from its docs fixture and the commands from
// the vendored mock port.
const mockServices: ServiceContainer = {
  ...createMockPorts(),
  http: createHttpClient(),
  mode: 'mock',
};
const storyQueryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

const meta = {
  title: 'Widgets/StrategicPlan',
  component: StrategicPlan,
  args: { analysisId: 'ana_01J9Y8D4T2' },
  decorators: [
    (Story) => (
      <ServiceContext.Provider value={mockServices}>
        <QueryClientProvider client={storyQueryClient}>
          <ToastProvider>
            <Story />
          </ToastProvider>
        </QueryClientProvider>
      </ServiceContext.Provider>
    ),
  ],
} satisfies Meta<typeof StrategicPlan>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
