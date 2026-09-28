import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { API_BASE_URL } from '@/shared/api';
import { ToastProvider } from '@/shared/ui/composites/toast';

import { server } from '../../../test/msw/server';
import { createQueryHarness } from '../../../test/query-wrapper';
import { ExecutiveNarrativeButton } from '../ui/ExecutiveNarrativeButton';

const ANALYSIS_ID = 'ana_1';

function serve(options: { fails?: boolean } = {}) {
  const requests: unknown[] = [];
  server.use(
    http.post(`${API_BASE_URL}/executive-narratives`, async ({ request }) => {
      requests.push(await request.json());
      if (options.fails) {
        return HttpResponse.json(
          { code: 'ANALYSIS_NOT_FOUND', message: 'Not found', traceId: 't1' },
          { status: 404 },
        );
      }
      return HttpResponse.json({
        sections: [{ title: 'Resumen', text: 'Ecopetrol supera al promedio TBG en ROACE.' }],
        status: 'suggestion',
        generatedBy: { model: 'template', version: '1' },
      });
    }),
  );
  return { requests };
}

function renderButton() {
  const { wrapper: Wrapper } = createQueryHarness();
  return render(
    <Wrapper>
      <ToastProvider>
        <MemoryRouter initialEntries={['/analisis/ana_1/resultados']}>
          <Routes>
            <Route
              path="*"
              element={
                <ExecutiveNarrativeButton
                  analysisId={ANALYSIS_ID}
                  section="overview"
                  title="Resumen del informe"
                />
              }
            />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    </Wrapper>,
  );
}

describe('ExecutiveNarrativeButton / ExecutiveNarrativeModal', () => {
  it('opens, calls C-15 exactly once, and shows the narrative text', async () => {
    const { requests } = serve();
    const user = userEvent.setup();
    renderButton();

    await user.click(screen.getByTestId('executive-narrative-button'));

    expect(
      await screen.findByText('Ecopetrol supera al promedio TBG en ROACE.'),
    ).toBeInTheDocument();
    expect(requests).toEqual([{ scope: 'results', section: 'overview', analysisId: ANALYSIS_ID }]);
  });

  it('copies the exact narrative text and shows the confirmation, which hides after 1.6s', async () => {
    serve();
    const user = userEvent.setup();
    renderButton();

    await user.click(screen.getByTestId('executive-narrative-button'));
    await screen.findByText('Ecopetrol supera al promedio TBG en ROACE.');

    // jsdom's real (lazily-created) Clipboard object only exists once accessed; spy on its method here, after
    // render, rather than trying to replace `navigator.clipboard` itself (jsdom rejects that silently).
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
    await user.click(screen.getByTestId('executive-narrative-button-modal-copy'));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('Ecopetrol supera al promedio TBG en ROACE.');
    });
    expect(await screen.findByText('✓ Copiado')).toBeInTheDocument();

    // Real timers: the toast's own 1.6 s dismiss timer, waited out for real rather than faked.
    await waitFor(
      () => {
        expect(screen.queryByText('✓ Copiado')).not.toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it('shows an error state and retries via C-15 again', async () => {
    const { requests } = serve({ fails: true });
    const user = userEvent.setup();
    renderButton();

    await user.click(screen.getByTestId('executive-narrative-button'));
    await screen.findByTestId('executive-narrative-button-modal-error');
    expect(requests).toHaveLength(1);

    await user.click(screen.getByTestId('executive-narrative-button-modal-retry'));
    await waitFor(() => {
      expect(requests).toHaveLength(2);
    });
  });

  it('returns focus to the trigger on close', async () => {
    serve();
    const user = userEvent.setup();
    renderButton();

    const trigger = screen.getByTestId('executive-narrative-button');
    await user.click(trigger);
    await screen.findByText('Ecopetrol supera al promedio TBG en ROACE.');

    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });
  });

  it('"Usar en presentación" closes the modal and navigates with analysisId', async () => {
    serve();
    const user = userEvent.setup();
    const { wrapper: Wrapper } = createQueryHarness();
    render(
      <Wrapper>
        <ToastProvider>
          <MemoryRouter initialEntries={['/analisis/ana_1/resultados']}>
            <Routes>
              <Route
                path="*"
                element={
                  <ExecutiveNarrativeButton
                    analysisId={ANALYSIS_ID}
                    section="overview"
                    title="Resumen del informe"
                  />
                }
              />
              <Route
                path="/presentaciones/nueva"
                element={<div data-testid="presentation-new-page" />}
              />
            </Routes>
          </MemoryRouter>
        </ToastProvider>
      </Wrapper>,
    );

    await user.click(screen.getByTestId('executive-narrative-button'));
    await screen.findByText('Ecopetrol supera al promedio TBG en ROACE.');
    await user.click(screen.getByTestId('executive-narrative-button-modal-use-in-presentation'));

    expect(await screen.findByTestId('presentation-new-page')).toBeInTheDocument();
  });
});
