import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { API_BASE_URL } from '@/shared/api';
import { ToastProvider } from '@/shared/ui/composites/toast';

import { server } from '../../test/msw/server';
import { createQueryHarness } from '../../test/query-wrapper';

import { StrategicPlan } from './StrategicPlan';
import { strategicPlanTestIds } from './test-ids';

import type { WeightSimulatorView } from '@/shared/api';

// SCR-12 §7 with V-39 / C-25 / C-26 / C-14 served by MSW (V-39 is not in contract 0.1.0's GET side; C-25/C-26/C-14
// are, with default 0.1.0 handlers, overridden here for deterministic bodies).
const VIEW: WeightSimulatorView = {
  baseScore: 91.8,
  categories: [],
  recommendations: [
    { kviId: 'kvi_deuda', label: 'Deuda Bruta / EBITDA', gapPts: 28, weightPct: 6, tone: 'action' },
    {
      kviId: 'kvi_cobertura',
      label: 'Cobertura de Intereses',
      gapPts: 25,
      weightPct: 6,
      tone: 'action',
    },
    {
      kviId: 'kvi_precio',
      label: 'Precio Objetivo Analistas',
      gapPts: 11,
      weightPct: 5,
      tone: 'watch',
    },
  ],
  permissions: { canGeneratePlan: true },
};

function serveView(view: WeightSimulatorView = VIEW) {
  server.use(http.get(`${API_BASE_URL}/views/weight-simulator`, () => HttpResponse.json(view)));
}

function serveGeneratePlan() {
  server.use(
    http.post(`${API_BASE_URL}/strategic-plans`, () =>
      HttpResponse.json({
        plan: {
          planId: 'plan_1',
          status: 'suggestion',
          rows: [
            {
              kviId: 'kvi_deuda',
              indicatorLabel: 'Deuda Bruta / EBITDA',
              urgency: 'medium',
              gapPts: 28,
              weightPct: 6,
              action: 'Plan de choque: revisar drivers operativos y de costo del indicador',
              termDays: 30,
            },
          ],
        },
      }),
    ),
  );
}

function serveSavePlan() {
  const requests: unknown[] = [];
  server.use(
    http.patch(`${API_BASE_URL}/strategic-plans/:planId`, async ({ request, params }) => {
      requests.push(await request.json());
      return HttpResponse.json({ saved: true, planId: params.planId });
    }),
  );
  return requests;
}

function serveExport() {
  const requests: unknown[] = [];
  server.use(
    http.post(`${API_BASE_URL}/exports`, async ({ request }) => {
      requests.push(await request.json());
      return HttpResponse.json({ operationId: 'op_1', status: 'accepted' });
    }),
  );
  return requests;
}

function renderWidget(analysisId = 'ana_01J9Y8D4T2') {
  const { wrapper: Providers } = createQueryHarness();
  return render(
    <Providers>
      <ToastProvider>
        <StrategicPlan analysisId={analysisId} />
      </ToastProvider>
    </Providers>,
  );
}

describe('StrategicPlan (SCR-12 §7 + OVL-03)', () => {
  it('renders the top 3 recommendations with watch/critical copy by tone', async () => {
    serveView();
    renderWidget();

    expect(
      await screen.findByTestId(strategicPlanTestIds.recommendation('kvi_deuda')),
    ).toHaveTextContent('Brecha crítica de 28 pts');
    expect(screen.getByTestId(strategicPlanTestIds.recommendation('kvi_precio'))).toHaveTextContent(
      'A 11 pts de la meta',
    );
  });

  it('"Generar plan estratégico" opens OVL-03 with the plan list', async () => {
    serveView();
    serveGeneratePlan();
    renderWidget();
    const user = userEvent.setup({ delay: null });

    await user.click(await screen.findByTestId(strategicPlanTestIds.generateButton));

    const modal = await screen.findByTestId(strategicPlanTestIds.modal);
    expect(modal).toBeInTheDocument();
    expect(screen.getByTestId(strategicPlanTestIds.planRow('kvi_deuda'))).toHaveTextContent(
      'Deuda Bruta / EBITDA',
    );
  });

  it('"Descargar" and "Guardar en el análisis" call their handlers', async () => {
    serveView();
    serveGeneratePlan();
    const saved = serveSavePlan();
    const exported = serveExport();
    renderWidget('ana_custom');
    const user = userEvent.setup({ delay: null });

    await user.click(await screen.findByTestId(strategicPlanTestIds.generateButton));
    await screen.findByTestId(strategicPlanTestIds.modal);

    await user.click(screen.getByTestId(strategicPlanTestIds.downloadButton));
    expect(exported).toEqual([{ kind: 'strategic-plan', params: { analysisId: 'ana_custom' } }]);

    await user.click(screen.getByTestId(strategicPlanTestIds.saveButton));
    expect(await screen.findByText('✓ Plan guardado en el análisis.')).toBeInTheDocument();
    expect(saved).toHaveLength(1);
  });
});
