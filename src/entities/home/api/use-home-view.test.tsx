import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { scenarioHandlers } from '../../../test/msw/handlers';
import { server } from '../../../test/msw/server';
import { createQueryHarness } from '../../../test/query-wrapper';

import { useHomeView } from './use-home-view';

import type { V03Response } from '@/shared/api';

describe('useHomeView', () => {
  it('ok: returns the typed V-03 payload', async () => {
    const { wrapper } = createQueryHarness();
    const { result } = renderHook(() => useHomeView(), { wrapper });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    const data: V03Response | undefined = result.current.data;
    expect(data?.banner.status).toBe('ok');
  });

  it('error: surfaces the ApiError with its trace id', async () => {
    server.use(...scenarioHandlers('error'));
    const { wrapper } = createQueryHarness();
    const { result } = renderHook(() => useHomeView(), { wrapper });
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(result.current.error).toMatchObject({
      code: 'INTERNAL_ERROR',
      status: 500,
      traceId: 'mock-getHomeView-error',
    });
    // A 5xx is retried twice before it surfaces.
    expect(result.current.failureCount).toBe(3);
  });

  it('forbidden: surfaces the 403 ApiError without retrying', async () => {
    server.use(...scenarioHandlers('forbidden'));
    const { wrapper } = createQueryHarness();
    const { result } = renderHook(() => useHomeView(), { wrapper });
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(result.current.error).toMatchObject({ code: 'FORBIDDEN', status: 403 });
    expect(result.current.failureCount).toBe(1);
  });
});
