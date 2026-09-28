import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { mockSession } from '@/entities/session';
import { NotificationsPage } from '@/pages/notifications';
import { API_BASE_URL } from '@/shared/api';
import { routes } from '@/shared/config';
import { yarbisTestIds } from '@/widgets/yarbis-assistant';

import { server } from '../../test/msw/server';
import { createQueryHarness } from '../../test/query-wrapper';

import { ShellLayout } from './ShellLayout';

import type { ShellLayoutData } from './ShellLayout';

const SHELL_STATUS_PATH = `${API_BASE_URL}/views/shell-status`;
const RESULTS_HEADER_PATH = `${API_BASE_URL}/views/results-header/:analysisId`;

function serveShellStatus(unreadNotifications: number) {
  server.use(
    http.get(SHELL_STATUS_PATH, () => HttpResponse.json({ unreadNotifications, permissions: {} })),
  );
}

function renderShell(loaderData: ShellLayoutData, initialPath: string = routes.root.build()) {
  const { wrapper: Wrapper } = createQueryHarness();
  const router = createMemoryRouter(
    [
      {
        path: routes.root.path,
        loader: () => loaderData,
        Component: ShellLayout,
        children: [
          { path: routes.notifications.path, Component: NotificationsPage },
          {
            id: 'analysisResults',
            path: routes.analysisResults.path,
            Component: () => <p data-testid="results-page" />,
          },
          { index: true, Component: () => <p data-testid="page" /> },
        ],
      },
      { path: routes.login.path, Component: () => <p data-testid="login-page" /> },
    ],
    { initialEntries: [initialPath] },
  );
  render(
    <Wrapper>
      <RouterProvider router={router} />
    </Wrapper>,
  );
  return router;
}

