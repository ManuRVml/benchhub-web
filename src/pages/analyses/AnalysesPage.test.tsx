// @vitest-environment jsdom
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter, useLocation } from 'react-router';
import { describe, expect, it } from 'vitest';

import { API_BASE_URL } from '@/shared/api';

import { server } from '../../test/msw/server';
import { createQueryHarness } from '../../test/query-wrapper';

import { AnalysesPage } from './AnalysesPage';
import { analysesPageTestIds } from './test-ids';

const VIEW_PATH = `${API_BASE_URL}/views/analyses`;
const CREATE_DRAFT_PATH = `${API_BASE_URL}/analysis-drafts`;

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location">{`${location.pathname}${location.search}`}</output>;
}

let lastQueryClient: ReturnType<typeof createQueryHarness>['queryClient'] | undefined;

/** Filters of every V-04 query the page has run (the `useAnalysesView` query keys). */
function analysesQueryFilters(): unknown[] {
  return (lastQueryClient?.getQueryCache().findAll() ?? [])
    .map((query) => query.queryKey.at(-1))
    .filter((part) => typeof part === 'object' && part !== null && 'status' in part);
}

function renderPage(initialPath = '/analisis') {
  const { wrapper: QueryHarness, queryClient } = createQueryHarness();
  lastQueryClient = queryClient;
  return render(
    <QueryHarness>
      <MemoryRouter initialEntries={[initialPath]}>
        <AnalysesPage />
        <LocationProbe />
      </MemoryRouter>
    </QueryHarness>,
  );
}

