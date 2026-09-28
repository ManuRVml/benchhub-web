import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { API_BASE_URL } from '@/shared/api';

import { server } from '../../../test/msw/server';
import { createQueryHarness } from '../../../test/query-wrapper';

import { usePresentationBuilderView } from './use-presentation-builder-view';
import { useUpdatePresentationBuilder } from './use-presentation-commands';

import type { PresentationBuilder } from './use-presentation-builder-view';

// C-28 as the hook sends it: the builder form patches ONE `meta` field, the vendored request type has a complete
// `meta`, so the hook completes it from the cached V-41 builder. The cached meta below has a distinct value in every
// field, so a body that took any field from the wrong side (edited vs cached) cannot pass by coincidence.

const ID = 'prs_test';
const CACHED_META = {
  title: 'Cached title',
  date: '2025-10-02',
  language: 'en',
  templateId: 'storytelling',
} as const;

const BUILDER: PresentationBuilder = {
  meta: CACHED_META,
  templates: [],
  includeCover: true,
  includeClosing: true,
  modules: [
    {
      id: 'comp',
      label: 'Comparativo',
      charts: [{ id: 'barras', label: 'Barras', isSelected: true }],
    },
  ],
  slideCount: 3,
  notes: {},
  pendingNoteCount: 0,
  uploadedVersion: null,
  commentCount: 0,
  permissions: { canEdit: true, canPublish: true, canUpload: true, canDraftWithAssistant: true },
};

interface PatchBody {
  meta?: object;
  [key: string]: unknown;
}

/** Serves V-41 and C-28; records the order of the requests and every C-28 body. */
function serve() {
  const requests: string[] = [];
  const bodies: PatchBody[] = [];
  server.use(
    http.get(`${API_BASE_URL}/views/presentation-builder/:id`, () => {
      requests.push('GET builder');
      return HttpResponse.json(BUILDER);
    }),
    http.patch(`${API_BASE_URL}/presentations/:id`, async ({ request }) => {
      const body = (await request.json()) as PatchBody;
      requests.push('PATCH presentation');
      bodies.push(body);
      return HttpResponse.json({
        meta: { ...BUILDER.meta, ...body.meta },
        modules: [{ id: 'comp', charts: [{ id: 'barras', isSelected: true }] }],
        includeCover: true,
        includeClosing: true,
        notes: {},
      });
    }),
  );
  return { requests, bodies };
}

/** Renders the mutation with the builder already in the cache (the state the form is in when it autosaves). */
async function renderWithCachedBuilder() {
  const harness = createQueryHarness();
  const builder = renderHook(() => usePresentationBuilderView(ID), { wrapper: harness.wrapper });
  await waitFor(() => {
    expect(builder.result.current.isSuccess).toBe(true);
  });
  return renderHook(() => useUpdatePresentationBuilder(ID), { wrapper: harness.wrapper });
}

describe('useUpdatePresentationBuilder (C-28) meta completion', () => {
  it('editing the title sends the NEW title and the cached date, language and templateId', async () => {
    const { bodies } = serve();
    const { result } = await renderWithCachedBuilder();
    await act(async () => {
      await result.current.mutateAsync({ meta: { title: 'Edited title' } });
    });
    expect(bodies).toEqual([
      {
        meta: {
          title: 'Edited title',
          date: '2025-10-02',
          language: 'en',
          templateId: 'storytelling',
        },
      },
    ]);
  });

  it('editing the language sends the NEW language and the cached title, date and templateId', async () => {
    const { bodies } = serve();
    const { result } = await renderWithCachedBuilder();
    await act(async () => {
      await result.current.mutateAsync({ meta: { language: 'es' } });
    });
    expect(bodies).toEqual([
      {
        meta: {
          title: 'Cached title',
          date: '2025-10-02',
          language: 'es',
          templateId: 'storytelling',
        },
      },
    ]);
  });

  it('editing the date to null sends null (an edit is never replaced by the cached value), the rest cached', async () => {
    const { bodies } = serve();
    const { result } = await renderWithCachedBuilder();
    await act(async () => {
      await result.current.mutateAsync({ meta: { date: null } });
    });
    expect(bodies).toEqual([
      { meta: { title: 'Cached title', date: null, language: 'en', templateId: 'storytelling' } },
    ]);
  });

  it('a patch without meta sends no meta key at all', async () => {
    const { bodies } = serve();
    const { result } = await renderWithCachedBuilder();
    const modules = [{ id: 'comp', charts: [{ id: 'barras', isSelected: false }] }];
    await act(async () => {
      await result.current.mutateAsync({ modules, includeCover: false });
    });
    expect(bodies).toEqual([{ modules, includeCover: false }]);
    expect(bodies[0]).not.toHaveProperty('meta');
  });

  it('when V-41 is not cached yet, it is fetched first and the completed meta is sent after it', async () => {
    const { requests, bodies } = serve();
    const harness = createQueryHarness();
    const { result } = renderHook(() => useUpdatePresentationBuilder(ID), {
      wrapper: harness.wrapper,
    });
    expect(
      harness.queryClient.getQueryData(['eco', 'presentation', ID, 'builder']),
    ).toBeUndefined();
    await act(async () => {
      await result.current.mutateAsync({ meta: { title: 'Edited title' } });
    });
    expect(requests).toEqual(['GET builder', 'PATCH presentation']);
    expect(bodies).toEqual([
      {
        meta: {
          title: 'Edited title',
          date: '2025-10-02',
          language: 'en',
          templateId: 'storytelling',
        },
      },
    ]);
  });

  it('a cached builder is not fetched again to complete meta', async () => {
    const { requests } = serve();
    const { result } = await renderWithCachedBuilder();
    await act(async () => {
      await result.current.mutateAsync({ meta: { title: 'Edited title' } });
    });
    expect(requests).toEqual(['GET builder', 'PATCH presentation']);
  });
});
