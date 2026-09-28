import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useServices } from '@/shared/api';

import { VALUE_MONITOR_PREFIX } from './use-kvi-target-commands';

import type { ValueMonitorCommands } from '@/shared/api';

export type UpdateValueMonitorConfigurationBody = Parameters<
  ValueMonitorCommands['updateValueMonitorConfiguration']
>[0];

/**
 * C-17 update the monitor configuration (SCR-11 §7 "Aplicar configuración"): already generated in contract 0.1.0.
 * The response may carry `recalculationOperationId` when the result set changes (F22) — the caller polls it (O-01,
 * see `useOperationStatus` in entities/presentation) and invalidates the Monitor queries once it settles; a save with
 * no recalculation invalidates immediately.
 */
export function useUpdateValueMonitorConfiguration() {
  const { valueMonitor } = useServices();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateValueMonitorConfigurationBody) =>
      valueMonitor.updateValueMonitorConfiguration(body),
    onSuccess: (data) => {
      if (data.recalculationOperationId === undefined) {
        void queryClient.invalidateQueries({ queryKey: VALUE_MONITOR_PREFIX });
      }
    },
  });
}
