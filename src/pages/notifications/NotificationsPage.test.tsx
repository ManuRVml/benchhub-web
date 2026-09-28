import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter, useLocation } from 'react-router';
import { describe, expect, it } from 'vitest';

import { API_BASE_URL, queryKeys, TRACE_ID_HEADER } from '@/shared/api';

import { server } from '../../test/msw/server';
import { createQueryHarness } from '../../test/query-wrapper';

import { NotificationsPage } from './NotificationsPage';

import type { NotificationsView } from '@/entities/notifications';

// SCR-15 with V-44 / C-36 served by MSW (V-44 is not in contract 0.1.0's GET side yet).
const VIEW: NotificationsView = {
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
    {
      id: 'ntf_2',
      type: 'publicacion',
      severity: 'success',
      text: 'Se ha generado un nuevo informe',
      createdAt: '2026-09-23T10:00:00-05:00',
      isRead: true,
      target: null,
    },
  ],
  page: 1,
  pageSize: 20,
  totalItems: 2,
  unreadCount: 1,
  permissions: { canMarkAsRead: true, canMarkAllAsRead: true },
};

function serveView(view: NotificationsView | 'error' = VIEW) {
  const requests: string[] = [];
  server.use(
    http.get(`${API_BASE_URL}/views/notifications`, ({ request }) => {
      requests.push(new URL(request.url).search);
      return view === 'error'
        ? HttpResponse.json(
            { code: 'INTERNAL_ERROR', message: 'Fallo', traceId: 't' },
            { status: 500, headers: { [TRACE_ID_HEADER]: 't' } },
          )
        : HttpResponse.json(view);
    }),
  );
  return requests;
}

function serveMarkAllRead() {
  const requests: unknown[] = [];
  server.use(
    http.post(`${API_BASE_URL}/notifications/read-all`, async ({ request }) => {
      requests.push(await request.json());
      return HttpResponse.json({ read: true, count: 1 });
    }),
  );
  return requests;
}

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="notifications-location">{location.search}</output>;
}

function renderPage(initialPath = '/notificaciones') {
  const { wrapper: Providers } = createQueryHarness();
  return render(
    <Providers>
      <MemoryRouter initialEntries={[initialPath]}>
        <NotificationsPage />
        <LocationProbe />
      </MemoryRouter>
    </Providers>,
  );
}

