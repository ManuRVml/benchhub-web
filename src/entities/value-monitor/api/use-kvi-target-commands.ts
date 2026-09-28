import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deepPatch, patchQueries, queryKeys, restoreQueries, useServices } from '@/shared/api';

import type { QuerySnapshot, ValueMonitorCommands } from '@/shared/api';

/**
 * Prefix of the value monitor views (SCR-11). They belong to a later contract version than 0.1.0, so `queryKeys` has no
 * factory yet; their hooks must key under this prefix to get the optimistic updates below.
 */
export const VALUE_MONITOR_PREFIX = [...queryKeys.all, 'value-monitor'] as const;

type KviTargets = Parameters<ValueMonitorCommands['updateKviTargets']>[1];

/** Sets meta / metaReto on every cached object of the KVI (`{ kviId, meta, … }` rows, cards, detail). */
export function applyKviTargets(data: unknown, kviId: string, targets: KviTargets): unknown {
  return deepPatch(
    data,
    (node) => node.kviId === kviId && 'meta' in node,
    (node) => ({
      ...node,
      meta: targets.meta,
      ...(targets.metaReto === undefined ? {} : { metaReto: targets.metaReto }),
    }),
  );
}

/**
 * C-16 update the targets of a KVI. Optimistic on the cached value monitor views, rolled back on error, then the
 * monitor views are refetched (compliance and aggregates are recomputed by the BFF).
 */
export function useUpdateKviTargets() {
  const { valueMonitor } = useServices();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ kviId, body }: { kviId: string; body: KviTargets }) =>
      valueMonitor.updateKviTargets(kviId, body),
    onMutate: ({ kviId, body }): Promise<QuerySnapshot> =>
      patchQueries(queryClient, VALUE_MONITOR_PREFIX, (data) => applyKviTargets(data, kviId, body)),
    onError: (_error, _variables, snapshot) => {
      restoreQueries(queryClient, snapshot);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: VALUE_MONITOR_PREFIX }),
  });
}
