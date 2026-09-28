import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { API_BASE_URL } from '@/shared/api';

import { server } from '../../test/msw/server';
import { createQueryHarness } from '../../test/query-wrapper';

import { weightSimulatorTestIds } from './test-ids';
import { WeightSimulator } from './WeightSimulator';

import type { SensitivityScenariosView, WeightSimulatorView } from '@/shared/api';

// SCR-12 §2-6 with V-38 / V-39 / C-24 served by MSW (none is in the vendored contract 0.1.0's GET side; C-24 has a
// default 0.1.0 handler, overridden here). `baseRoace`/`peerAvgRoace` are chosen with a 1-point gap (not the real
// mock's 7.4/5.5, where Ecopetrol is already above peers, CF-68) so the gap-closing UI has something to exercise.
const SCENARIOS: SensitivityScenariosView = {
  variables: [
    {
      id: 'productivity',
      label: 'Productividad',
      unit: 'percent',
      min: -5,
      max: 10,
      step: 1,
      default: 0,
    },
    {
      id: 'operating_costs',
      label: 'Costos operativos',
      unit: 'percent',
      min: -15,
      max: 10,
      step: 1,
      default: 0,
    },
  ],
  baseRoace: 5,
  peerAvgRoace: 6,
  presets: [
    { id: 'optimistic', label: 'Optimista', values: { productivity: 8, operating_costs: -10 } },
  ],
  permissions: { canSimulate: true },
};

const WEIGHT_SIM: WeightSimulatorView = {
  baseScore: 91.8,
  categories: [
    {
      id: 'financiero',
      label: 'Financiero',
      targetPct: 60,
      kvis: [
        {
          kviId: 'kvi_fcf',
          label: 'Flujo de Caja Libre',
          weightPct: 12,
          monitorPct: 95,
          band: 'ok',
        },
        {
          kviId: 'kvi_debt',
          label: 'Deuda Bruta / EBITDA',
          weightPct: 48,
          monitorPct: 65,
          band: 'critical',
        },
      ],
    },
    {
      id: 'mercado',
      label: 'Mercado',
      targetPct: 15,
      kvis: [{ kviId: 'kvi_trr', label: 'TRR', weightPct: 20, monitorPct: 92, band: 'ok' }],
    },
  ],
  recommendations: [],
  permissions: { canGeneratePlan: true },
};

function serveViews(scenarios = SCENARIOS, weightSim = WEIGHT_SIM) {
  server.use(
    http.get(`${API_BASE_URL}/views/sensitivity-scenarios`, () => HttpResponse.json(scenarios)),
    http.get(`${API_BASE_URL}/views/weight-simulator`, () => HttpResponse.json(weightSim)),
  );
}

function serveEvaluateWeights() {
  const requests: unknown[] = [];
  server.use(
    http.post(`${API_BASE_URL}/weight-simulation-evaluations`, async ({ request }) => {
      requests.push(await request.json());
      return HttpResponse.json({
        mode: 'weights',
        score: 93,
        variation: 1.2,
        categories: {
          productivity: { before: 0, after: 0 },
          operating_costs: { before: 0, after: 0 },
        },
        status: 'calculated',
      });
    }),
  );
  return requests;
}

interface ScenarioReply {
  simulatedRoace: number;
  gapClosedPct: number;
  status: 'calculated' | 'above_peers';
}

/** C-24 `mode: 'scenario'` served by MSW; `reply` picks the response for each request body the widget sends. */
function serveEvaluateScenario(reply: (body: Record<string, unknown>) => ScenarioReply) {
  const requests: Record<string, unknown>[] = [];
  server.use(
    http.post(`${API_BASE_URL}/weight-simulation-evaluations`, async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>;
      requests.push(body);
      const { simulatedRoace, gapClosedPct, status } = reply(body);
      return HttpResponse.json({
        mode: 'scenario',
        baseRoace: SCENARIOS.baseRoace,
        simulatedRoace,
        peerAvgRoace: SCENARIOS.peerAvgRoace,
        gapClosedPct,
        status,
      });
    }),
  );
  return requests;
}

function renderWidget() {
  const { wrapper: Providers } = createQueryHarness();
  return render(
    <Providers>
      <WeightSimulator />
    </Providers>,
  );
}

