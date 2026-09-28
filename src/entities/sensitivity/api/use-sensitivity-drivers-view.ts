import { useQuery } from '@tanstack/react-query';

import { STALE_TIMES, useServices } from '@/shared/api';

/** Key of V-37, one entry per indicator so switching pills reads (or fetches) its own cache slot. */
export const sensitivityDriversKey = (indicatorId: string) =>
  ['eco', 'sensitivity-drivers', indicatorId] as const;

/**
 * V-37 sensitivity drivers (SCR-12 §1): indicator pills, formula, levers, base/target and the Yarbis suggestion. Uses
 * the typed `sensitivityViews.getSensitivityDriversView` port (P7-PORTS-C). No sections: a failure is the whole
 * view's ApiError. Idle until an indicator id is set.
 */
export function useSensitivityDriversView(indicatorId: string) {
  const { sensitivityViews } = useServices();
  return useQuery({
    queryKey: sensitivityDriversKey(indicatorId),
    queryFn: ({ signal }) => sensitivityViews.getSensitivityDriversView(indicatorId, { signal }),
    enabled: indicatorId !== '',
    staleTime: STALE_TIMES.view,
  });
}
