import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { commentThreadKey } from '@/entities/analysis';
import { API_BASE_URL } from '@/shared/api';

import { server } from '../../test/msw/server';
import { createQueryHarness } from '../../test/query-wrapper';

import { usePostValueMonitorComment } from './use-post-value-monitor-comment';

describe('usePostValueMonitorComment (C-10 through the typed review port)', () => {
  it("sends entityType 'value_monitor' (underscore) with the snapshot as entityId, then refreshes that thread", async () => {
    const bodies: unknown[] = [];
    server.use(
      http.post(`${API_BASE_URL}/review-comments`, async ({ request }) => {
        bodies.push(await request.json());
        return HttpResponse.json({
          id: 'cmt_02',
          createdAt: '2026-09-25T10:00:00-05:00',
          status: 'pending',
        });
      }),
    );
    const { wrapper, queryClient } = createQueryHarness();
    const threadKey = commentThreadKey('value_monitor', '2026-04');
    queryClient.setQueryData(threadKey, { items: [] });
    const { result } = renderHook(() => usePostValueMonitorComment('2026-04'), { wrapper });

    await act(async () => {
      await result.current.mutateAsync('Revisar la meta de ROACE');
    });

    expect(bodies).toEqual([
      { entityType: 'value_monitor', entityId: '2026-04', text: 'Revisar la meta de ROACE' },
    ]);
    expect(queryClient.getQueryState(threadKey)?.isInvalidated).toBe(true);
  });
});
