import { act, fireEvent, render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PendingOverridesProvider } from '@/entities/analysis';
import { API_BASE_URL } from '@/shared/api';
import { ToastProvider } from '@/shared/ui/composites/toast';

import { server } from '../../test/msw/server';
import { createQueryHarness } from '../../test/query-wrapper';

import { CompanyCoverage } from './CompanyCoverage';
import { companyCoverageTestIds } from './test-ids';

import type { V09Response } from '@/shared/api';

const V10_PATH = `${API_BASE_URL}/views/company-coverage/:analysisId`;
const VALUE_OVERRIDES_PATH = `${API_BASE_URL}/analyses/:analysisId/value-overrides`;
const ANALYSIS_ID = 'ana_1';

const MODULE: V09Response['modules'][number] = {
  id: 'companyCoverage',
  order: 2,
  isGated: false,
  visibleInHorizons: ['tbg', 'ilp', 'union'],
};

interface OverridesBody {
  overrides: { companyId: string; indicatorId: string; value: number | null }[];
}

const V10_OK = {
  kpis: { status: 'ok', data: { companies: 2, complete: 1, incomplete: 1, pendingIndicators: 1 } },
  insights: { status: 'ok', data: [] },
  companies: {
    status: 'ok',
    data: {
      items: [
        {
          id: 'chevron',
          name: 'Chevron',
          initials: 'CH',
          colorKey: 'chevron',
          coveragePct: 96,
          coverageStatus: 'complete',
          missingCount: 0,
        },
        {
          id: 'shell',
          name: 'Shell',
          initials: 'SH',
          colorKey: 'shell',
          coveragePct: 88,
          coverageStatus: 'needs_review',
          missingCount: 1,
        },
      ],
      addableCompanies: [{ id: 'bp', name: 'BP' }],
    },
  },
  selected: {
    status: 'ok',
    data: {
      companyId: 'chevron',
      groups: [
        {
          dimension: 'fin',
          totalPct: 40,
          items: [
            {
              indicatorId: 'roace',
              label: 'ROACE relativo',
              value: 20,
              unit: 'percent',
              isEstimate: false,
              justification: null,
            },
            {
              indicatorId: 'fcl',
              label: 'Flujo de Caja Libre',
              value: 20,
              unit: 'percent',
              isEstimate: false,
              justification: null,
            },
          ],
        },
      ],
      missing: [{ indicatorId: 'capex', label: 'Capex proyectado', value: null, unit: 'percent' }],
    },
  },
  permissions: { canEditValues: true },
};

function renderWidget() {
  const { wrapper: Wrapper } = createQueryHarness();
  render(
    <Wrapper>
      <ToastProvider>
        <PendingOverridesProvider>
          <CompanyCoverage analysisId={ANALYSIS_ID} horizon="tbg" module={MODULE} />
        </PendingOverridesProvider>
      </ToastProvider>
    </Wrapper>,
  );
}

afterEach(() => {
  vi.useRealTimers();
});

