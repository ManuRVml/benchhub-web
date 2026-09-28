import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it, afterEach } from 'vitest';

import { mockSession, SessionContext } from '@/entities/session';
import { API_BASE_URL } from '@/shared/api';
import { routes } from '@/shared/config';

import { server } from '../../test/msw/server';
import { createQueryHarness } from '../../test/query-wrapper';

import { HomePage } from './HomePage';

import type { V03Response } from '@/shared/api/ports/responses';

type GetHomeViewResponse = V03Response;

const URL_HOME = routes.home.build();

const mockBanner = {
  status: 'ok' as const,
  data: {
    text: 'Prueba de insight de Yarbis',
    aiStatus: 'suggestion' as const,
  },
};

const mockExecutiveSummary = {
  status: 'ok' as const,
  data: {
    total: 10,
    active: 8,
    published: 4,
    inProgress: 3,
    avgCoveragePct: 92,
  },
};

const mockEnabledAnalyses = {
  status: 'ok' as const,
  data: [
    {
      id: 'analisis-1',
      title: 'Análisis de prueba 1',
      status: 'published' as const,
      description: 'Descripción del análisis 1',
      updatedAt: '2026-09-24T10:00:00-05:00',
      ownerName: 'Juan Pérez',
      targetRoute: '/analisis/analisis-1/resultados',
    },
  ],
};

const mockPeerNews = {
  status: 'ok' as const,
  data: [
    {
      id: 'noticia-1',
      companyId: 'empresa-1',
      companyName: 'Empresa 1',
      colorKey: 'empresa-1',
      initials: 'EP',
      impact: 'up' as const,
      headline: 'Noticia de prueba',
      source: 'Fuente de prueba',
    },
  ],
};

const mockMarketIndicators = {
  status: 'ok' as const,
  data: [
    {
      id: 'indicador-1',
      label: 'Indicator 1',
      value: 100,
      unit: 'cop' as const,
      deltaPct: 5,
      trend: 'up' as const,
    },
  ],
};

const buildMockResponse = (overrides?: Partial<GetHomeViewResponse>): GetHomeViewResponse => ({
  permissions: {},
  banner: mockBanner,
  executiveSummary: mockExecutiveSummary,
  enabledAnalyses: mockEnabledAnalyses,
  peerNews: mockPeerNews,
  marketIndicators: mockMarketIndicators,
  ...overrides,
});

function serve(response: GetHomeViewResponse) {
  server.use(http.get(`${API_BASE_URL}/views/home`, () => HttpResponse.json(response)));
}

function renderPage() {
  const { wrapper: Providers } = createQueryHarness();
  return render(
    <Providers>
      <SessionContext.Provider value={mockSession('analyst_creator')}>
        <MemoryRouter initialEntries={[URL_HOME]}>
          <Routes>
            <Route path={routes.home.path} element={<HomePage />} />
          </Routes>
        </MemoryRouter>
      </SessionContext.Provider>
    </Providers>,
  );
}

/** The page title is the shell header's h1 (AppHeader); the page itself must not add a second one. */
function expectNoPageH1() {
  expect(screen.queryAllByRole('heading', { level: 1 })).toHaveLength(0);
}

describe('HomePage (SCR-05 Inicio)', () => {
  afterEach(() => {
    server.resetHandlers();
  });

  it('renders all 5 sections with data', async () => {
    serve(buildMockResponse());
    renderPage();

    expectNoPageH1();
    expect(await screen.findByText('Yarbis:')).toBeInTheDocument();
    expect(screen.getByText('Prueba de insight de Yarbis')).toBeInTheDocument();
    expect(screen.getByText('Resumen ejecutivo')).toBeInTheDocument();
    expect(screen.getByText('Total análisis')).toBeInTheDocument();
    expect(screen.getByText('Análisis habilitados')).toBeInTheDocument();
    expect(screen.getByText('Noticias de los pares')).toBeInTheDocument();
    expect(screen.getByText('Indicadores de mercado')).toBeInTheDocument();
  });

  it('spans the content area with 28px between sections (no undefined max-width token)', async () => {
    serve(buildMockResponse());
    renderPage();
    expect(await screen.findByText('Yarbis:')).toBeInTheDocument();
    const page = screen.getByTestId('home-page');
    expect(page).toHaveClass('flex', 'flex-col', 'gap-section');
    expect(page.className).not.toMatch(/max-w-/);
  });

  it('handles per-section forbidden state while other sections render', async () => {
    serve(
      buildMockResponse({
        executiveSummary: { status: 'forbidden' as const },
      }),
    );
    renderPage();

    expectNoPageH1();
    expect(await screen.findByText('Yarbis:')).toBeInTheDocument();
    expect(screen.getByText('No tienes permiso para ver esta sección.')).toBeInTheDocument();
    expect(screen.getByText('Análisis habilitados')).toBeInTheDocument();
    expect(screen.getByText('Noticias de los pares')).toBeInTheDocument();
  });

  it('handles per-section error state with retry button', async () => {
    serve(
      buildMockResponse({
        executiveSummary: { status: 'error' as const, errorCode: 'ACCESS_DENIED' },
      }),
    );
    renderPage();

    expectNoPageH1();
    expect(await screen.findByText('No se pudo cargar esta sección.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
    expect(screen.getByText('Análisis habilitados')).toBeInTheDocument();
  });

  it('handles partial degradation when peer-news errors while other sections render', async () => {
    serve(
      buildMockResponse({
        peerNews: { status: 'error' as const, errorCode: 'NETWORK_ERROR' },
      }),
    );
    renderPage();

    expectNoPageH1();
    expect(await screen.findByText('Yarbis:')).toBeInTheDocument();
    expect(await screen.findByTestId('home-peer-news-section-error')).toBeInTheDocument();
    expect(screen.getByText('Análisis habilitados')).toBeInTheDocument();
    expect(screen.getByText('Indicadores de mercado')).toBeInTheDocument();
  });
});
