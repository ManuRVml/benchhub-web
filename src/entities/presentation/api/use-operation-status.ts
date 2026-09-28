import { useQuery } from '@tanstack/react-query';

import { queryKeys, STALE_TIMES, useServices } from '@/shared/api';

import type { O01Response } from '@/shared/api';

// O-01 GET /api/v1/operations/:operationId — status of a long-running job started by a 202 command (C-14 export, here),
// through the typed port (P7-PORTS-PRES). Polled the way its own doc names as the SSE (O-02) fallback: this hook only
// polls, since a poll the test can drive with fake timers is far simpler than an SSE mock, and O-02's own doc says
// polling O-01 is the documented degradation path, not a failure (O-02 itself has no port — ports/operations.ts).

export const OPERATION_PREFIX = [...queryKeys.all, 'operation'] as const;

export type OperationStatus = O01Response;

const isSettled = (status: OperationStatus | undefined) =>
  status?.status === 'succeeded' || status?.status === 'failed';

/**
 * Polls O-01 while the operation is `queued` / `running` (1 s, then 5 s once it has been seen running at least once —
 * O-01's own "polls with backoff, 1 s → 5 s [inference]") and stops once it settles. Idle until `operationId` is given.
 */
export function useOperationStatus(operationId: string | undefined) {
  const { operations } = useServices();
  return useQuery({
    queryKey: [...OPERATION_PREFIX, operationId ?? ''] as const,
    queryFn: ({ signal }) => operations.getOperationStatus(operationId ?? '', { signal }),
    enabled: operationId !== undefined,
    staleTime: STALE_TIMES.view,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (isSettled(data)) return false;
      return data === undefined || data.status === 'queued' ? 1000 : 5000;
    },
  });
}
