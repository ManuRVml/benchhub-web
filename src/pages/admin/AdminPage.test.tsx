import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { API_BASE_URL, createHttpClient, ServiceContext } from '@/shared/api';
import { createMockPorts } from '@/shared/api/mock';
import { routes } from '@/shared/config';

import { server } from '../../test/msw/server';
import { createQueryHarness } from '../../test/query-wrapper';

import { AdminPage } from './AdminPage';
import { adminPageTestIds } from './test-ids';

// F15: logout reloads the app on /login (window.location.assign) so the bootstrap session is dropped.
function stubAssign() {
  const assign = vi.fn();
  vi.stubGlobal('location', { assign, origin: window.location.origin, href: window.location.href });
  return assign;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

const ADMIN_HOME_PATH = `${API_BASE_URL}/views/admin-home`;
const LOGOUT_PATH = `${API_BASE_URL}/auth/logout`;

const TITLES = {
  'users-roles': 'Usuarios y roles',
  'data-sources': 'Fuentes de datos',
  'companies-peers': 'Compañías y pares',
  'system-parameters': 'Parámetros del sistema',
  audit: 'Auditoría',
};

function serveAdminHome(cards: { id: string; isAvailable: boolean }[]) {
  server.use(http.get(ADMIN_HOME_PATH, () => HttpResponse.json({ cards, permissions: {} })));
}

function serveLogout(status = 204) {
  const calls: number[] = [];
  server.use(
    http.post(LOGOUT_PATH, () => {
      calls.push(Date.now());
      return status === 204
        ? new HttpResponse(null, { status: 204 })
        : HttpResponse.json({ code: 'INTERNAL_ERROR', message: 'Fallo', traceId: 't' }, { status });
    }),
  );
  return calls;
}

function routesTree() {
  return (
    <Routes>
      <Route path={routes.admin.path} element={<AdminPage />} />
      <Route path={routes.login.path} element={<p data-testid="login-page" />} />
    </Routes>
  );
}

function renderPage() {
  const { wrapper: Providers } = createQueryHarness();
  return render(
    <Providers>
      <MemoryRouter initialEntries={[routes.admin.build()]}>{routesTree()}</MemoryRouter>
    </Providers>,
  );
}

describe('AdminPage (SCR-03, V-02)', () => {
  it('renders the top bar chrome: the h1 and the back link to the access gate', () => {
    serveAdminHome([]);
    renderPage();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Administración · Back office',
    );
    expect(screen.getByRole('link', { name: '‹ Volver' })).toHaveAttribute('href', '/acceso');
  });

  it('renders the V-02 cards in contract order, with their i18n copy', async () => {
    // Deliberately not the prototype order: the order on screen must be the contract's.
    serveAdminHome([
      { id: 'audit', isAvailable: false },
      { id: 'system-parameters', isAvailable: false },
      { id: 'companies-peers', isAvailable: false },
      { id: 'data-sources', isAvailable: false },
      { id: 'users-roles', isAvailable: false },
    ]);
    renderPage();

    await screen.findByTestId(adminPageTestIds.card('audit'));
    const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(headings).toEqual([
      TITLES.audit,
      TITLES['system-parameters'],
      TITLES['companies-peers'],
      TITLES['data-sources'],
      TITLES['users-roles'],
    ]);
    expect(screen.getByTestId(adminPageTestIds.card('users-roles'))).toHaveTextContent(
      'Gestiona analistas, ejecutivos y permisos de acceso por rol.',
    );
    expect(screen.getByTestId(adminPageTestIds.card('audit'))).toHaveTextContent(
      'Historial de cambios, publicaciones y accesos a la herramienta.',
    );
  });

  it('ignores a card id the web has no copy for, without failing the others', async () => {
    serveAdminHome([
      { id: 'users-roles', isAvailable: false },
      { id: 'billing', isAvailable: true },
      { id: 'audit', isAvailable: false },
    ]);
    renderPage();

    await screen.findByTestId(adminPageTestIds.card('users-roles'));
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.queryByTestId(adminPageTestIds.card('billing'))).not.toBeInTheDocument();
    expect(screen.getByTestId(adminPageTestIds.card('audit'))).toBeInTheDocument();
  });

  it("exposes each card's availability from the contract", async () => {
    serveAdminHome([
      { id: 'users-roles', isAvailable: true },
      { id: 'audit', isAvailable: false },
    ]);
    renderPage();

    expect(await screen.findByTestId(adminPageTestIds.card('users-roles'))).toHaveAttribute(
      'data-available',
      'true',
    );
    expect(screen.getByTestId(adminPageTestIds.card('audit'))).toHaveAttribute(
      'data-available',
      'false',
    );
  });

  it('shows the error state when V-02 fails and the retry loads the cards', async () => {
    // Every attempt fails (the query client retries a 5xx), so the error state is reached; the handler is swapped
    // before the retry click.
    server.use(
      http.get(ADMIN_HOME_PATH, () =>
        HttpResponse.json(
          { code: 'INTERNAL_ERROR', message: 'Fallo', traceId: 't' },
          { status: 500 },
        ),
      ),
    );
    const user = userEvent.setup({ delay: null });
    renderPage();

    expect(await screen.findByTestId('admin-home-section-error')).toBeInTheDocument();
    // The top bar is chrome: it stays while the grid is in error.
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();

    serveAdminHome([{ id: 'audit', isAvailable: false }]);
    await user.click(screen.getByTestId('admin-home-section-retry'));

    expect(await screen.findByTestId(adminPageTestIds.card('audit'))).toBeInTheDocument();
    expect(screen.queryByTestId('admin-home-section-error')).not.toBeInTheDocument();
  });

  it('"Cerrar sesión" calls A-03 and then reloads on /login (F15)', async () => {
    serveAdminHome([]);
    const calls = serveLogout();
    const user = userEvent.setup({ delay: null });
    renderPage();
    const assign = stubAssign();

    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }));

    await waitFor(() => {
      expect(assign).toHaveBeenCalledWith('/login');
    });
    expect(calls).toHaveLength(1);
  });

  it('reloads on /login even when A-03 fails', async () => {
    serveAdminHome([]);
    const calls = serveLogout(500);
    const user = userEvent.setup({ delay: null });
    renderPage();
    const assign = stubAssign();

    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }));

    await waitFor(() => {
      expect(assign).toHaveBeenCalledWith('/login');
    });
    expect(calls).toHaveLength(1);
  });
});

// The mock-mode regression class: with no network and a raw client that rejects, only the typed ports can answer, so
// a page that still called `services.http` would render its error state.
describe('AdminPage in mock mode (real mock adapter, no network)', () => {
  beforeEach(() => {
    server.use(http.all('*', () => HttpResponse.error()));
  });

  it('renders the five V-02 fixture cards through the mock adapter', async () => {
    const noNetwork = createHttpClient({
      fetch: () => Promise.reject(new TypeError('mock mode has no network')),
    });
    const services = { ...createMockPorts(), http: noNetwork, mode: 'mock' as const };
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <ServiceContext.Provider value={services}>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={[routes.admin.build()]}>{routesTree()}</MemoryRouter>
        </QueryClientProvider>
      </ServiceContext.Provider>,
    );

    expect(await screen.findByTestId(adminPageTestIds.card('users-roles'))).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getAllByRole('listitem')).toHaveLength(5);
    });
    expect(screen.queryByTestId('admin-home-section-error')).not.toBeInTheDocument();
  });
});
