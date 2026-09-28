import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { PendingOverridesProvider } from '@/entities/analysis';
import { createHttpClient, ServiceContext } from '@/shared/api';
import { createMockPorts } from '@/shared/api/mock';
import { ToastProvider } from '@/shared/ui/composites/toast';

import { CompanyCoverage } from './CompanyCoverage';

import type { ServiceContainer } from '@/shared/api';
import type { Meta, StoryObj } from '@storybook/react-vite';

const mockServices: ServiceContainer = {
  ...createMockPorts(),
  http: createHttpClient(),
  mode: 'mock',
};
const storyQueryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

const meta = {
  title: 'Widgets/CompanyCoverage',
  component: CompanyCoverage,
  decorators: [
    (Story) => (
      <ServiceContext.Provider value={mockServices}>
        <QueryClientProvider client={storyQueryClient}>
          <ToastProvider>
            <PendingOverridesProvider>
              <Story />
            </PendingOverridesProvider>
          </ToastProvider>
        </QueryClientProvider>
      </ServiceContext.Provider>
    ),
  ],
} satisfies Meta<typeof CompanyCoverage>;

export default meta;
type Story = StoryObj;

const MODULE = {
  id: 'companyCoverage',
  order: 2,
  isGated: false,
  visibleInHorizons: ['tbg', 'ilp', 'union'] as const,
};

export const Default: Story = {
  args: {
    analysisId: 'ana_1',
    horizon: 'tbg',
    module: MODULE,
  },
};
