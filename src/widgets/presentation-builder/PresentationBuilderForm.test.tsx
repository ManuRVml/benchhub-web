import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { API_BASE_URL } from '@/shared/api';
import { routes } from '@/shared/config';
import { ToastProvider } from '@/shared/ui/composites/toast';

import { server } from '../../test/msw/server';
import { createQueryHarness } from '../../test/query-wrapper';

import { PresentationBuilderForm } from './PresentationBuilderForm';
import { presentationBuilderTestIds } from './test-ids';

import type { PresentationBuilder } from '@/entities/presentation';

const PRESENTATION_ID = 'prs_builder_1';

/** `count` charts of one module, ids `c1..cN`; `selected` marks the ones already on. */
function charts(count: number, selected: readonly number[] = []) {
  return Array.from({ length: count }, (_, i) => ({
    id: `c${String(i + 1)}`,
    label: `Chart ${String(i + 1)}`,
    isSelected: selected.includes(i + 1),
  }));
}

const BUILDER: PresentationBuilder = {
  meta: { title: '', date: null, language: 'es', templateId: null },
  templates: [
    {
      id: 'directorio',
      name: 'Directorio Ejecutivo',
      description: 'Desc A',
      accentKey: 'template.directorio',
    },
    {
      id: 'storytelling',
      name: 'Storytelling de Mercado',
      description: 'Desc B',
      accentKey: 'template.storytelling',
    },
    {
      id: 'analitico',
      name: 'Detalle Analítico',
      description: 'Desc C',
      accentKey: 'template.detalleAnalitico',
    },
  ],
  includeCover: true,
  includeClosing: true,
  modules: [
    { id: 'hom', label: 'Detalle y edición de datos por compañía', charts: charts(2) },
    { id: 'comp', label: 'Comparativo GE vs. Promedio Pares', charts: charts(8, [1]) },
    { id: 'pvc', label: 'PVC', charts: charts(5) },
    { id: 'resumen', label: 'Resumen', charts: charts(1) },
    { id: 'panorama', label: 'Panorama', charts: charts(4) },
    { id: 'peso', label: 'Peso por dimensión', charts: charts(1) },
    { id: 'hallazgos', label: 'Hallazgos de IA', charts: charts(1, [1]) },
  ],
  slideCount: 7,
  notes: {},
  pendingNoteCount: 4,
  uploadedVersion: null,
  commentCount: 0,
  permissions: { canEdit: true, canPublish: true, canUpload: true, canDraftWithAssistant: true },
};

const THREAD = {
  items: [
    {
      id: 'cmt_b1',
      kind: 'comment',
      author: { name: 'Jorge Salas', roleLabelKey: 'role.executiveViewer' },
      text: 'Incluir el comparativo frente a Shell antes de los hallazgos.',
      createdAt: '2026-09-27T09:10:00-05:00',
      status: 'pending',
      decision: null,
      replies: [],
    },
  ],
  page: 1,
  pageSize: 20,
  totalItems: 1,
  permissions: { canComment: true, canReply: true, canRequestChange: false, canResolve: false },
};

function serveBuilder(builder: PresentationBuilder = BUILDER) {
  let current = builder;
  const patches: unknown[] = [];
  const drafts: unknown[] = [];
  server.use(
    http.get(`${API_BASE_URL}/views/comment-thread`, () => HttpResponse.json(THREAD)),
    http.post(`${API_BASE_URL}/slide-comment-drafts`, async ({ request }) => {
      const body = (await request.json()) as { slideKey: string };
      drafts.push(body);
      return HttpResponse.json({
        text: `Borrador ${body.slideKey}`,
        status: 'suggestion',
        generatedBy: { model: 'mock-llm', version: '1' },
      });
    }),
    http.get(`${API_BASE_URL}/views/presentation-builder/${PRESENTATION_ID}`, () =>
      HttpResponse.json(current),
    ),
    http.patch(`${API_BASE_URL}/presentations/${PRESENTATION_ID}`, async ({ request }) => {
      const body = (await request.json()) as Partial<PresentationBuilder>;
      patches.push(body);
      current = { ...current, ...body, meta: { ...current.meta, ...body.meta } };
      // The C-28 response of the vendored contract: the saved builder subset, ids and selection only (no labels).
      return HttpResponse.json({
        meta: current.meta,
        modules: current.modules.map((module_) => ({
          id: module_.id,
          charts: module_.charts.map(({ id, isSelected }) => ({ id, isSelected })),
        })),
        includeCover: current.includeCover,
        includeClosing: current.includeClosing,
        notes: current.notes,
      });
    }),
  );
  return Object.assign(patches, { drafts });
}

