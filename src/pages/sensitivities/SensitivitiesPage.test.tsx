import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { API_BASE_URL } from '@/shared/api';
import { routes } from '@/shared/config';

import { server } from '../../test/msw/server';
import { createQueryHarness } from '../../test/query-wrapper';

import { SensitivitiesPage } from './SensitivitiesPage';

import type { SensitivityDriversView } from '@/shared/api';

const ROACE_VIEW: SensitivityDriversView = {
  indicators: [
    { id: 'ind_roace', label: 'ROACE', isReady: true },
    { id: 'ind_margen_ebitda', label: 'Margen EBITDA', isReady: true },
  ],
  formula: { expression: 'ROACE = NOPAT / Capital empleado', terms: [] },
  levers: [
    {
      id: 'lev_energy_cost',
      label: 'Costo de energía eléctrica',
      unit: 'percent',
      min: -10,
      max: 5,
      step: 1,
      default: 0,
    },
  ],
  base: { value: 7.4, unit: 'percent' },
  target: { value: 7.9, unit: 'percent' },
  suggestion: {
    id: 'sug_roace_mix_1',
    levers: { lev_energy_cost: -5 },
    estimatedResult: 8.1,
    status: 'requires_validation',
    validatedBy: null,
    validatedAt: null,
  },
  permissions: { canSimulate: true, canValidateSuggestion: true, canSaveSimulation: true },
};

const MARGEN_VIEW: SensitivityDriversView = {
  ...ROACE_VIEW,
  formula: { expression: 'Margen EBITDA = EBITDA / Ingresos', terms: [] },
  levers: [
    {
      id: 'lev_opex',
      label: 'Costos operativos',
      unit: 'percent',
      min: -10,
      max: 10,
      step: 1,
      default: 0,
    },
  ],
};

function serve() {
  const requested: string[] = [];
  server.use(
    http.get(`${API_BASE_URL}/views/sensitivity-drivers`, ({ request }) => {
      requested.push(request.url);
      const indicator = new URL(request.url).searchParams.get('indicator');
      return HttpResponse.json(indicator === 'ind_margen_ebitda' ? MARGEN_VIEW : ROACE_VIEW);
    }),
  );
  return requested;
}

function serveEvaluate() {
  const requests: unknown[] = [];
  server.use(
    http.post(`${API_BASE_URL}/sensitivity-evaluations`, async ({ request }) => {
      requests.push(await request.json());
      return HttpResponse.json({
        base: { indicatorId: 'ind_roace', value: 7.4 },
        simulated: { value: 7.8 },
        target: 7.9,
        gap: 0.1,
        linked: [],
      });
    }),
  );
  return requests;
}

function renderPage() {
  const { wrapper: Providers } = createQueryHarness();
  return render(
    <Providers>
      <MemoryRouter initialEntries={[routes.sensitivities.build({})]}>
        <Routes>
          <Route path={routes.sensitivities.path} element={<SensitivitiesPage />} />
        </Routes>
      </MemoryRouter>
    </Providers>,
  );
}

describe('SensitivitiesPage (SCR-12)', () => {
  beforeAll(() => {
    // Radix Slider measures its thumb with ResizeObserver, which jsdom does not implement.
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe = vi.fn();
        unobserve = vi.fn();
        disconnect = vi.fn();
      },
    );
  });

  it('is one left-aligned 840px column that starts with the drivers card, with no page h1', async () => {
    serve();
    renderPage();
    const card = await screen.findByTestId('sensitivity-drivers-card');
    const page = screen.getByTestId('sensitivities-page');
    expect(page).toHaveClass('max-w-(--size-layout-max-width-monitor)');
    expect(page).not.toHaveClass('mx-auto');
    // The app shell header is the page h1 ("Sensibilidades"): no in-content title above the drivers card.
    expect(screen.queryByRole('heading', { level: 1 })).toBeNull();
    expect(page.firstElementChild).toContainElement(card);
  });

  it('shows the target gap in the result strip before any lever moves (V-37 target)', async () => {
    serve();
    renderPage();
    const card = await screen.findByTestId('sensitivity-drivers-card');
    expect(await within(card).findByText('Brecha vs. meta (7,9%)')).toBeVisible();
    const gap = within(card).getByTestId('sensitivity-drivers-gap');
    expect(gap).toBeVisible();
    expect(gap).toHaveTextContent('0,5 pts');
  });

  it('defaults to ind_roace and a pill click loads the clicked indicator', async () => {
    const requested = serve();
    const user = userEvent.setup();
    renderPage();
    // Scoped to this card: V-38 (sensitivity scenarios, read by the sibling WeightSimulator widget on this same
    // page) has its own "Costos operativos" variable in its default fixture, an unrelated accessible-name collision
    // with this card's own "Costos operativos" lever (MARGEN_VIEW) that an unscoped query would also match.
    const card = () => screen.getByTestId('sensitivity-drivers-card');

    expect(
      await within(card()).findByRole('slider', { name: 'Costo de energía eléctrica' }),
    ).toBeInTheDocument();
    expect(new URL(requested[0] ?? '').searchParams.get('indicator')).toBe('ind_roace');

    await user.click(within(card()).getByRole('button', { name: 'Margen EBITDA' }));
    expect(
      await within(card()).findByRole('slider', { name: 'Costos operativos' }),
    ).toBeInTheDocument();
    expect(new URL(requested.at(-1) ?? '').searchParams.get('indicator')).toBe('ind_margen_ebitda');
  });

  it('a burst of 5 lever changes sends exactly 1 evaluate request with the final values', async () => {
    serve();
    const evalRequests = serveEvaluate();
    renderPage();
    const slider = await within(screen.getByTestId('sensitivity-drivers-card')).findByRole(
      'slider',
      { name: 'Costo de energía eléctrica' },
    );

    vi.useFakeTimers();
    try {
      for (let i = 0; i < 5; i += 1) {
        fireEvent.keyDown(slider, { key: 'ArrowRight' });
      }
      expect(evalRequests).toHaveLength(0);
      await vi.advanceTimersByTimeAsync(250);
    } finally {
      vi.useRealTimers();
    }

    expect(evalRequests).toHaveLength(1);
    expect(evalRequests[0]).toEqual({
      indicatorId: 'ind_roace',
      levers: [{ leverId: 'lev_energy_cost', value: 5 }],
    });
  });
});
