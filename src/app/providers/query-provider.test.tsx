import { describe, expect, it } from 'vitest';

import { ApiError, shouldRetry, STALE_TIMES } from '@/shared/api';

import { createQueryClient } from './query-provider';

const apiError = (status: number, code = 'X') =>
  new ApiError({ code, message: code, traceId: 't', status });

describe('query client policy', () => {
  it('uses the ApiError-aware retry, a 30 s default stale time and no mutation retries', () => {
    const { queries, mutations } = createQueryClient().getDefaultOptions();
    expect(queries?.retry).toBe(shouldRetry);
    expect(queries?.staleTime).toBe(STALE_TIMES.view);
    expect(mutations?.retry).toBe(false);
  });

  it('never retries a 4xx ApiError or an invalid payload', () => {
    expect(shouldRetry(0, apiError(401, 'UNAUTHENTICATED'))).toBe(false);
    expect(shouldRetry(0, apiError(403, 'FORBIDDEN'))).toBe(false);
    expect(shouldRetry(0, apiError(404, 'NOT_FOUND'))).toBe(false);
    expect(shouldRetry(0, apiError(200, 'INVALID_RESPONSE'))).toBe(false);
  });

  it('retries 5xx and network errors twice', () => {
    expect(shouldRetry(0, apiError(503))).toBe(true);
    expect(shouldRetry(1, apiError(0, 'NETWORK_ERROR'))).toBe(true);
    expect(shouldRetry(2, apiError(503))).toBe(false);
  });
});
