import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { API_BASE_URL } from '@/shared/api';

import { server } from '../../../test/msw/server';
import { createQueryHarness } from '../../../test/query-wrapper';

import { useDeleteSavedView } from './use-saved-view-commands';
import { useSavedViewsView } from './use-saved-views-view';

const SAVED_VIEWS_PATH = `${API_BASE_URL}/views/saved-views`;

const V47 = {
  items: [
    {
      id: 'sv_01',
      name: 'Financiero en riesgo · Abril 2026',
      createdAt: '2026-09-24T15:30:00-05:00',
      state: {
        corte: '2026-04',
        historico: 'actual',
        categoria: ['financiero'],
        cumplimiento: ['risk'],
      },
    },
  ],
  permissions: { canSaveView: true, canDeleteView: true },
};

/** Serves V-47 and records the URL of every request. */
function serveSavedViews() {
  const requests: URL[] = [];
  server.use(
    http.get(SAVED_VIEWS_PATH, ({ request }) => {
      requests.push(new URL(request.url));
      return HttpResponse.json(V47);
    }),
  );
  return requests;
}

describe('useSavedViewsView (V-47)', () => {
  it('requests the saved views of the screen it is given: ?screen=value-monitor, and returns them typed', async () => {
    const requests = serveSavedViews();
    const { wrapper } = createQueryHarness();
    const { result } = renderHook(() => useSavedViewsView('value-monitor'), { wrapper });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(requests).toHaveLength(1);
    expect(requests[0]?.pathname).toBe(SAVED_VIEWS_PATH);
    expect(requests[0]?.search).toBe('?screen=value-monitor');
    expect(result.current.data?.items[0]?.state.historico).toBe('actual');
    expect(result.current.data?.permissions.canDeleteView).toBe(true);
  });

  it('does not request anything while disabled (a role without saved views is never asked)', async () => {
    const requests = serveSavedViews();
    const { wrapper } = createQueryHarness();
    const { result } = renderHook(() => useSavedViewsView('value-monitor', { enabled: false }), {
      wrapper,
    });
    await new Promise((resolve) => {
      setTimeout(resolve, 50);
    });
    expect(result.current.fetchStatus).toBe('idle');
    expect(requests).toEqual([]);
  });

  it('is refreshed when a saved view is deleted (C-20)', async () => {
    const requests = serveSavedViews();
    server.use(
      http.get(`${API_BASE_URL}/session`, () => HttpResponse.json({ csrfToken: 'csrf-1' })),
      http.delete(`${API_BASE_URL}/saved-views/:viewId`, () =>
        HttpResponse.json({ deleted: true, viewId: 'sv_01' }),
      ),
    );
    const { wrapper } = createQueryHarness();
    const list = renderHook(() => useSavedViewsView('value-monitor'), { wrapper });
    const remove = renderHook(() => useDeleteSavedView(), { wrapper });
    await waitFor(() => {
      expect(list.result.current.isSuccess).toBe(true);
    });
    await act(async () => {
      await remove.result.current.mutateAsync('sv_01');
    });
    await waitFor(() => {
      expect(requests).toHaveLength(2);
    });
  });
});
