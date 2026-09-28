import { useQuery } from '@tanstack/react-query';

import { queryKeys, STALE_TIMES, useServices } from '@/shared/api';

import type { V34Response } from '@/shared/api';

// V-34 (SCR-11 OVL-05 "Añadir indicador") through the typed port `valueMonitorViews.getKviCandidatesView`. `source` is
// the active tab (Referenciamiento de pares | TBG | ILP) and is sent as `?source=`; each tab has its own cache entry.
// The view has no snapshot dimension, so `snapshot` is only part of the cache key, never sent. C-18's own `source`
// (categories | all | custom) is an unrelated enum -- the modal always saves with 'custom' (see useAddValueMonitorKvis).

export type KviCandidatesView = V34Response;
export type KviCandidate = KviCandidatesView['items'][number];
export type KviCandidatesSource = KviCandidatesView['source'];

/** V-34 candidates of one source tab (`pares` by default). Idle until `enabled`. */
export function useKviCandidatesView(
  snapshot: string | undefined,
  enabled: boolean,
  source: KviCandidatesSource = 'pares',
) {
  const { valueMonitorViews } = useServices();
  return useQuery({
    queryKey: queryKeys.valueMonitorKviCandidates(snapshot ?? '', source),
    queryFn: ({ signal }) => valueMonitorViews.getKviCandidatesView({ source, signal }),
    enabled,
    staleTime: STALE_TIMES.view,
  });
}
