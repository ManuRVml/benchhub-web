import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';

import { API_BASE_URL, createHttpClient, ServiceContext } from '@/shared/api';
import { createMockPorts } from '@/shared/api/mock';
import { routes } from '@/shared/config';
import { ToastProvider } from '@/shared/ui/composites/toast';
import { presentationBuilderTestIds } from '@/widgets/presentation-builder';

import resultsHeaderFixture from '../../test/fixtures/contracts/V-09.response.json';
import { server } from '../../test/msw/server';
import { createQueryHarness } from '../../test/query-wrapper';

import { PresentationsPage } from './PresentationsPage';
import { presentationsPageTestIds } from './test-ids';

import type { PresentationBuilder, PresentationsListItem } from '@/entities/presentation';

const BUILDER: PresentationBuilder = {
  meta: { title: '', date: null, language: 'es', templateId: null },
  templates: [],
  includeCover: true,
  includeClosing: true,
  modules: [],
  slideCount: 2,
  notes: {},
  pendingNoteCount: 0,
  uploadedVersion: null,
  commentCount: 0,
  permissions: { canEdit: true, canPublish: true, canUpload: true, canDraftWithAssistant: true },
};

function serveBuilder(presentationId: string) {
  server.use(
    http.get(`${API_BASE_URL}/views/presentation-builder/${presentationId}`, () =>
      HttpResponse.json(BUILDER),
    ),
  );
}

const ROWS: PresentationsListItem[] = [
  {
    id: 'prs_directorio_t4',
    name: 'Directorio Ejecutivo T4',
    createdOn: '2025-10-02',
    status: 'published',
    publishedOn: '2025-10-05',
    permissions: { canEdit: true, canView: true },
  },
  {
    id: 'prs_storytelling',
    name: 'Storytelling de Mercado',
    createdOn: '2025-09-28',
    status: 'in_review',
    publishedOn: null,
    permissions: { canEdit: true, canView: true },
  },
];

function serveList(items: PresentationsListItem[] = ROWS, canCreate = true) {
  const requested: string[] = [];
  server.use(
    http.get(`${API_BASE_URL}/views/presentations`, ({ request }) => {
      requested.push(request.url);
      return HttpResponse.json({
        items,
        page: 1,
        pageSize: 20,
        totalItems: items.length,
        permissions: { canCreate },
      });
    }),
  );
  return requested;
}

function serveCreate(presentationId = 'prs_new') {
  const requested: unknown[] = [];
  server.use(
    http.post(`${API_BASE_URL}/presentations`, async ({ request }) => {
      requested.push(await request.json());
      return HttpResponse.json({ id: presentationId, createdAt: '2026-09-25T10:00:00Z' });
    }),
  );
  return requested;
}

function renderPage(initialPath: string = routes.presentations.build()) {
  const { wrapper: Providers } = createQueryHarness();
  return render(
    <Providers>
      <ToastProvider>
        <MemoryRouter initialEntries={[initialPath]}>
          <Routes>
            <Route path={routes.presentations.path} element={<PresentationsPage />} />
            <Route path={routes.presentationNew.path} element={<PresentationsPage />} />
            <Route path={routes.presentationEdit.path} element={<PresentationsPage />} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    </Providers>,
  );
}

