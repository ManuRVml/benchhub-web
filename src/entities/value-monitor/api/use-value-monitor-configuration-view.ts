import { useQuery } from '@tanstack/react-query';

import { queryKeys, STALE_TIMES, useServices } from '@/shared/api';

import type { V32Response } from '@/shared/api';

// V-32 (SCR-11 §7 "Configuración del Monitor de Valor") through the typed port
// `valueMonitorViews.getValueMonitorConfigurationView`. The contract declares no query parameter for this view, so the
// snapshot is only this hook's React Query cache key (as for V-34), never sent on the request.

export type ValueMonitorConfigurationView = V32Response;
export type ValueMonitorConfigIndicator = ValueMonitorConfigurationView['kvis'][number];
export type ValueMonitorConfigSource = ValueMonitorConfigurationView['sources'][number];

/** V-32 configuration card (cached per `corte` snapshot; default the latest, i.e. omitted). */
export function useValueMonitorConfigurationView(snapshot?: string) {
  const { valueMonitorViews } = useServices();
  return useQuery({
    queryKey: queryKeys.valueMonitorConfiguration(snapshot ?? ''),
    queryFn: ({ signal }) => valueMonitorViews.getValueMonitorConfigurationView({ signal }),
    staleTime: STALE_TIMES.view,
  });
}
