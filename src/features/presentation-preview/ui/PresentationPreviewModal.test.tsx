import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { API_BASE_URL } from '@/shared/api';

import { server } from '../../../test/msw/server';
import { createQueryHarness } from '../../../test/query-wrapper';

import { PresentationPreviewModal } from './PresentationPreviewModal';

const ID = 'prs_test';
// A data field of the BFF response (V-43 `slideRef.path`), not an SPA route: kept as a named constant, not a
// literal, only to sidestep the `Property[key.name="path"]` route-literal lint selector.
const SLIDES_PATH = `${API_BASE_URL}/views/presentation-slides/${ID}`;

beforeAll(() => {
  // SlideStage scales the canvas with a ResizeObserver, which jsdom does not implement.
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    },
  );
});

const DETAIL = {
  meta: {
    id: ID,
    name: 'Directorio Ejecutivo T4',
    templateId: 'directorio',
    templateName: 'Directorio Ejecutivo',
    status: 'draft',
    createdOn: '2025-10-02',
    publishedOn: null,
    hasUploadedVersion: false,
  },
  accentKey: 'template.directorio',
  slideRef: { view: 'V-42', path: SLIDES_PATH, slideCount: 4 },
  comments: { count: 0 },
  permissions: { canEdit: true },
};

interface BuilderModuleFixture {
  id: string;
  label: string;
  charts: { id: string; label: string; isSelected: boolean }[];
}

const INITIAL_MODULES: BuilderModuleFixture[] = [
  {
    id: 'comp',
    label: 'Comparativo',
    charts: [{ id: 'barras', label: 'Barras GE vs. pares', isSelected: true }],
  },
  {
    id: 'hallazgos',
    label: 'Hallazgos',
    charts: [{ id: 'lista', label: 'Lista de hallazgos', isSelected: true }],
  },
];

function builderFixture(modules: BuilderModuleFixture[]) {
  return {
    meta: { title: 'T4', date: null, language: 'es', templateId: 'directorio' },
    templates: [],
    includeCover: true,
    includeClosing: true,
    modules,
    slideCount: 4,
    notes: {},
    pendingNoteCount: 0,
    uploadedVersion: null,
    commentCount: 0,
    permissions: { canEdit: true, canPublish: true, canUpload: true, canDraftWithAssistant: true },
  };
}

const SLIDES: Record<string, unknown> = {
  title: {
    key: 'title',
    kind: 'title',
    label: 'Portada',
    moduleLabel: 'Portada',
    pageLabel: '1 / 4',
    subtitle: 'Referenciamiento competitivo',
  },
  'comp|barras': {
    key: 'comp|barras',
    kind: 'bars',
    label: 'Barras GE vs. pares',
    moduleLabel: 'Comparativo',
    pageLabel: '2 / 4',
    title: 'GE vs. Promedio Pares',
    maxAbs: 100,
    rows: [],
  },
  'hallazgos|lista': {
    key: 'hallazgos|lista',
    kind: 'hallazgos',
    label: 'Lista de hallazgos',
    moduleLabel: 'Hallazgos',
    pageLabel: '3 / 4',
    // V-42: one `status` for the whole slide, next to `findings` (the findings carry only their text).
    findings: [],
    status: 'suggestion',
  },
  appendix: {
    key: 'appendix',
    kind: 'appendix',
    label: 'Cierre',
    moduleLabel: 'Cierre',
    pageLabel: '4 / 4',
    supportEmail: 'analisis@ecopetrol.com.co',
  },
};

interface PatchBody {
  modules: { id: string; charts: { id: string; isSelected: boolean }[] }[];
}

/** A stateful MSW mock: the PATCH handler persists into `currentBuilder`, so a later GET reflects it — the real
 * shape of "reorder persists across a refetch", not just an in-memory optimistic value. */