describe('PresentationsPage (SCR-13)', () => {
  it('renders the list rows with es-CO dates, status and row actions', async () => {
    serveList();
    renderPage();

    const table = await screen.findByTestId(presentationsPageTestIds.table);
    expect(within(table).getByText('Directorio Ejecutivo T4')).toBeInTheDocument();
    expect(within(table).getByText('02 oct 2025')).toBeInTheDocument();
    expect(within(table).getByText('Publicado')).toBeInTheDocument();
    expect(within(table).getByText('05 oct 2025')).toBeInTheDocument();
    expect(within(table).getByText('Storytelling de Mercado')).toBeInTheDocument();
    expect(within(table).getByText('En revisión')).toBeInTheDocument();
    expect(within(table).getByText('—')).toBeInTheDocument();
    expect(
      screen.getByTestId(presentationsPageTestIds.editAction('prs_directorio_t4')),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(presentationsPageTestIds.viewAction('prs_directorio_t4')),
    ).toBeInTheDocument();
  });

  it('titles the list with an h2 and keeps its description in the "i" info panel (F0-3)', async () => {
    const user = userEvent.setup();
    serveList();
    renderPage();
    await screen.findByTestId(presentationsPageTestIds.table);

    // The app shell header is the page h1: the page renders no h1 of its own.
    expect(screen.queryByRole('heading', { level: 1 })).toBeNull();
    expect(screen.getByRole('heading', { level: 2, name: 'Presentaciones creadas' })).toBeVisible();
    const info = /^Editar reabre el asistente/;
    const panel = screen.getByTestId(presentationsPageTestIds.infoPanel);
    expect(panel).not.toBeVisible();
    expect(screen.queryByText(info)).not.toBeVisible();

    const toggle = screen.getByTestId(presentationsPageTestIds.infoToggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(panel).toBeVisible();
    expect(panel).toHaveAccessibleName('Presentaciones creadas');
    expect(panel).toHaveTextContent(info);
  });

  it('writes dates with the prototype 3-letter month ("28 sep 2025", HTML L3560)', async () => {
    serveList();
    renderPage();

    const table = await screen.findByTestId(presentationsPageTestIds.table);
    expect(within(table).getByText('28 sep 2025')).toBeInTheDocument();
  });

  it('"Ver detalle" is a filled brand button and "Editar" stays outlined (HTML L2378-2379)', async () => {
    serveList();
    renderPage();

    const view = await screen.findByTestId(
      presentationsPageTestIds.viewAction('prs_directorio_t4'),
    );
    expect(view).toBe(
      within(view.parentElement ?? document.body).getByRole('button', { name: 'Ver detalle' }),
    );
    expect(view).toHaveClass('bg-brand-primary', 'text-text-inverse', 'px-12', 'py-8', 'text-12');
    expect(view).not.toHaveClass('bg-transparent');

    const edit = screen.getByTestId(presentationsPageTestIds.editAction('prs_directorio_t4'));
    expect(edit).toHaveClass('border', 'border-border-default', 'bg-surface-card');
  });

  it('places "+ Crear presentación" below the table, not in the title row (HTML L2389)', async () => {
    serveList();
    renderPage();

    const table = await screen.findByTestId(presentationsPageTestIds.table);
    const create = screen.getByTestId(presentationsPageTestIds.createButton);
    expect(table.compareDocumentPosition(create) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    const title = screen.getByRole('heading', { level: 2, name: 'Presentaciones creadas' });
    expect(title.parentElement).not.toContainElement(create);
  });

  it('shows no analysis tabs on the global /presentaciones list', async () => {
    serveList();
    renderPage();
    await screen.findByTestId(presentationsPageTestIds.table);
    expect(screen.queryByRole('tablist', { name: 'Pestañas del análisis' })).toBeNull();
  });

  it('shows the analysis tabs (Presentación active) on the analysis route and navigates from them', async () => {
    serveList();
    server.use(
      http.get(`${API_BASE_URL}/views/results-header/:analysisId`, () =>
        HttpResponse.json(resultsHeaderFixture),
      ),
    );
    const { wrapper: Providers } = createQueryHarness();
    render(
      <Providers>
        <ToastProvider>
          <MemoryRouter
            initialEntries={[routes.analysisPresentations.build({ analysisId: 'ana_x' })]}
          >
            <Routes>
              <Route path={routes.analysisPresentations.path} element={<PresentationsPage />} />
              <Route path={routes.analysisResults.path} element={<p>{'results page'}</p>} />
            </Routes>
          </MemoryRouter>
        </ToastProvider>
      </Providers>,
    );

    const tabs = await screen.findByRole('tablist', { name: 'Pestañas del análisis' });
    expect(
      within(tabs)
        .getAllByRole('tab')
        .map((tab) => tab.textContent),
    ).toEqual(['Configuración', 'Resultados', 'Presentación']);
    expect(within(tabs).getByRole('tab', { name: 'Presentación' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await userEvent.setup().click(within(tabs).getByRole('tab', { name: 'Resultados' }));
    expect(await screen.findByText('results page')).toBeInTheDocument();
  });

  it('shows the empty state when there are no presentations', async () => {
    serveList([]);
    renderPage();
    expect(await screen.findByTestId(presentationsPageTestIds.empty)).toBeInTheDocument();
  });

  it('hides "+ Crear presentación" without canCreate', async () => {
    serveList(ROWS, false);
    renderPage();
    await screen.findByTestId(presentationsPageTestIds.table);
    expect(screen.queryByTestId(presentationsPageTestIds.createButton)).toBeNull();
  });

  it('"+ Crear presentación" creates a draft (C-27) then navigates to the builder route', async () => {
    serveList();
    const created = serveCreate('prs_new');
    serveBuilder('prs_new');
    renderPage();

    const user = userEvent.setup({ delay: null });
    await user.click(await screen.findByTestId(presentationsPageTestIds.createButton));

    expect(await screen.findByTestId(presentationBuilderTestIds.root)).toBeInTheDocument();
    expect(created).toEqual([{ analysisId: 'ana_01J9Y8D4T2' }]);
  });

  it('renders the builder directly on the /editar route, for the existing draft', async () => {
    serveBuilder('prs_existing');
    renderPage(routes.presentationEdit.build({ presentationId: 'prs_existing' }));
    expect(await screen.findByTestId(presentationBuilderTestIds.root)).toBeInTheDocument();
  });

  it('on /nueva, creates a draft for the ?analysisId= and replaces the URL with /editar', async () => {
    const created = serveCreate('prs_from_new');
    serveBuilder('prs_from_new');
    renderPage(routes.presentationNew.build({}, { analysisId: 'ana_custom' }));

    expect(await screen.findByTestId(presentationBuilderTestIds.root)).toBeInTheDocument();
    expect(created).toEqual([{ analysisId: 'ana_custom' }]);
  });
});

// The mock-mode regression class: in `VITE_API_MODE=mock` there is no network and the raw client is a stub that rejects,
// so a page that still called `services.http` would render its error state. Here the services are the real mock
// adapters and the raw client's fetch rejects, so only the typed ports can answer (no MSW handler is registered).
function renderInMockMode(initialPath: string) {
  const noNetwork = createHttpClient({
    fetch: () => Promise.reject(new TypeError('mock mode has no network')),
  });
  const services = { ...createMockPorts(), http: noNetwork, mode: 'mock' as const };
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <ServiceContext.Provider value={services}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <MemoryRouter initialEntries={[initialPath]}>
            <Routes>
              <Route path={routes.presentations.path} element={<PresentationsPage />} />
              <Route path={routes.presentationEdit.path} element={<PresentationsPage />} />
            </Routes>
          </MemoryRouter>
        </ToastProvider>
      </QueryClientProvider>
    </ServiceContext.Provider>,
  );
}

describe('PresentationsPage in mock mode (real mock adapter, no network)', () => {
  // Strict guard: every raw network request fails, so only the typed ports can answer (the raw client stub and a
  // raw global fetch both get a network error).
  beforeEach(() => {
    server.use(http.all('*', () => HttpResponse.error()));
  });

  it('lists the V-40 fixture rows', async () => {
    renderInMockMode(routes.presentations.build());
    const table = await screen.findByTestId(presentationsPageTestIds.table);
    expect(within(table).getByText('Directorio Ejecutivo T4')).toBeInTheDocument();
    expect(within(table).getByText('Storytelling de Mercado')).toBeInTheDocument();
    expect(within(table).getByText('Resumen Sensibilidades Q3')).toBeInTheDocument();
  });

  it('renders the builder from the V-41 fixture on the /editar route', async () => {
    renderInMockMode(routes.presentationEdit.build({ presentationId: 'prs_directorio_t4' }));
    expect(await screen.findByTestId(presentationBuilderTestIds.root)).toBeInTheDocument();
    expect(
      await screen.findByTestId(presentationBuilderTestIds.moduleToggle('comp')),
    ).toBeInTheDocument();
  });
});