function renderForm() {
  const { wrapper: Providers } = createQueryHarness();
  return render(
    <Providers>
      <ToastProvider>
        <MemoryRouter initialEntries={['/presentaciones/nueva']}>
          <Routes>
            <Route
              path="/presentaciones/nueva"
              element={<PresentationBuilderForm presentationId={PRESENTATION_ID} />}
            />
            <Route path={routes.presentations.path} element={<p data-testid="list-landed" />} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    </Providers>,
  );
}

describe('PresentationBuilderForm (SCR-13 builder)', () => {
  it('selecting a template autosaves it (C-28)', async () => {
    const patches = serveBuilder();
    renderForm();
    const user = userEvent.setup({ delay: null });

    await screen.findByTestId(presentationBuilderTestIds.root);
    await user.click(screen.getByTestId(presentationBuilderTestIds.template('storytelling')));

    await vi.waitFor(() => {
      // The form patches one field; the hook completes `meta` from the cached V-41 builder because the vendored C-28
      // request type has a complete `meta` (title, date, language, templateId).
      expect(patches).toContainEqual({
        meta: { title: '', date: null, language: 'es', templateId: 'storytelling' },
      });
    });
  });

  it('"Seleccionar todo" drives the slide count to 24 (22 charts + cover + closing)', async () => {
    serveBuilder();
    renderForm();
    const user = userEvent.setup({ delay: null });

    await screen.findByTestId(presentationBuilderTestIds.root);
    // 2 pre-selected charts (comp c1, hallazgos c1) + Portada + Cierre.
    expect(screen.getByTestId(presentationBuilderTestIds.slideCountBadge)).toHaveTextContent(
      '4 diapositivas',
    );

    await user.click(screen.getByTestId(presentationBuilderTestIds.selectAll));
    expect(screen.getByTestId(presentationBuilderTestIds.slideCountBadge)).toHaveTextContent(
      '24 diapositivas',
    );

    await user.click(screen.getByTestId(presentationBuilderTestIds.clear));
    expect(screen.getByTestId(presentationBuilderTestIds.slideCountBadge)).toHaveTextContent(
      '2 diapositivas',
    );
  });

  it('Portada / Cierre toggles autosave', async () => {
    const patches = serveBuilder();
    renderForm();
    const user = userEvent.setup({ delay: null });

    await screen.findByTestId(presentationBuilderTestIds.root);
    await user.click(screen.getByTestId(presentationBuilderTestIds.cover));

    await vi.waitFor(() => {
      expect(patches).toContainEqual({ includeCover: false });
    });
  });

  it('is the "Nueva presentación" card with Título and Fecha on one row (HTML L2393-2404)', async () => {
    serveBuilder();
    renderForm();
    await screen.findByTestId(presentationBuilderTestIds.root);
    expect(screen.getByRole('heading', { level: 2, name: 'Nueva presentación' })).toBeVisible();
    const row = screen.getByTestId(presentationBuilderTestIds.titleRow);
    expect(row).toHaveClass('laptop:grid-cols-[2fr_1fr]');
    expect(within(row).getByRole('textbox', { name: 'Título' })).toHaveAttribute(
      'placeholder',
      'Ej. Directorio Ejecutivo T1 2026',
    );
    expect(within(row).getByLabelText('Fecha')).toBeInTheDocument();
  });

  it('shows the 3 presentation types as cards in a row, each with an SVG mini slide in its accent', async () => {
    serveBuilder();
    renderForm();
    await screen.findByTestId(presentationBuilderTestIds.root);
    const grid = screen.getByTestId(presentationBuilderTestIds.templates);
    expect(grid).toHaveClass('tablet:grid-cols-3');
    const cards = within(grid).getAllByRole('button');
    expect(cards).toHaveLength(3);
    const preview = within(
      screen.getByTestId(presentationBuilderTestIds.template('storytelling')),
    ).getByTestId('template-preview-storytelling');
    expect(preview.tagName.toLowerCase()).toBe('svg');
    const bars = preview.querySelectorAll('[data-part="bar"]');
    expect(bars).toHaveLength(4);
    expect(bars[0]).toHaveClass('fill-template-storytelling');
    // V-41 `templateId: null` renders as Directorio.
    expect(cards[0]).toHaveAttribute('aria-pressed', 'true');
  });

  it('heads "Tipos de slides a incluir" with the brand-light count pill, Yarbis, Seleccionar todo · Limpiar', async () => {
    serveBuilder();
    renderForm();
    await screen.findByTestId(presentationBuilderTestIds.root);
    expect(screen.getByRole('heading', { name: 'Tipos de slides a incluir' })).toBeVisible();
    expect(screen.getByTestId(presentationBuilderTestIds.slideCountBadge)).toHaveAttribute(
      'data-variant',
      'count-brand',
    );
    // 2 selected charts, neither with a note.
    expect(screen.getByTestId(presentationBuilderTestIds.draftAll)).toHaveAccessibleName(
      /Redactar comentarios con Yarbis \(2\)/,
    );
    // Portada / Cierre sit above the slide groups.
    const cover = screen.getByTestId(presentationBuilderTestIds.cover);
    const firstGroup = screen.getByTestId(presentationBuilderTestIds.group('hom'));
    expect(
      cover.compareDocumentPosition(firstGroup) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(cover).toHaveAttribute('data-variant', 'soft');
  });

  it('"✦ Redactar comentarios con Yarbis" drafts every pending slide (C-32) and saves them as notes (C-28)', async () => {
    const patches = serveBuilder();
    renderForm();
    const user = userEvent.setup({ delay: null });
    await user.click(await screen.findByTestId(presentationBuilderTestIds.draftAll));

    await vi.waitFor(() => {
      expect(patches.drafts).toEqual([
        { presentationId: PRESENTATION_ID, slideKey: 'comp|c1', language: 'es' },
        { presentationId: PRESENTATION_ID, slideKey: 'hallazgos|c1', language: 'es' },
      ]);
    });
    await vi.waitFor(() => {
      expect(patches).toContainEqual({
        notes: { 'comp|c1': 'Borrador comp|c1', 'hallazgos|c1': 'Borrador hallazgos|c1' },
      });
    });
    expect(screen.getByText('Borrador comp|c1')).toBeInTheDocument();
    expect(screen.queryByTestId(presentationBuilderTestIds.draftAll)).toBeNull();
  });

  it('renders each slide group as a card, lilac with "Comentarios por slide" when selected', async () => {
    serveBuilder();
    renderForm();
    await screen.findByTestId(presentationBuilderTestIds.root);
    const on = screen.getByTestId(presentationBuilderTestIds.group('comp'));
    expect(on).toHaveAttribute('data-selected', 'true');
    expect(on).toHaveClass('rounded-md', 'border-brand-primary-border', 'bg-brand-primary-faint');
    expect(within(on).getByText('Comentarios por slide')).toBeInTheDocument();
    expect(within(on).getByText('1/8 gráficas')).toBeInTheDocument();
    const off = screen.getByTestId(presentationBuilderTestIds.group('hom'));
    expect(off).toHaveAttribute('data-selected', 'false');
    expect(off).toHaveClass('border-border-default');
    expect(within(off).queryByText('Comentarios por slide')).toBeNull();
  });

  it('shows "Versión PPT cargada" and opens the upload flow (OVL-07a) from it', async () => {
    serveBuilder();
    renderForm();
    const user = userEvent.setup({ delay: null });
    await screen.findByTestId(presentationBuilderTestIds.root);
    expect(screen.getByRole('heading', { name: 'Versión PPT cargada' })).toBeVisible();
    await user.click(screen.getByTestId('presentation-version-upload'));
    expect(await screen.findByRole('dialog', { name: 'Cargar versión PPT' })).toBeVisible();
  });

  it('shows the presentation comments thread (V-26) with its count', async () => {
    serveBuilder({ ...BUILDER, commentCount: 1 });
    renderForm();
    const comments = await screen.findByTestId(presentationBuilderTestIds.comments);
    expect(within(comments).getByRole('heading', { name: 'Comentarios' })).toBeVisible();
    expect(await within(comments).findByText('Jorge Salas')).toBeInTheDocument();
  });

  it('ends with Previsualizar y ordenar · ↑ Cargar PPT · ↓ Descargar · Publicar (no Compartir)', async () => {
    serveBuilder();
    renderForm();
    await screen.findByTestId(presentationBuilderTestIds.root);
    const footer = screen.getByTestId(presentationBuilderTestIds.footer);
    expect(
      within(footer)
        .getAllByRole('button')
        .map((button) => button.textContent),
    ).toEqual(['Previsualizar y ordenar', '↑ Cargar PPT', '↓ Descargar', 'Publicar presentación']);
  });

  it('Cancelar navigates away without saving', async () => {
    const patches = serveBuilder();
    renderForm();
    const user = userEvent.setup({ delay: null });

    await screen.findByTestId(presentationBuilderTestIds.root);
    await user.click(screen.getByTestId(presentationBuilderTestIds.cancel));

    expect(await screen.findByTestId('list-landed')).toBeInTheDocument();
    expect([...patches]).toEqual([]);
  });
});
