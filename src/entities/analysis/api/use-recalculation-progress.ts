import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { createSseClient, GetOperationEventsResponse, queryKeys } from '@/shared/api';

interface RecalculationProgressOptions {
  analysisId: string;
  onDone: () => void;
  onError: () => void;
}

/** F22's preferred O-02 path: keeps SCR-08 locked until the recalculation reaches a terminal event. */
export function useRecalculationProgress({
  analysisId,
  onDone,
  onError,
}: RecalculationProgressOptions) {
  const queryClient = useQueryClient();
  const [operationId, setOperationId] = useState<string | undefined>();

  useEffect(() => {
    if (operationId === undefined) return;
    const controller = new AbortController();

    void (async () => {
      try {
        const stream = createSseClient({});
        for await (const event of stream.get(`/operations/${operationId}/events`, {
          schema: GetOperationEventsResponse,
          signal: controller.signal,
        })) {
          if (event.status === 'succeeded') {
            await queryClient.invalidateQueries({ queryKey: queryKeys.analysis(analysisId) });
            setOperationId(undefined);
            onDone();
            return;
          }
          if (event.status === 'failed') {
            setOperationId(undefined);
            onError();
            return;
          }
        }
        if (!controller.signal.aborted) {
          setOperationId(undefined);
          onError();
        }
      } catch {
        if (!controller.signal.aborted) {
          setOperationId(undefined);
          onError();
        }
      }
    })();

    return () => {
      controller.abort();
    };
  }, [analysisId, onDone, onError, operationId, queryClient]);

  return {
    isRunning: operationId !== undefined,
    start: setOperationId,
  };
}