describe('WeightSimulator (SCR-12 §2-6)', () => {
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

  it('a scenario preset loads its slider values and evaluates them through C-24 scenario mode', async () => {
    serveViews();
    const requests = serveEvaluateScenario(() => ({
      simulatedRoace: 5.8,
      gapClosedPct: 80,
      status: 'calculated',
    }));
    renderWidget();

    await screen.findByTestId(weightSimulatorTestIds.preset('optimistic'));
    fireEvent.click(screen.getByTestId(weightSimulatorTestIds.preset('optimistic')));

    expect(await screen.findByRole('slider', { name: 'Productividad' })).toHaveAttribute(
      'aria-valuenow',
      '8',
    );
    expect(screen.getByRole('slider', { name: 'Costos operativos' })).toHaveAttribute(
      'aria-valuenow',
      '-10',
    );
    await waitFor(() => {
      expect(requests).toEqual([{ mode: 'scenario', productivity: 8, operatingCosts: -10 }]);
    });
    await waitFor(() => {
      expect(screen.getByTestId(weightSimulatorTestIds.roaceSimulated)).toHaveTextContent('5,8%');
    });
  });

  it('moving a scenario slider sends C-24 mode "scenario" and renders the server ROACE, peer average and gap-closed %', async () => {
    serveViews();
    const requests = serveEvaluateScenario(() => ({
      simulatedRoace: 5.4,
      gapClosedPct: 40,
      status: 'calculated',
    }));
    renderWidget();

    const productivity = await screen.findByRole('slider', { name: 'Productividad' });
    expect(screen.getByTestId(weightSimulatorTestIds.gapClosedPct)).toHaveTextContent('0%');
    expect(requests).toHaveLength(0);

    for (let i = 0; i < 4; i += 1) fireEvent.keyDown(productivity, { key: 'ArrowRight' });

    await waitFor(() => {
      expect(screen.getByTestId(weightSimulatorTestIds.roaceSimulated)).toHaveTextContent('5,4%');
    });
    expect(requests).toEqual([{ mode: 'scenario', productivity: 4, operatingCosts: 0 }]);
    expect(screen.getByTestId(weightSimulatorTestIds.gapClosedPct)).toHaveTextContent('40%');
    expect(screen.getByText(/Brecha cerrada vs\. pares \(6,0\s?%\)/)).toBeInTheDocument();
  });

  it("the Yarbis tip switches at the 50% threshold using the server's gapClosedPct", async () => {
    serveViews();
    serveEvaluateScenario((body) => {
      const productivityValue = body.productivity as number;
      // Deliberately not the old client formula (productivity / 10): the tip must follow whatever the server says.
      return productivityValue >= 6
        ? { simulatedRoace: 5.6, gapClosedPct: 62, status: 'calculated' }
        : { simulatedRoace: 5.4, gapClosedPct: 49, status: 'calculated' };
    });
    renderWidget();

    const productivity = await screen.findByRole('slider', { name: 'Productividad' });
    expect(screen.getByTestId(weightSimulatorTestIds.tip)).toHaveTextContent(
      'Aún queda una brecha importante',
    );

    for (let i = 0; i < 4; i += 1) fireEvent.keyDown(productivity, { key: 'ArrowRight' });
    await waitFor(() => {
      expect(screen.getByTestId(weightSimulatorTestIds.gapClosedPct)).toHaveTextContent('49%');
    });
    expect(screen.getByTestId(weightSimulatorTestIds.tip)).toHaveTextContent(
      'Aún queda una brecha importante',
    );

    for (let i = 0; i < 2; i += 1) fireEvent.keyDown(productivity, { key: 'ArrowRight' });
    await waitFor(() => {
      expect(screen.getByTestId(weightSimulatorTestIds.gapClosedPct)).toHaveTextContent('62%');
    });
    expect(screen.getByTestId(weightSimulatorTestIds.tip)).toHaveTextContent(
      'cierras el 62% de la brecha',
    );
  });

  it('hides the gap bar and tip when the server answers status "above_peers"', async () => {
    serveViews();
    serveEvaluateScenario(() => ({
      simulatedRoace: 6.4,
      gapClosedPct: 100,
      status: 'above_peers',
    }));
    renderWidget();

    const productivity = await screen.findByRole('slider', { name: 'Productividad' });
    expect(screen.getByTestId(weightSimulatorTestIds.gapClosedBar)).toBeInTheDocument();

    for (let i = 0; i < 4; i += 1) fireEvent.keyDown(productivity, { key: 'ArrowRight' });

    await waitFor(() => {
      expect(screen.queryByTestId(weightSimulatorTestIds.gapClosedBar)).toBeNull();
    });
    expect(screen.queryByTestId(weightSimulatorTestIds.tip)).toBeNull();
    expect(screen.getByTestId(weightSimulatorTestIds.roaceSimulated)).toHaveTextContent('6,4%');
  });

  it('a category status follows the ±2pt rule (financiero on target, mercado over by 5)', async () => {
    serveViews();
    renderWidget();

    const financiero = await screen.findByTestId(
      weightSimulatorTestIds.categoryStatus('financiero'),
    );
    expect(financiero).toHaveTextContent('En línea');
    const mercado = screen.getByTestId(weightSimulatorTestIds.categoryStatus('mercado'));
    expect(mercado).toHaveTextContent('Excede la meta de categoría');
  });

  it('"Restablecer pesos" reverts an edited weight back to its original value', async () => {
    serveEvaluateWeights();
    serveViews();
    renderWidget();

    const fcfSlider = await screen.findByRole('slider', { name: 'Flujo de Caja Libre' });
    vi.useFakeTimers();
    try {
      for (let i = 0; i < 3; i += 1) fireEvent.keyDown(fcfSlider, { key: 'ArrowRight' });
      expect(fcfSlider).toHaveAttribute('aria-valuenow', '15');

      fireEvent.click(screen.getByTestId(weightSimulatorTestIds.resetButton));
      // The debounced evaluate never gets the chance to fire; advancing past it proves the reset cancelled it.
      await vi.advanceTimersByTimeAsync(250);
    } finally {
      vi.useRealTimers();
    }

    expect(fcfSlider).toHaveAttribute('aria-valuenow', '12');
    expect(screen.getByTestId(weightSimulatorTestIds.scoreSimulated)).toHaveTextContent('91,8%');
  });

  it('hides the gap-closed bar and tip when Ecopetrol is already above the peer average (CF-68)', async () => {
    serveViews({ ...SCENARIOS, baseRoace: 7.4, peerAvgRoace: 5.5 });
    renderWidget();

    await screen.findByRole('slider', { name: 'Productividad' });
    expect(screen.queryByTestId(weightSimulatorTestIds.gapClosedBar)).toBeNull();
    expect(screen.queryByTestId(weightSimulatorTestIds.tip)).toBeNull();
  });
});