describe('AnalysesPage', () => {
  it('renders the list from the ok-scenario MSW handler', async () => {
    renderPage();
    expect(await screen.findByTestId(analysesPageTestIds.root)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText('Cargando…')).not.toBeInTheDocument();
    });
  });

  it('URL filters survive a refresh: typing in search updates the URL, and re-mounting from that URL restores it', async () => {
    const user = userEvent.setup();
    const { unmount } = renderPage();
    await waitFor(() => {
      expect(screen.queryByText('Cargando…')).not.toBeInTheDocument();
    });

    const search = within(screen.getByTestId(`${analysesPageTestIds.search}-field`)).getByRole(
      'searchbox',
    );
    await user.type(search, 'ROACE');

    // useTypedSearchParams pushes into the router's history; read it back via a second mount from that URL, exactly
    // as a page refresh would start fresh from the address bar.
    unmount();
    renderPage('/analisis?q=ROACE');
    await waitFor(() => {
      expect(screen.queryByText('Cargando…')).not.toBeInTheDocument();
    });
    expect(
      within(screen.getByTestId(`${analysesPageTestIds.search}-field`)).getByRole('searchbox'),
    ).toHaveValue('ROACE');
    expect(screen.getByTestId(analysesPageTestIds.clearFilters)).toBeInTheDocument();
  });

  it('clear filters removes the query params and hides the clear button', async () => {
    const user = userEvent.setup();
    renderPage('/analisis?q=ROACE&estado=draft');
    await waitFor(() => {
      expect(screen.queryByText('Cargando…')).not.toBeInTheDocument();
    });
    expect(screen.getByTestId(analysesPageTestIds.clearFilters)).toBeInTheDocument();

    await user.click(screen.getByTestId(analysesPageTestIds.clearFilters));

    expect(screen.queryByTestId(analysesPageTestIds.clearFilters)).not.toBeInTheDocument();
    expect(
      within(screen.getByTestId(`${analysesPageTestIds.search}-field`)).getByRole('searchbox'),
    ).toHaveValue('');
  });

  it('clicking a row navigates without throwing (routes.analysisResults / analysisReport)', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => {
      expect(screen.queryByText('Cargando…')).not.toBeInTheDocument();
    });
    const rows = screen.queryAllByRole('row');
    const secondRow = rows[1];
    if (secondRow !== undefined) {
      await user.click(secondRow);
    }
  });

  it('creates a C-01 draft before opening step one of the definition wizard', async () => {
    const user = userEvent.setup();
    const bodies: unknown[] = [];
    server.use(
      http.post(CREATE_DRAFT_PATH, async ({ request }) => {
        bodies.push(await request.json());
        return HttpResponse.json({ draftId: 'drf_created_from_list' }, { status: 201 });
      }),
    );
    renderPage();

    await user.click(await screen.findByTestId(analysesPageTestIds.createButton));

    await waitFor(() => {
      expect(bodies).toEqual([{ type: 'generacion_valor' }]);
      expect(screen.getByTestId('location')).toHaveTextContent(
        '/analisis/drf_created_from_list/definicion?paso=1',
      );
    });
  });

  it('keeps the user on SCR-06 and shows an error toast when C-01 fails', async () => {
    const user = userEvent.setup();
    server.use(
      http.post(CREATE_DRAFT_PATH, () =>
        HttpResponse.json(
          { code: 'INTERNAL_ERROR', message: 'No se pudo crear el borrador', traceId: 't-create' },
          { status: 500 },
        ),
      ),
    );
    renderPage();

    await user.click(await screen.findByTestId(analysesPageTestIds.createButton));

    expect(await screen.findByTestId('toast-error')).toHaveTextContent(
      'No se pudo cargar esta sección',
    );
    expect(screen.getByTestId('location')).toHaveTextContent('/analisis');
  });

  it('shows the error panel when the view request fails with 500, without a second h1', async () => {
    server.use(
      http.get(VIEW_PATH, () =>
        HttpResponse.json(
          { code: 'INTERNAL_ERROR', message: 'Fallo', traceId: 't' },
          { status: 500 },
        ),
      ),
    );
    renderPage();

    expect(await screen.findByTestId(analysesPageTestIds.error)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'No se pudo cargar esta sección',
    );
    expect(screen.queryAllByRole('heading', { level: 1 })).toHaveLength(0);
  });

  it('renders the prototype toolbar: an h2 list title, no "Análisis" subtitle, no page h1 (L385-L388)', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.queryByText('Cargando…')).not.toBeInTheDocument();
    });
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Todos los análisis creados',
    );
    expect(screen.queryAllByRole('heading', { level: 1 })).toHaveLength(0);
    expect(screen.queryByText('Análisis', { exact: true })).toBeNull();
  });

  it('filters with a full-width search and Fecha / Creador / Estado selects, no status chips (L390-L409)', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.queryByText('Cargando…')).not.toBeInTheDocument();
    });
    expect(screen.getByTestId(`${analysesPageTestIds.search}-field`)).toHaveClass('flex-1');
    const date = screen.getByRole('combobox', { name: 'Fecha' });
    const creator = screen.getByRole('combobox', { name: 'Creador' });
    const status = screen.getByRole('combobox', { name: 'Estado' });
    expect(within(date).getByRole('option', { name: 'Fecha: todas' })).toBeInTheDocument();
    expect(within(date).getByRole('option', { name: '03 oct 2025' })).toBeInTheDocument();
    expect(within(creator).getByRole('option', { name: 'Jorge Salas' })).toBeInTheDocument();
    expect(within(status).getByRole('option', { name: 'Borrador' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Borrador' })).toBeNull();
    expect(screen.queryByRole('button', { pressed: false })).toBeNull();
  });

  it('keeps the status filter state on ?estado= (migrated from the chips) and feeds the V-04 query', async () => {
    const user = userEvent.setup();
    renderPage('/analisis?estado=draft');

    const status = await screen.findByRole('combobox', { name: 'Estado' });
    await waitFor(() => {
      expect(status).toHaveValue('draft');
    });
    expect(analysesQueryFilters()).toContainEqual(expect.objectContaining({ status: 'draft' }));

    await user.selectOptions(status, 'published');
    expect(screen.getByTestId('location')).toHaveTextContent('estado=published');
    await waitFor(() => {
      expect(analysesQueryFilters()).toContainEqual(
        expect.objectContaining({ status: 'published' }),
      );
    });

    await user.selectOptions(screen.getByRole('combobox', { name: 'Creador' }), 'usr_01J9Y7C9JS');
    expect(screen.getByTestId('location')).toHaveTextContent('creador=usr_01J9Y7C9JS');
    await waitFor(() => {
      expect(analysesQueryFilters()).toContainEqual(
        expect.objectContaining({ status: 'published', createdBy: 'usr_01J9Y7C9JS' }),
      );
    });

    await user.selectOptions(screen.getByRole('combobox', { name: 'Fecha' }), '2025-10-03');
    expect(screen.getByTestId('location')).toHaveTextContent('fecha=2025-10-03');

    await user.selectOptions(status, '');
    expect(screen.getByTestId('location')).not.toHaveTextContent('estado=');
  });
});