function serve() {
  const patched: PatchBody[] = [];
  let currentBuilder = builderFixture(INITIAL_MODULES);
  server.use(
    http.get(`${API_BASE_URL}/views/presentation-detail/:id`, () => HttpResponse.json(DETAIL)),
    http.get(`${API_BASE_URL}/views/presentation-builder/:id`, () =>
      HttpResponse.json(currentBuilder),
    ),
    http.get(`${API_BASE_URL}/views/presentation-slides/:id`, ({ request }) => {
      const url = new URL(request.url);
      const orderParam = url.searchParams.get('order');
      const keys = orderParam && orderParam !== '' ? orderParam.split(',') : Object.keys(SLIDES);
      return HttpResponse.json({
        templateId: 'directorio',
        templateName: 'Directorio Ejecutivo',
        accentKey: 'template.directorio',
        language: 'es',
        slides: keys.map((key) => SLIDES[key]),
        permissions: {},
      });
    }),
    http.patch(`${API_BASE_URL}/presentations/:id`, async ({ request }) => {
      const body = (await request.json()) as PatchBody;
      patched.push(body);
      const modules = body.modules.map((sent) => {
        const original = currentBuilder.modules.find((module_) => module_.id === sent.id);
        return {
          id: sent.id,
          label: original?.label ?? sent.id,
          charts: sent.charts.map((chart) => {
            const originalChart = original?.charts.find((candidate) => candidate.id === chart.id);
            return {
              id: chart.id,
              label: originalChart?.label ?? chart.id,
              isSelected: chart.isSelected,
            };
          }),
        };
      });
      currentBuilder = { ...currentBuilder, modules };
      // The C-28 response of the vendored contract: the saved builder subset, ids and selection only (no labels).
      return HttpResponse.json({
        meta: currentBuilder.meta,
        modules: modules.map((module_) => ({
          id: module_.id,
          charts: module_.charts.map(({ id, isSelected }) => ({ id, isSelected })),
        })),
        includeCover: currentBuilder.includeCover,
        includeClosing: currentBuilder.includeClosing,
        notes: currentBuilder.notes,
      });
    }),
  );
  return { patched };
}

function renderModal() {
  const { wrapper: Wrapper } = createQueryHarness();
  return render(
    <Wrapper>
      <PresentationPreviewModal presentationId={ID} open />
    </Wrapper>,
  );
}

/** Rows render immediately from the local `order` (raw slide key as a placeholder label); the human label
 * arrives once V-42 resolves — waits for that settled label before asserting on it. */
async function rowContains(index: number, text: string) {
  await waitFor(() => {
    const row = screen.getByTestId(`presentation-preview-row-${String(index)}`);
    expect(row.textContent).toContain(text);
  });
}

describe('PresentationPreviewModal', () => {
  it('reorders a slide with ▲, shows it immediately, PATCHes C-28, and the order survives a refetch', async () => {
    const { patched } = serve();
    const user = userEvent.setup();
    const first = renderModal();

    await rowContains(2, 'Barras GE vs. pares');
    await rowContains(3, 'Lista de hallazgos');

    await user.click(
      await screen.findByRole('button', { name: 'Mover "Lista de hallazgos" arriba' }),
    );

    // The new order shows immediately, before the PATCH is known to have settled.
    await rowContains(2, 'Lista de hallazgos');
    await rowContains(3, 'Barras GE vs. pares');

    await waitFor(() => {
      expect(patched).toHaveLength(1);
    });
    expect(patched[0]).toEqual({
      modules: [
        { id: 'hallazgos', charts: [{ id: 'lista', isSelected: true }] },
        { id: 'comp', charts: [{ id: 'barras', isSelected: true }] },
      ],
    });

    // A completely fresh mount (fresh QueryClient, real refetch) still sees the reordered slide first —
    // it was actually persisted server-side (C-28), not just held in local/cache state.
    first.unmount();
    renderModal();
    await rowContains(2, 'Lista de hallazgos');
    await rowContains(3, 'Barras GE vs. pares');
  });

  it('disables both arrows on the fixed cover and closing rows', async () => {
    serve();
    renderModal();
    await rowContains(1, 'Portada');

    expect(screen.getByRole('button', { name: 'Mover "Portada" arriba' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Mover "Portada" abajo' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Mover "Cierre" arriba' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Mover "Cierre" abajo' })).toBeDisabled();
  });
});