describe('CompanyCoverage', () => {
  it('renders the header, the cards and the selected company edit area', async () => {
    server.use(http.get(V10_PATH, () => HttpResponse.json(V10_OK)));
    renderWidget();
    expect(screen.getByText('Detalle y edición de datos por compañía')).toBeInTheDocument();
    expect(await screen.findByTestId(companyCoverageTestIds.card('chevron'))).toBeInTheDocument();
    expect(screen.getByTestId(companyCoverageTestIds.card('shell'))).toBeInTheDocument();
    expect(screen.getByTestId(companyCoverageTestIds.metaInput('chevron', 'roace'))).toHaveValue(
      '20',
    );
  });

  describe('remove and undo', () => {
    it('undo within 5 s restores the company with its row and staged edits intact', async () => {
      server.use(http.get(V10_PATH, () => HttpResponse.json(V10_OK)));
      renderWidget();
      await screen.findByTestId(companyCoverageTestIds.card('chevron'));

      // Stage an edit before removing, to prove it survives the hide/undo round-trip.
      fireEvent.change(screen.getByTestId(companyCoverageTestIds.metaInput('chevron', 'roace')), {
        target: { value: '25' },
      });
      expect(screen.getByTestId(companyCoverageTestIds.metaInput('chevron', 'roace'))).toHaveValue(
        '25',
      );

      vi.useFakeTimers({ shouldAdvanceTime: true });
      fireEvent.click(screen.getByTestId(companyCoverageTestIds.cardRemove('chevron')));
      expect(screen.queryByTestId(companyCoverageTestIds.card('chevron'))).not.toBeInTheDocument();
      expect(screen.getByText('Se quitó Chevron del análisis.')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(4000);
      });
      fireEvent.click(screen.getByRole('button', { name: 'Deshacer' }));

      expect(screen.getByTestId(companyCoverageTestIds.card('chevron'))).toBeInTheDocument();
      expect(screen.getByTestId(companyCoverageTestIds.metaInput('chevron', 'roace'))).toHaveValue(
        '25',
      );
    });

    it('the removal sticks once the 5 s undo window elapses', async () => {
      server.use(http.get(V10_PATH, () => HttpResponse.json(V10_OK)));
      renderWidget();
      await screen.findByTestId(companyCoverageTestIds.card('chevron'));

      vi.useFakeTimers({ shouldAdvanceTime: true });
      fireEvent.click(screen.getByTestId(companyCoverageTestIds.cardRemove('chevron')));
      expect(screen.queryByTestId(companyCoverageTestIds.card('chevron'))).not.toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(screen.queryByTestId(companyCoverageTestIds.card('chevron'))).not.toBeInTheDocument();
      expect(screen.queryByTestId('toast-undo')).not.toBeInTheDocument();
    });
  });

  describe('null values', () => {
    it('a null value renders an empty input, and clearing a cell stages null (never 0)', async () => {
      server.use(http.get(V10_PATH, () => HttpResponse.json(V10_OK)));
      const captured: { body: OverridesBody | null } = { body: null };
      server.use(
        http.patch(VALUE_OVERRIDES_PATH, async ({ request }) => {
          const body = (await request.json()) as OverridesBody;
          captured.body = body;
          return HttpResponse.json({ saved: true, overrideCount: body.overrides.length });
        }),
      );
      renderWidget();
      const missingInput = await screen.findByTestId(
        companyCoverageTestIds.missingInput('chevron', 'capex'),
      );
      expect(missingInput).toHaveValue('');

      fireEvent.change(missingInput, { target: { value: '10' } });
      expect(
        screen.getByTestId(companyCoverageTestIds.missingInput('chevron', 'capex')),
      ).toHaveValue('10');

      fireEvent.change(
        screen.getByTestId(companyCoverageTestIds.missingInput('chevron', 'capex')),
        {
          target: { value: '' },
        },
      );
      expect(
        screen.getByTestId(companyCoverageTestIds.missingInput('chevron', 'capex')),
      ).toHaveValue('');

      fireEvent.click(screen.getByTestId(companyCoverageTestIds.save));
      await vi.waitFor(() => {
        expect(captured.body).not.toBeNull();
      });
      const capexOverride = captured.body?.overrides.find((o) => o.indicatorId === 'capex');
      expect(capexOverride?.value).toBeNull();
    });
  });

  describe('staged edits', () => {
    it('keeps one staged edit per company × indicator (last wins)', async () => {
      server.use(http.get(V10_PATH, () => HttpResponse.json(V10_OK)));
      const captured: { body: OverridesBody | null } = { body: null };
      server.use(
        http.patch(VALUE_OVERRIDES_PATH, async ({ request }) => {
          const body = (await request.json()) as OverridesBody;
          captured.body = body;
          return HttpResponse.json({ saved: true, overrideCount: body.overrides.length });
        }),
      );
      renderWidget();
      const roaceInput = await screen.findByTestId(
        companyCoverageTestIds.metaInput('chevron', 'roace'),
      );

      fireEvent.change(roaceInput, { target: { value: '25' } });
      fireEvent.change(screen.getByTestId(companyCoverageTestIds.metaInput('chevron', 'roace')), {
        target: { value: '30' },
      });

      fireEvent.click(screen.getByTestId(companyCoverageTestIds.save));
      await vi.waitFor(() => {
        expect(captured.body).not.toBeNull();
      });
      const roaceOverrides = captured.body?.overrides.filter(
        (o) => o.companyId === 'chevron' && o.indicatorId === 'roace',
      );
      expect(roaceOverrides).toHaveLength(1);
      expect(roaceOverrides?.[0]?.value).toBe(30);
    });

    it('cancel discards the staged edits', async () => {
      server.use(http.get(V10_PATH, () => HttpResponse.json(V10_OK)));
      renderWidget();
      const roaceInput = await screen.findByTestId(
        companyCoverageTestIds.metaInput('chevron', 'roace'),
      );

      fireEvent.change(roaceInput, { target: { value: '25' } });
      expect(screen.getByTestId(companyCoverageTestIds.metaInput('chevron', 'roace'))).toHaveValue(
        '25',
      );

      fireEvent.click(screen.getByTestId(companyCoverageTestIds.cancel));
      expect(screen.getByTestId(companyCoverageTestIds.metaInput('chevron', 'roace'))).toHaveValue(
        '20',
      );
    });
  });
});