describe('ShellLayout (P5-62c)', () => {
  it("shows V-01's real unread count as the header bell's dot", async () => {
    serveShellStatus(3);
    renderShell({ session: mockSession() });

    await screen.findByTestId('app-shell');
    expect(await screen.findByTestId('app-shell-bell-dot')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Notificaciones (3 sin leer)' })).toBeInTheDocument();
  });

  it('shows no dot when V-01 reports zero unread', async () => {
    serveShellStatus(0);
    renderShell({ session: mockSession() });

    await screen.findByTestId('app-shell');
    await waitFor(() => {
      expect(screen.queryByTestId('app-shell-bell-dot')).not.toBeInTheDocument();
    });
  });

  it("drops the bell badge after the notifications page's mark-all-read (C-36 invalidates V-01)", async () => {
    // V-01 reports 3 until C-36 has been served, then 0 -- the badge can only drop by refetching V-01.
    let markedAllRead = false;
    let releaseMarkAllRead = (): void => undefined;
    const gate = new Promise<void>((resolve) => {
      releaseMarkAllRead = resolve;
    });
    server.use(
      http.get(SHELL_STATUS_PATH, () =>
        HttpResponse.json({ unreadNotifications: markedAllRead ? 0 : 3, permissions: {} }),
      ),
      http.get(`${API_BASE_URL}/views/notifications`, () =>
        HttpResponse.json({
          items: [
            {
              id: 'ntf_1',
              type: 'dato',
              severity: 'info',
              text: 'Actualización de datos',
              createdAt: '2026-09-24T10:00:00-05:00',
              isRead: false,
              target: null,
            },
          ],
          page: 1,
          pageSize: 20,
          totalItems: 1,
          unreadCount: 1,
          permissions: { canMarkAsRead: true, canMarkAllAsRead: true },
        }),
      ),
      http.post(`${API_BASE_URL}/notifications/read-all`, async () => {
        await gate;
        markedAllRead = true;
        return HttpResponse.json({ read: true, count: 1 });
      }),
    );
    renderShell({ session: mockSession() }, routes.notifications.build());

    expect(
      await screen.findByRole('button', { name: 'Notificaciones (3 sin leer)' }),
    ).toBeInTheDocument();
    releaseMarkAllRead();

    await waitFor(() => {
      expect(screen.queryByTestId('app-shell-bell-dot')).not.toBeInTheDocument();
    });
  });
});

describe('ShellLayout header (F0-2)', () => {
  it('uses the V-09 analysis title in the shared header on Resultados', async () => {
    serveShellStatus(0);
    server.use(
      http.get(RESULTS_HEADER_PATH, () =>
        HttpResponse.json({
          analysis: {
            id: 'ana_1',
            title: 'Desempeño comparativo — 4T 2025',
            status: 'in_review',
            lifecycleState: 'preparation',
            periodLabel: { year: 2025, quarter: 4 },
          },
          horizon: 'tbg',
          horizonOptions: [],
          modules: [],
          companySet: [],
          analysisTabs: [],
          permissions: {},
        }),
      ),
    );
    renderShell({ session: mockSession() }, routes.analysisResults.build({ analysisId: 'ana_1' }));

    expect(await screen.findByTestId('results-page')).toBeInTheDocument();
    expect(await screen.findByTestId('app-shell-title')).toHaveTextContent(
      'Resultados · Desempeño comparativo — 4T 2025',
    );
  });

  it('opens the OVL-12 help dialog from the header "?" and closes it with "Contactar soporte"', async () => {
    const user = userEvent.setup();
    serveShellStatus(0);
    renderShell({ session: mockSession() });

    await screen.findByTestId('page');
    await user.click(screen.getByRole('button', { name: 'Ayuda y documentación' }));
    const dialog = await screen.findByRole('dialog', { name: 'Ayuda y documentación' });
    expect(dialog).toHaveTextContent('¿Cómo creo un nuevo análisis?');
    expect(dialog).toHaveTextContent('los 5 pasos de Definición');
    await user.click(screen.getByRole('button', { name: 'Contactar soporte' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it("shows the mock analyst's photo in the header", async () => {
    serveShellStatus(0);
    renderShell({ session: mockSession('analyst_creator') });

    await screen.findByTestId('page');
    const avatar = screen.getByTestId('avatar');
    expect(avatar.tagName).toBe('IMG');
    expect(avatar.getAttribute('src')).toMatch(/user-avatar\.webp$/);
  });
});

describe('ShellLayout logout', () => {
  // F15: logout reloads the app on /login (window.location.assign) so the bootstrap session is dropped.
  afterEach(() => {
    vi.unstubAllGlobals();
  });
  const stubAssign = () => {
    const assign = vi.fn();
    vi.stubGlobal('location', {
      assign,
      origin: window.location.origin,
      href: window.location.href,
    });
    return assign;
  };

  it('calls A-03 then reloads on /login', async () => {
    let logoutCalled = false;
    server.use(
      http.post(`${API_BASE_URL}/auth/logout`, () => {
        logoutCalled = true;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    renderShell({ session: mockSession('analyst_creator') });

    await screen.findByTestId('page');
    const assign = stubAssign();
    await userEvent.click(screen.getByTestId('app-shell-nav-logout'));

    await waitFor(() => {
      expect(assign).toHaveBeenCalledWith(routes.login.path);
    });
    expect(logoutCalled).toBe(true);
  });

  it('still reloads on /login even if the logout call fails (idempotent "Salir")', async () => {
    server.use(
      http.post(`${API_BASE_URL}/auth/logout`, () =>
        HttpResponse.json(
          { code: 'CSRF_INVALID', message: 'boom', traceId: 't1' },
          { status: 403 },
        ),
      ),
    );
    renderShell({ session: mockSession('analyst_creator') });

    await screen.findByTestId('page');
    const assign = stubAssign();
    await userEvent.click(screen.getByTestId('app-shell-nav-logout'));

    await waitFor(() => {
      expect(assign).toHaveBeenCalledWith(routes.login.path);
    });
  });
});

describe('ShellLayout Yarbis assistant (P5-31, CF-40)', () => {
  it('mounts the Yarbis FAB on a screen with an assistant context for a session that may use it', async () => {
    serveShellStatus(0);
    renderShell({ session: mockSession('analyst_creator') }, routes.notifications.build());

    await screen.findByTestId('app-shell');
    expect(await screen.findByTestId(yarbisTestIds.fab)).toBeInTheDocument();
  });

  it('hides the Yarbis FAB for a session without canUseAssistant (executive_viewer)', async () => {
    serveShellStatus(0);
    renderShell({ session: mockSession('executive_viewer') }, routes.notifications.build());

    await screen.findByTestId('app-shell');
    await waitFor(() => {
      expect(screen.queryByTestId(yarbisTestIds.fab)).not.toBeInTheDocument();
    });
  });

  it('mounts no Yarbis FAB on a route without an assistant screen', async () => {
    serveShellStatus(0);
    renderShell({ session: mockSession('analyst_creator') });

    await screen.findByTestId('page');
    await waitFor(() => {
      expect(screen.queryByTestId(yarbisTestIds.fab)).not.toBeInTheDocument();
    });
  });
});
