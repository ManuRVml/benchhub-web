import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { API_BASE_URL } from '@/shared/api';
import { mockResponse } from '@/shared/api/mock';

import { server } from '../../../test/msw/server';
import { createQueryHarness } from '../../../test/query-wrapper';

import { useKviCandidatesView } from './use-kvi-candidates-view';

import type { KviCandidatesSource } from './use-kvi-candidates-view';

describe('useKviCandidatesView (V-34 through the typed port)', () => {
  it('requests the pares tab by default and re-requests with source=tbg when the tab switches', async () => {
    const payload = await mockResponse('getKviCandidatesView');
    const seen: URL[] = [];
    server.use(
      http.get(`${API_BASE_URL}/views/kvi-candidates`, ({ request }) => {
        const url = new URL(request.url);
        seen.push(url);
        return HttpResponse.json({ ...payload, source: url.searchParams.get('source') });
      }),
    );
    const { wrapper } = createQueryHarness();
    const { result, rerender } = renderHook(
      ({ source }: { source?: KviCandidatesSource }) =>
        useKviCandidatesView('2026-04', true, source),
      { wrapper, initialProps: {} },
    );

    await waitFor(() => {
      expect(result.current.data?.source).toBe('pares');
    });
    expect(seen.map((url) => url.pathname)).toEqual([`${API_BASE_URL}/views/kvi-candidates`]);
    expect(seen[0]?.search).toBe('?source=pares');

    rerender({ source: 'tbg' });

    await waitFor(() => {
      expect(result.current.data?.source).toBe('tbg');
    });
    expect(seen.map((url) => url.search)).toEqual(['?source=pares', '?source=tbg']);
  });
});
