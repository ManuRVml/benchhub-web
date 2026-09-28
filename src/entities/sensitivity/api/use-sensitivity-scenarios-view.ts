import { useQuery } from '@tanstack/react-query';

import { STALE_TIMES, useServices } from '@/shared/api';

/** Key of V-38 (one query, no params). */
export const sensitivityScenariosKey = ['eco', 'sensitivity-scenarios'] as const;

/**
 * V-38 sensitivity scenarios (SCR-12 §2-4): the productivity / operating-costs sliders, the ROACE base/peer-average
 * pair and (when the BFF sends them) the Base/Optimista/Conservador presets. Uses the typed
 * `sensitivityViews.getSensitivityScenariosView` port (P7-PORTS-C). No sections: a failure is the whole view's
 * ApiError.
 */
export function useSensitivityScenariosView() {
  const { sensitivityViews } = useServices();
  return useQuery({
    queryKey: sensitivityScenariosKey,
    queryFn: ({ signal }) => sensitivityViews.getSensitivityScenariosView({ signal }),
    staleTime: STALE_TIMES.view,
  });
}
