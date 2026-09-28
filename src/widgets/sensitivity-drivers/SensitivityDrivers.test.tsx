import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { API_BASE_URL, TRACE_ID_HEADER } from '@/shared/api';

import { server } from '../../test/msw/server';
import { createQueryHarness } from '../../test/query-wrapper';

import { SensitivityDrivers } from './SensitivityDrivers';

import type { SensitivityDriversView } from '@/shared/api';

// SCR-12 §1 with V-37 / C-21 / C-22 served by MSW (none is in the vendored contract 0.1.0's GET side; C-21/C-22 have
// default 0.1.0 handlers, overridden here for deterministic bodies).
const VIEW: SensitivityDriversView = {
  indicators: [
    { id: 'ind_roace', label: 'ROACE', isReady: true },
    { id: 'ind_margen_ebitda', label: 'Margen EBITDA', isReady: false },
  ],
  formula: {
    expression: 'ROACE = NOPAT / Capital empleado',
    terms: ['NOPAT = Ingresos operacionales − Costos', 'Capital empleado = Activos − Pasivos'],
  },
  levers: [
    {
      id: 'lev_energy_cost',
      label: 'Costo de energía eléctrica',
      unit: 'percent',
      min: -10,
      max: 5,
      step: 1,
      default: 0,
      linked: { label: 'Eficiencia energética (recalculada)', unit: 'percent', factor: -0.6 },
    },
    {
      id: 'lev_contracted_services',
      label: 'Servicios contratados',
      unit: 'mmcop',
      min: -10000,
      max: 5000,
      step: 500,
      default: 0,
    },
    {
      id: 'lev_production_volume',
      label: 'Volumen de producción',
      unit: 'percent',
      min: -5,
      max: 8,
      step: 1,
      default: 0,
      linked: { label: 'Costo de levantamiento (recalculado)', unit: 'percent', factor: 0.4 },
    },
  ],
  base: { value: 7.4, unit: 'percent' },
  target: { value: 7.9, unit: 'percent' },
  suggestion: {
    id: 'sug_roace_mix_1',
    levers: { lev_energy_cost: -5, lev_contracted_services: -5000, lev_production_volume: 3 },
    estimatedResult: 8.1,
    status: 'requires_validation',
    validatedBy: null,
    validatedAt: null,
  },
  permissions: { canSimulate: true, canValidateSuggestion: true, canSaveSimulation: true },
};

function serveView(view: SensitivityDriversView | 'error') {
  const requested: string[] = [];
  server.use(
    http.get(`${API_BASE_URL}/views/sensitivity-drivers`, ({ request }) => {
      requested.push(request.url);
      return view === 'error'
        ? HttpResponse.json(
            { code: 'INTERNAL_ERROR', message: 'Fallo', traceId: 't' },
            { status: 500, headers: { [TRACE_ID_HEADER]: 't' } },
          )
        : HttpResponse.json(view);
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
        linked: [{ indicatorId: 'lev_energy_cost', variation: -3 }],
      });
    }),
  );
  return requests;
}

function serveValidate() {
  server.use(
    http.post(`${API_BASE_URL}/sensitivity-suggestions/:suggestionId/validation`, ({ params }) =>
      HttpResponse.json({
        suggestionId: params.suggestionId,
        validatedBy: 'Alejandra Ríos',
        validatedAt: '2026-09-25T10:00:00-05:00',
      }),
    ),
  );
}

function renderWidget(indicatorId = 'ind_roace') {
  const { wrapper: Providers } = createQueryHarness();
  const onIndicatorChange = vi.fn();
  render(
    <Providers>
      <SensitivityDrivers indicatorId={indicatorId} onIndicatorChange={onIndicatorChange} />
    </Providers>,
  );
  return { onIndicatorChange };
}

describe('SensitivityDrivers (SCR-12 §1)', () => {
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

  it('a burst of 5 lever changes sends exactly 1 evaluate request with the final values', async () => {
    serveView(VIEW);
    const evalRequests = serveEvaluate();
    renderWidget();
    const slider = await screen.findByRole('slider', { name: 'Costo de energía eléctrica' });

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
      levers: [
        { leverId: 'lev_energy_cost', value: 5 },
        { leverId: 'lev_contracted_services', value: 0 },
        { leverId: 'lev_production_volume', value: 0 },
      ],
    });
    expect(await screen.findByTestId('sensitivity-drivers-simulated')).toHaveTextContent('7,8%');
  });

  it('"Marcar como validada" flips the suggestion status', async () => {
    serveView(VIEW);
    serveEvaluate();
    serveValidate();
    const user = userEvent.setup();
    renderWidget();
    await screen.findByRole('slider', { name: 'Costo de energía eléctrica' });

    await user.click(screen.getByRole('button', { name: 'Ver sugerencia ›' }));
    expect(screen.getByTestId('sensitivity-drivers-suggestion-status')).toHaveTextContent(
      'Requiere validación humana',
    );

    await user.click(screen.getByRole('button', { name: 'Marcar como validada' }));
    expect(await screen.findByTestId('sensitivity-drivers-suggestion-status')).toHaveTextContent(
      '✓ Validada por analista',
    );
    expect(screen.queryByRole('button', { name: 'Marcar como validada' })).toBeNull();
  });

  it('a failed V-37 shows a retry that reloads the section', async () => {
    serveView('error');
    const user = userEvent.setup();
    renderWidget();
    expect(await screen.findByTestId('sensitivity-drivers-section-error')).toBeInTheDocument();

    serveView(VIEW);
    await user.click(screen.getByTestId('sensitivity-drivers-section-retry'));
    expect(
      await screen.findByRole('slider', { name: 'Costo de energía eléctrica' }),
    ).toBeInTheDocument();
  });
});
