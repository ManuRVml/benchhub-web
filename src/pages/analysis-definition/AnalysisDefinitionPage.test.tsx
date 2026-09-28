import { configure, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router';
import { describe, expect, it } from 'vitest';

import { API_BASE_URL } from '@/shared/api';
import { loadFixture } from '@/shared/api/mock';
import { routes } from '@/shared/config';
import { competitorPickerTestIds } from '@/widgets/competitor-picker';
import { indicatorPickerTestIds } from '@/widgets/indicator-picker';

import { server } from '../../test/msw/server';
import { createQueryHarness } from '../../test/query-wrapper';

import { AnalysisDefinitionPage } from './AnalysisDefinitionPage';

import type { V05Response, V08Response } from '@/shared/api';

// Queries wait up to 3 s: the page loads V-05 / V-08 through MSW, which the full suite slows down.
configure({ asyncUtilTimeout: 3000 });

const DRAFT_ID = 'drf_01J9ZA2B3C';
const DRAFT_PATH = `${API_BASE_URL}/analysis-drafts/${DRAFT_ID}`;

function Location() {
  const location = useLocation();
  return <output data-testid="location">{`${location.pathname}${location.search}`}</output>;
}

/** The page under the real route path, with a Resultados stub to observe the navigation after C-03. */
function renderPage(search = '') {
  const { wrapper: Providers } = createQueryHarness();
  const router = createMemoryRouter(
    [
      {
        path: routes.analysisDefinition.path,
        element: (
          <>
            <AnalysisDefinitionPage />
            <Location />
          </>
        ),
      },
      {
        path: routes.analysisResults.path,
        element: (
          <>
            <p>{'Resultados stub'}</p>
            <Location />
          </>
        ),
      },
    ],
    { initialEntries: [`/analisis/${DRAFT_ID}/definicion${search}`] },
  );
  render(
    <Providers>
      <RouterProvider router={router} />
    </Providers>,
  );
  return router;
}

const location = () => screen.getByTestId('location').textContent;
const stepCard = async () => screen.findByRole('region', { name: /^Paso \d/ });

async function fixture<T>(operation: 'getAnalysisDefinitionView' | 'getAnalysisValidationView') {
  return structuredClone(await loadFixture(operation)) as T;
}

/** C-02 handler that records every body and answers with the given field errors. */
function recordDraftSaves(errors: { field: string; code: string }[] = []) {
  const bodies: unknown[] = [];
  server.use(
    http.patch(DRAFT_PATH, async ({ request }) => {
      bodies.push(await request.json());
      return HttpResponse.json({ validationState: { isValid: errors.length === 0, errors } });
    }),
  );
  return bodies;
}

const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

describe('AnalysisDefinitionPage', () => {
  describe('step in the URL (paso)', () => {
    it.each([
      ['', 1],
      ['?paso=3', 3],
      ['?paso=5', 5],
      ['?paso=9', 1],
      ['?paso=0', 1],
      ['?paso=abc', 1],
    ])('%s opens step %i', async (search, step) => {
      renderPage(search);
      const card = await stepCard();
      expect(card).toHaveAccessibleName(
        expect.stringMatching(new RegExp(`^Paso ${String(step)} ·`)) as string,
      );
      expect(screen.getByTestId('analysis-definition-wizard')).toHaveAttribute(
        'data-step',
        String(step),
      );
    });
  });

  it('renders no in-content title: the app shell header is the page h1 (F0-3)', async () => {
    renderPage();
    await stepCard();
    expect(screen.queryByRole('heading', { level: 1 })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Definición del análisis' })).toBeNull();
  });

  it('moves with "Siguiente ›" / "‹ Anterior" and the stepper, writing paso to the URL', async () => {
    const user = userEvent.setup();
    renderPage();
    await stepCard();
    expect(screen.getByRole('button', { name: '‹ Anterior' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Siguiente ›' }));
    expect(
      await screen.findByRole('region', { name: 'Paso 2 · Competidores' }),
    ).toBeInTheDocument();
    expect(location()).toBe(`/analisis/${DRAFT_ID}/definicion?paso=2`);

    await user.click(screen.getByRole('button', { name: '‹ Anterior' }));
    expect(
      await screen.findByRole('region', { name: 'Paso 1 · Información general' }),
    ).toBeInTheDocument();

    const stepper = screen.getByRole('list', { name: 'Pasos' });
    await user.click(within(stepper).getByRole('button', { name: /Fuentes/ }));
    expect(await screen.findByRole('region', { name: 'Paso 4 · Fuentes' })).toBeInTheDocument();
    expect(location()).toBe(`/analisis/${DRAFT_ID}/definicion?paso=4`);
    expect(within(stepper).getByRole('button', { name: /Fuentes/ })).toHaveAttribute(
      'aria-current',
      'step',
    );

    await user.click(screen.getByRole('button', { name: 'Siguiente ›' }));
    expect(await screen.findByRole('region', { name: 'Paso 5 · Validación' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Siguiente ›' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Generar análisis' })).toBeInTheDocument();
  });

  it('shows the V-05 step status in the stepper (done / invalid / pending)', async () => {
    const view = await fixture<V05Response>('getAnalysisDefinitionView');
    view.stepStatus = view.stepStatus.map((entry) =>
      entry.step === 2
        ? { ...entry, status: 'invalid' }
        : entry.step === 3
          ? { ...entry, status: 'untouched' }
          : entry,
    );
    server.use(
      http.get(`${API_BASE_URL}/views/analysis-definition/:draftId`, () => HttpResponse.json(view)),
    );
    renderPage('?paso=4');
    await stepCard();
    const stepper = screen.getByRole('list', { name: 'Pasos' });
    expect(within(stepper).getByRole('button', { name: /Información general/ })).toHaveAttribute(
      'data-status',
      'done',
    );
    expect(within(stepper).getByRole('button', { name: /Competidores/ })).toHaveAttribute(
      'data-status',
      'invalid',
    );
    expect(within(stepper).getByRole('button', { name: /Indicadores/ })).toHaveAttribute(
      'data-status',
      'pending',
    );
  });

  it('a fresh draft on step 1 shows steps 2–5 pending, not completed, although V-05 says 1–4 are valid', async () => {
    const user = userEvent.setup();
    renderPage();
    await stepCard();
    const stepper = screen.getByRole('list', { name: 'Pasos' });
    const status = (name: RegExp) =>
      within(stepper).getByRole('button', { name }).getAttribute('data-status');
    expect(status(/Información general/)).toBe('current');
    for (const name of [/Competidores/, /Indicadores/, /Fuentes/, /Validación/]) {
      expect(status(name)).toBe('pending');
    }
    expect(within(stepper).queryByText('(completado)')).toBeNull();

    // Opening step 3 marks the steps before it (and step 3 itself, once left) by their V-05 status.
    await user.click(within(stepper).getByRole('button', { name: /Indicadores/ }));
    await screen.findByRole('region', { name: 'Paso 3 · Selección de indicadores' });
    expect(status(/Información general/)).toBe('done');
    expect(status(/Competidores/)).toBe('done');
    expect(status(/Fuentes/)).toBe('pending');
    await user.click(within(stepper).getByRole('button', { name: /Información general/ }));
    await screen.findByRole('region', { name: 'Paso 1 · Información general' });
    expect(status(/Indicadores/)).toBe('done');
    expect(status(/Competidores/)).toBe('pending');
  });

  it('shows the analysis tabs above the stepper with "Configuración" active', async () => {
    renderPage();
    await stepCard();
    const tabs = screen.getByRole('tablist', { name: 'Pestañas del análisis' });
    expect(within(tabs).getByRole('tab', { name: 'Configuración' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(within(tabs).getByRole('tab', { name: 'Resultados' })).toBeDisabled();
    expect(within(tabs).getByRole('tab', { name: 'Presentación' })).toBeDisabled();
    expect(
      tabs.compareDocumentPosition(screen.getByRole('list', { name: 'Pasos' })) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  describe('step 1 layout (prototype BencHUD.dc.html:467-545)', () => {
    it('puts the two periods in two halves and the cut-off date in a narrow field', async () => {
      renderPage();
      await stepCard();
      const periods = screen.getByTestId('definition-general-periods');
      expect(periods.className.split(' ')).toEqual(
        expect.arrayContaining(['grid', 'tablet:grid-cols-2']),
      );
      const [current, compared] = within(periods).getAllByRole('group');
      expect(current).toHaveAccessibleName('Periodo actual');
      expect(compared).toHaveAccessibleName('Periodo comparado');
      expect(screen.getByTestId('definition-general-cut-off-date-field')).toHaveClass(
        'max-w-(--size-control-date-field)',
      );
    });

    it('labels every field with the uppercase muted eyebrow', async () => {
      renderPage();
      await stepCard();
      for (const name of [
        'Nombre del análisis',
        'Objetivo',
        'Pregunta del análisis',
        'Fecha de corte',
        'Tipo de análisis',
        'Alcance',
        'Periodo actual',
      ]) {
        expect(screen.getByText(name, { selector: 'label, p, legend' })).toHaveClass(
          'uppercase',
          'text-label',
          'text-text-muted',
        );
      }
    });

    it('shows Tipo de análisis and Alcance as lilac-outline options without a check mark', async () => {
      renderPage();
      await stepCard();
      for (const name of ['Estratégico TBG', 'Grupo Ecopetrol']) {
        const chip = screen.getByRole('button', { name });
        expect(chip).toHaveAttribute('aria-pressed', 'true');
        expect(chip).toHaveAttribute('data-variant', 'option');
        expect(chip).toHaveClass('bg-brand-primary-subtle', 'border-brand-primary-border');
        expect(chip).not.toHaveClass('bg-brand-primary');
        expect(chip.textContent).not.toContain('✓');
      }
      expect(screen.getByRole('button', { name: 'ISA' })).toHaveAttribute('data-variant', 'option');
    });
  });

  describe('step 1 autosave (C-02)', () => {
    it('debounces a burst of edits into one PATCH with every changed field', async () => {
      const saves = recordDraftSaves();
      renderPage('?paso=1');
      const name = await screen.findByRole('textbox', { name: 'Nombre del análisis' });
      // A synchronous burst (three edits, two fields) always falls inside the 500 ms window, whatever the suite load.
      fireEvent.change(name, { target: { value: 'ROACE' } });
      fireEvent.change(name, { target: { value: 'ROACE 2025' } });
      fireEvent.click(screen.getByRole('button', { name: 'ISA' }));
      expect(saves).toHaveLength(0);

      await waitFor(() => {
        expect(saves).toHaveLength(1);
      });
      expect(saves[0]).toEqual({
        step: 1,
        fields: { name: 'ROACE 2025', scope: ['grupo_ecopetrol', 'isa'] },
      });
      await wait(700);
      expect(saves).toHaveLength(1);
      expect(await screen.findByText('Guardado')).toBeInTheDocument();
    });

    it('sends periods as numbers and an emptied cut-off date as null', async () => {
      const user = userEvent.setup();
      const saves = recordDraftSaves();
      renderPage();
      const quarter = await screen.findByRole('combobox', {
        name: 'Periodo comparado · Trimestre',
      });
      await user.selectOptions(quarter, '2');
      await waitFor(() => {
        expect(saves).toHaveLength(1);
      });
      expect(saves[0]).toEqual({ step: 1, fields: { 'comparedPeriod.quarter': 2 } });
    });

    it('shows the C-02 errors[] as field errors', async () => {
      const user = userEvent.setup();
      recordDraftSaves([
        { field: 'objective', code: 'tooLong' },
        { field: 'fieldName', code: 'required' },
      ]);
      renderPage();
      const objective = await screen.findByRole('textbox', { name: 'Objetivo' });
      await user.type(objective, ' Más contexto.');
      expect(await screen.findByText('El texto es demasiado largo.')).toBeInTheDocument();
      expect(objective).toHaveAttribute('aria-invalid', 'true');
    });

    it('shows the client rules without waiting for the BFF', async () => {
      const user = userEvent.setup();
      recordDraftSaves();
      renderPage();
      const name = await screen.findByRole('textbox', { name: 'Nombre del análisis' });
      await user.clear(name);
      expect(await screen.findByText('Este campo es obligatorio.')).toBeInTheDocument();
      await user.selectOptions(
        screen.getByRole('combobox', { name: 'Periodo comparado · Año' }),
        '2026',
      );
      expect(
        await screen.findByText('El periodo comparado debe ser anterior al periodo actual.'),
      ).toBeInTheDocument();
    });

    it('shows the autosave error toast when C-02 fails', async () => {
      const user = userEvent.setup();
      server.use(
        http.patch(DRAFT_PATH, () =>
          HttpResponse.json(
            { code: 'INTERNAL_ERROR', message: 'boom', traceId: 't' },
            { status: 500 },
          ),
        ),
      );
      renderPage();
      await user.type(await screen.findByRole('textbox', { name: 'Pregunta del análisis' }), '?');
      expect(
        await screen.findByText('No se pudieron guardar los cambios del borrador.'),
      ).toBeInTheDocument();
    });
  });

  describe('step 2 competitors (C-02)', () => {
    it('starts with the 7 default companies selected, debounces a burst into one PATCH', async () => {
      const saves = recordDraftSaves();
      renderPage('?paso=2');
      const petrobras = await screen.findByTestId(competitorPickerTestIds.company('cmp_petrobras'));
      expect(petrobras).toHaveAttribute('aria-pressed', 'false');
      expect(screen.getByTestId(competitorPickerTestIds.company('cmp_exxon'))).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      expect(screen.getByTestId(competitorPickerTestIds.company('cmp_chevron'))).toHaveAttribute(
        'aria-pressed',
        'true',
      );

      // A synchronous burst across two different controls: add Petrobras, then deselect the whole Super Majors
      // group (Exxon + Chevron, both pre-selected).
      fireEvent.click(petrobras);
      fireEvent.click(screen.getByTestId(competitorPickerTestIds.groupToggle('super_majors')));
      expect(saves).toHaveLength(0);

      await waitFor(() => {
        expect(saves).toHaveLength(1);
      });
      expect(saves[0]).toEqual({
        step: 2,
        fields: {
          competitorIds: [
            'cmp_shell',
            'cmp_equinor',
            'cmp_total',
            'cmp_bp',
            'cmp_pttep',
            'cmp_petrobras',
          ],
        },
      });
      await wait(700);
      expect(saves).toHaveLength(1);
    });

    it('shows the C-02 competitorIds error on the picker', async () => {
      recordDraftSaves([{ field: 'competitorIds', code: 'atLeastOne' }]);
      renderPage('?paso=2');
      fireEvent.click(await screen.findByTestId(competitorPickerTestIds.company('cmp_petrobras')));
      expect(await screen.findByTestId(competitorPickerTestIds.error)).toHaveTextContent(
        'Selecciona al menos una opción.',
      );
    });
  });

  describe('step 3 indicators (C-02)', () => {
    it('debounces a burst of bulk-select toggles into one PATCH', async () => {
      const saves = recordDraftSaves();
      renderPage('?paso=3');
      const roace = await screen.findByTestId(indicatorPickerTestIds.item('ind_roace'));
      expect(roace).toHaveAttribute('aria-pressed', 'true');

      const groupToggle = screen.getByTestId(indicatorPickerTestIds.groupToggle('rentabilidad'));
      // Two rapid clicks of the same group toggle (deselect, then reselect): still one PATCH.
      fireEvent.click(groupToggle);
      fireEvent.click(groupToggle);
      expect(saves).toHaveLength(0);

      await waitFor(() => {
        expect(saves).toHaveLength(1);
      });
      expect(saves[0]).toEqual({
        step: 3,
        fields: { indicatorIds: ['ind_margen_ebitda', 'ind_roace'] },
      });
    });

    it('shows the C-02 indicatorIds error on the picker', async () => {
      recordDraftSaves([{ field: 'indicatorIds', code: 'atLeastOne' }]);
      renderPage('?paso=3');
      fireEvent.click(await screen.findByTestId(indicatorPickerTestIds.item('ind_roace')));
      expect(await screen.findByTestId(indicatorPickerTestIds.error)).toHaveTextContent(
        'Selecciona al menos una opción.',
      );
    });
  });

  describe('step 5 generation (C-03)', () => {
    async function allowGeneration() {
      const validation = await fixture<V08Response>('getAnalysisValidationView');
      validation.permissions = { canGenerate: true };
      server.use(
        http.get(`${API_BASE_URL}/views/analysis-validation/:draftId`, () =>
          HttpResponse.json(validation),
        ),
      );
    }

    it('shows the V-08 summary, calls C-03 with the operation toast and navigates to Resultados', async () => {
      const user = userEvent.setup();
      await allowGeneration();
      let release: () => void = () => undefined;
      const requests: string[] = [];
      server.use(
        http.post(`${DRAFT_PATH}/generation`, async ({ request }) => {
          requests.push(request.url);
          await new Promise<void>((resolve) => {
            release = resolve;
          });
          return HttpResponse.json({ operationId: 'op_42', status: 'accepted' }, { status: 202 });
        }),
      );
      renderPage('?paso=5');
      expect(await screen.findByTestId('definition-validation-scope')).toHaveTextContent(
        'Grupo Ecopetrol · Trimestral T4 2025',
      );
      expect(screen.getByText('Competidores seleccionados (2)')).toBeInTheDocument();
      expect(screen.getByText('Rentabilidad (3)')).toBeInTheDocument();
      expect(screen.getByTestId('definition-validation-exclusion-alert')).toHaveTextContent('ISA');

      const generate = screen.getByRole('button', { name: 'Generar análisis' });
      await waitFor(() => {
        expect(generate).toBeEnabled();
      });
      await user.click(generate);
      expect(await screen.findByText('Generando análisis…')).toBeInTheDocument();
      await waitFor(() => {
        expect(requests).toHaveLength(1);
      });
      release();
      expect(await screen.findByText('Resultados stub')).toBeInTheDocument();
      expect(location()).toBe(routes.analysisResults.build({ analysisId: DRAFT_ID }));
    });

    it('keeps "Generar análisis" disabled while V-08 does not allow it', async () => {
      renderPage('?paso=5');
      await screen.findByTestId('definition-validation-scope');
      expect(screen.getByRole('button', { name: 'Generar análisis' })).toBeDisabled();
    });

    it('blocks generation and names the invalid steps', async () => {
      await allowGeneration();
      const view = await fixture<V05Response>('getAnalysisDefinitionView');
      view.stepStatus = view.stepStatus.map((entry) =>
        entry.step === 2 ? { ...entry, status: 'invalid' } : entry,
      );
      server.use(
        http.get(`${API_BASE_URL}/views/analysis-definition/:draftId`, () =>
          HttpResponse.json(view),
        ),
      );
      renderPage('?paso=5');
      expect(await screen.findByTestId('definition-validation-blocked')).toHaveTextContent(
        'Completa Competidores para generar el análisis.',
      );
      expect(screen.getByRole('button', { name: 'Generar análisis' })).toBeDisabled();
    });

    it('shows the error banner when C-03 fails', async () => {
      const user = userEvent.setup();
      await allowGeneration();
      server.use(
        http.post(`${DRAFT_PATH}/generation`, () =>
          HttpResponse.json(
            { code: 'DRAFT_INVALID', message: 'no', traceId: 't' },
            { status: 409 },
          ),
        ),
      );
      renderPage('?paso=5');
      const generate = await screen.findByRole('button', { name: 'Generar análisis' });
      await waitFor(() => {
        expect(generate).toBeEnabled();
      });
      await user.click(generate);
      expect(await screen.findByTestId('analysis-definition-generate-error')).toHaveTextContent(
        'No se pudo generar el análisis. Intenta de nuevo.',
      );
      expect(screen.queryByText('Resultados stub')).toBeNull();
    });
  });
});
