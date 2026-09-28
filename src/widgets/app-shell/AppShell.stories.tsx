import { createMemoryRouter, Outlet, RouterProvider } from 'react-router';
import { fn } from 'storybook/test';

import { mockSession } from '@/entities/session';
import { routes } from '@/shared/config';
import { t } from '@/shared/i18n';
import { useLayoutStore } from '@/shared/model';

import { AppShell } from './AppShell';
import { shellNavigationFromSession } from './navigation';

import type { Role } from '@/entities/session';
import type { Meta, StoryObj } from '@storybook/react-vite';

// The shell needs a data router (titles come from the matched route); each story mounts one at the given URL with a
// placeholder page. Names and counts are the prototype's mock data (SCR-04: "Camila Bravo", 11 unread).
interface ShellStoryArgs {
  role: Role;
  url: string;
  collapsed: boolean;
  unread?: number;
  displayName: string;
}

function ShellStory({ role, url, collapsed, unread, displayName }: ShellStoryArgs) {
  useLayoutStore.setState({ sidebarCollapsed: collapsed });
  const router = createMemoryRouter(
    [
      {
        id: 'app-shell',
        element: (
          <AppShell
            user={{ displayName }}
            navigation={shellNavigationFromSession(mockSession(role))}
            unreadNotifications={unread}
            onLogout={fn()}
            onHelp={fn()}
          >
            <Outlet />
          </AppShell>
        ),
        children: (['home', 'valueMonitor', 'presentations', 'notifications'] as const).map(
          (key) => ({
            id: key,
            path: routes[key].path,
            element: <p className="text-body text-text-body">{t('common.section.empty')}</p>,
          }),
        ),
      },
    ],
    { initialEntries: [url] },
  );
  return <RouterProvider router={router} />;
}

const meta = {
  title: 'Widgets/AppShell',
  component: ShellStory,
  args: {
    role: 'analyst_creator',
    url: routes.home.build(),
    collapsed: false,
    unread: 11,
    displayName: 'Camila Bravo',
  },
  argTypes: {
    role: {
      control: 'select',
      options: [
        'analyst_creator',
        'explorer_viewer',
        'explorer_integral',
        'executive_viewer',
        'executive_integral',
      ],
    },
  },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ShellStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Expanded: Story = {};

export const Collapsed: Story = { args: { collapsed: true } };

export const NoUnread: Story = { args: { unread: 0 } };

export const OnMonitor: Story = { args: { url: routes.valueMonitor.build() } };

/** explorer_viewer: Presentaciones locked. */
export const ExplorerViewer: Story = {
  args: { role: 'explorer_viewer', displayName: 'Explorador visualizador' },
};

/** executive_viewer: both "Ref." rows locked. */
export const ExecutiveViewer: Story = {
  args: { role: 'executive_viewer', displayName: 'Jorge Salas' },
};

export const ExecutiveIntegral: Story = {
  args: { role: 'executive_integral', displayName: 'Alejandra Ríos' },
};
