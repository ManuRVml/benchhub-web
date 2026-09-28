import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { API_BASE_URL } from '@/shared/api';

import { scenarioHandlers } from '../../test/msw/handlers';
import { server } from '../../test/msw/server';
import { createQueryHarness } from '../../test/query-wrapper';

import { AiFindingsRail } from './AiFindingsRail';

const FINDINGS_PATH = `${API_BASE_URL}/views/ai-findings/:analysisId`;

const v14 = (findings: { id: string; text: string }[]) => ({
  findings,
  status: 'suggestion',
  generatedBy: { model: 'mock', version: '1' },
  permissions: {},
});

function renderRail() {
  const { wrapper: Wrapper } = createQueryHarness();
  return render(
    <Wrapper>
      <AiFindingsRail analysisId="ana_1" />
    </Wrapper>,
  );
}

describe('AiFindingsRail', () => {
  it('ok: shows the eyebrow and one card per finding', async () => {
    server.use(
      http.get(FINDINGS_PATH, () =>
        HttpResponse.json(
          v14([
            { id: 'f1', text: 'Shell reporta un margen atípico frente a su histórico.' },
            { id: 'f2', text: 'ISA concentra los datos faltantes.' },
          ]),
        ),
      ),
    );
    renderRail();
    expect(screen.getByText('Hallazgos de IA')).toBeInTheDocument();
    expect(await screen.findAllByTestId('ai-finding-card')).toHaveLength(2);
    expect(screen.getByTestId('ai-findings-rail-section-ready')).toBeInTheDocument();
  });

  it('error: shows the error panel with retry, keeps the eyebrow, and recovers on retry', async () => {
    // Fails (5xx is retried by the query policy, so every attempt fails) until the test flips the switch.
    let failing = true;
    server.use(
      http.get(FINDINGS_PATH, () =>
        failing
          ? HttpResponse.json(
              { code: 'INTERNAL_ERROR', message: 'x', traceId: 't' },
              { status: 500 },
            )
          : HttpResponse.json(v14([{ id: 'f1', text: 'Hallazgo recuperado.' }])),
      ),
    );
    renderRail();
    expect(await screen.findByTestId('ai-findings-rail-section-error')).toBeInTheDocument();
    expect(screen.getByText('Hallazgos de IA')).toBeInTheDocument();
    failing = false;
    await userEvent.click(screen.getByTestId('ai-findings-rail-section-retry'));
    expect(await screen.findByText('Hallazgo recuperado.')).toBeInTheDocument();
  });

  it('forbidden: shows the forbidden panel, never the cards', async () => {
    server.use(
      http.get(FINDINGS_PATH, () =>
        HttpResponse.json({ code: 'FORBIDDEN', message: 'x', traceId: 't' }, { status: 403 }),
      ),
    );
    renderRail();
    expect(await screen.findByTestId('ai-findings-rail-section-forbidden')).toBeInTheDocument();
    expect(screen.queryByTestId('ai-finding-card')).toBeNull();
  });

  it('partial scenario: V-14 has no sections, so the rail renders as ok', async () => {
    server.use(...scenarioHandlers('partial'));
    renderRail();
    await waitFor(() => {
      expect(screen.getByTestId('ai-findings-rail-section-ready')).toBeInTheDocument();
    });
    expect(screen.getAllByTestId('ai-finding-card').length).toBeGreaterThan(0);
  });

  it('empty: keeps the eyebrow and shows the empty note instead of cards', async () => {
    server.use(http.get(FINDINGS_PATH, () => HttpResponse.json(v14([]))));
    renderRail();
    expect(await screen.findByTestId('ai-findings-rail-section-empty')).toBeInTheDocument();
    expect(screen.getByText('Hallazgos de IA')).toBeInTheDocument();
  });

  it('opens the info panel', async () => {
    server.use(http.get(FINDINGS_PATH, () => HttpResponse.json(v14([]))));
    renderRail();
    await userEvent.click(screen.getByTestId('ai-findings-rail-info-toggle'));
    expect(
      screen.getByText(/Observaciones generadas por Yarbis a partir de los datos homologados/),
    ).toBeVisible();
  });
});
