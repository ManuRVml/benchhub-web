import { useQuery } from '@tanstack/react-query';

import { STALE_TIMES, useServices } from '@/shared/api';

/** Key of V-39 (one query, no params). */
export const weightSimulatorKey = ['eco', 'weight-simulator'] as const;

/**
 * V-39 weight simulator (SCR-12 §6): the base score, the 4 weight categories with their KVI rows and the top
 * recommendations (§7 reuses `recommendations`). Uses the typed `sensitivityViews.getWeightSimulatorView` port
 * (P7-PORTS-C). No sections: a failure is the whole view's ApiError.
 */
export function useWeightSimulatorView() {
  const { sensitivityViews } = useServices();
  return useQuery({
    queryKey: weightSimulatorKey,
    queryFn: ({ signal }) => sensitivityViews.getWeightSimulatorView({ signal }),
    staleTime: STALE_TIMES.view,
  });
}
