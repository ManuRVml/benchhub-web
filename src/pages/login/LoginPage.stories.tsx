import { MemoryRouter } from 'react-router';
import { fn } from 'storybook/test';

import { createHttpClient, ServiceContext } from '@/shared/api';
import { createMockPorts } from '@/shared/api/mock';

import { LoginPage } from './LoginPage';

import type { ServiceContainer } from '@/shared/api';
import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';

// "Ingresar" posts A-05 through the in-memory mock ports, which accept only the mock credential pair
// (ecopetrol@ecopetrol.com / ecopetrol) and answer anything else with the 401 INVALID_CREDENTIALS alert.
const mockServices: ServiceContainer = {
  ...createMockPorts(),
  http: createHttpClient(),
  mode: 'mock',
};

/** Renders /login with a query, as the router would (returnTo from the 401 handler, error from the callback). */
function atUrl(search: string): Decorator {
  return function LoginRoute(Story) {
    return (
      <ServiceContext.Provider value={mockServices}>
        <MemoryRouter initialEntries={[`/login${search}`]}>
          <Story />
        </MemoryRouter>
      </ServiceContext.Provider>
    );
  };
}

const meta = {
  title: 'Pages/Login (SCR-01)',
  component: LoginPage,
  // `redirect` replaces the full-page navigation after a successful login, so "Ingresar" stays in Storybook.
  args: { redirect: fn() },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof LoginPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { decorators: [atUrl('?returnTo=%2Finicio')] };

export const SessionExpired: Story = {
  decorators: [atUrl('?returnTo=%2Finicio&error=session_expired')],
};

export const AccessDenied: Story = { decorators: [atUrl('?error=access_denied')] };