describe('NotificationsPage (SCR-15)', () => {
  it('renders the real items', async () => {
    serveView();
    serveMarkAllRead();
    renderPage();

    expect(await screen.findByText('Actualización de datos')).toBeInTheDocument();
    expect(screen.getByText('Se ha generado un nuevo informe')).toBeInTheDocument();
    expect(screen.getAllByTestId('notification-card')).toHaveLength(2);
  });

  it('renders no in-content title: the app shell header is the page h1 (F0-3)', async () => {
    serveView();
    serveMarkAllRead();
    renderPage();

    await screen.findByText('Actualización de datos');
    expect(screen.queryByRole('heading', { level: 1 })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Notificaciones' })).toBeNull();
  });

  it('fires mark-all-read once on mount and the unread dot disappears', async () => {
    serveView();
    const requests = serveMarkAllRead();
    renderPage();

    // The optimistic update piggybacks on the same render the data first arrives in, so asserting a "before" dot
    // would race the effect; what's actually under test is the end state plus the single real request.
    await screen.findByText('Actualización de datos');
    await waitFor(() => {
      expect(screen.queryByLabelText('Sin leer')).toBeNull();
    });
    expect(requests).toHaveLength(1);
  });

  it('does not re-fire mark-all-read on a background refetch, even though the GET keeps returning unreadCount > 0', async () => {
    // `serveView` answers the same fixture (unreadCount: 1) on every call, unaffected by the mutation — the guard,
    // not the optimistic zeroing, is what's under test here.
    serveView();
    const requests = serveMarkAllRead();
    const { wrapper: Providers, queryClient } = createQueryHarness();
    render(
      <Providers>
        <MemoryRouter>
          <NotificationsPage />
        </MemoryRouter>
      </Providers>,
    );

    await screen.findByText('Actualización de datos');
    await waitFor(() => {
      expect(requests).toHaveLength(1);
    });

    await queryClient.refetchQueries({ queryKey: queryKeys.notifications() });
    await screen.findByText('Actualización de datos');

    expect(requests).toHaveLength(1);
  });

  it('debounces search into the URL and V-44 request', async () => {
    const requests = serveView();
    serveMarkAllRead();
    renderPage();
    const user = userEvent.setup({ delay: null });

    await screen.findAllByTestId('notification-card');
    await user.type(screen.getByTestId('notifications-search'), 'informe');

    await waitFor(() => {
      expect(screen.getByTestId('notifications-location')).toHaveTextContent('?q=informe');
      expect(requests).toContain('?q=informe');
    });
  });

  it('writes a severity selection to the URL and V-44 request', async () => {
    const requests = serveView();
    serveMarkAllRead();
    renderPage();
    const user = userEvent.setup({ delay: null });

    await screen.findAllByTestId('notification-card');
    await user.click(screen.getByTestId('notifications-severity-chip-chip-info'));

    await waitFor(() => {
      expect(new URLSearchParams(screen.getByTestId('notifications-location').textContent)).toEqual(
        new URLSearchParams('severidad=info'),
      );
      expect(requests).toContain('?severity=info');
    });
    expect(screen.getByTestId('notifications-severity-chip-chip-info')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('shows a "Severidad" label and sentence-case on/off toggles, none on by default (SCR-15)', async () => {
    serveView();
    serveMarkAllRead();
    renderPage();

    await screen.findAllByTestId('notification-card');
    const filter = screen.getByTestId('notifications-severity-filter');
    expect(filter).toHaveTextContent('Severidad');
    const toggles = within(filter).getAllByRole('button');
    expect(toggles.map((toggle) => toggle.textContent)).toEqual([
      'Info',
      'OK',
      'Atención',
      'Crítico',
    ]);
    for (const toggle of toggles) {
      expect(toggle).toHaveAttribute('aria-pressed', 'false');
      expect(toggle).toHaveClass('bg-surface-page', 'text-text-secondary', 'rounded-control');
    }
  });

  it('renders each card with the severity left border, the type icon circle, the tag on the right and a capitalised time', async () => {
    serveView();
    serveMarkAllRead();
    renderPage();

    const cards = await screen.findAllByTestId('notification-card');
    const first = cards[0] ?? document.body;
    const second = cards[1];
    expect(first).toHaveClass('border-l-3', 'border-l-severity-info-base', 'items-center');
    expect(second).toHaveClass('border-l-severity-success-base');
    const icon = within(first).getByTestId('notification-card-icon');
    expect(icon).toHaveAttribute('data-type', 'dato');
    expect(icon).toHaveClass('size-(--size-notification-type-icon)', 'rounded-pill');
    expect(icon.querySelector('svg')).not.toBeNull();
    const tag = within(first).getByTestId('notification-card-tag');
    expect(tag).toHaveTextContent('INFO');
    expect(first.lastElementChild).toBe(tag);
    expect(within(first).getByTestId('notification-card-time').textContent).toMatch(/^Hace /);
  });

  it('constrains the list to the 760px column (size token, not the 4px spacing scale)', async () => {
    serveView();
    serveMarkAllRead();
    renderPage();

    await screen.findAllByTestId('notification-card');
    const page = screen.getByTestId('notifications-page');
    expect(page).toHaveClass('max-w-(--size-layout-max-width-notificaciones)', 'gap-14');
    expect(page).not.toHaveClass('max-w-760');
  });

  it('prefills URL filters and sends both values to V-44', async () => {
    const requests = serveView();
    serveMarkAllRead();
    renderPage('/notificaciones?q=x&severidad=error');

    expect(await screen.findByTestId('notifications-search')).toHaveValue('x');
    expect(screen.getByTestId('notifications-severity-chip-chip-error')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByTestId('notifications-severity-chip-chip-info')).toHaveAttribute(
      'aria-pressed',
      'false',
    );

    await waitFor(() => {
      expect(requests).toContain('?q=x&severity=error');
    });
  });

  it('an API error shows retry without crashing', async () => {
    serveView('error');
    renderPage();

    expect(await screen.findByTestId('notifications-error')).toBeInTheDocument();
    expect(screen.getByTestId('notifications-error-action')).toBeInTheDocument();
  });
});
