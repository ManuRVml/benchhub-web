import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import { API_BASE_URL } from '@/shared/api';

import { server } from '../../../test/msw/server';
import { createQueryHarness } from '../../../test/query-wrapper';

import {
  applyKviTargets,
  useUpdateKviTargets,
  VALUE_MONITOR_PREFIX,
} from './use-kvi-target-commands';

const ROWS_KEY = [...VALUE_MONITOR_PREFIX, 'kvis'] as const;
const VIEW = {
  rows: [
    { kviId: 'kvi_fcl', label: 'Flujo de Caja Libre', meta: 7.19, metaReto: 10.53 },
    { kviId: 'kvi_roace', label: 'ROACE', meta: 9, metaReto: 11 },
  ],
};

describe('C-16 useUpdateKviTargets', () => {
  it('patches every cached row of the KVI and keeps the others', () => {
    expect(applyKviTargets(VIEW, 'kvi_fcl', { meta: 8 })).toEqual({
      rows: [{ ...VIEW.rows[0], meta: 8 }, VIEW.rows[1]],
    });
  });

  it('is optimistic and rolls back on error', async () => {
    const { wrapper, queryClient } = createQueryHarness();
    queryClient.setQueryData(ROWS_KEY, VIEW);
    let failPatch: () => void = () => undefined;
    server.use(
      http.patch(`${API_BASE_URL}/kvis/:kviId/targets`, async () => {
        await new Promise<void>((resolve) => {
          failPatch = resolve;
        });
        return HttpResponse.json(
          { code: 'INTERNAL_ERROR', message: 'Fallo', traceId: 't' },
          { status: 500 },
        );
      }),
    );
    const { result } = renderHook(() => useUpdateKviTargets(), { wrapper });
    let outcome: Promise<unknown> = Promise.resolve();
    act(() => {
      outcome = result.current
        .mutateAsync({ kviId: 'kvi_fcl', body: { meta: 8, metaReto: 12 } })
        .catch((error: unknown) => error);
    });

    await vi.waitFor(() => {
      expect(queryClient.getQueryData<typeof VIEW>(ROWS_KEY)?.rows[0]?.meta).toBe(8);
    });
    failPatch();
    await act(() => outcome);
    expect(queryClient.getQueryData(ROWS_KEY)).toEqual(VIEW);
  });
});
