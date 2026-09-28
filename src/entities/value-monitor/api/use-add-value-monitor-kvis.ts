import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys, useServices } from '@/shared/api';

import { VALUE_MONITOR_PREFIX } from './use-kvi-target-commands';

/** C-18 add indicators to the monitor (SCR-11 OVL-05 "Añadir al monitor"): already generated in contract 0.1.0.
 * Always saves `source: 'custom'` (see use-kvi-candidates-view.ts) with the checked ids. On success, the new rows
 * must appear in the configuration card and (once included) the KVI table, so both invalidate. */
export function useAddValueMonitorKvis(snapshot: string | undefined) {
  const { valueMonitor } = useServices();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (indicatorIds: readonly string[]) =>
      valueMonitor.addValueMonitorKvis({ source: 'custom', indicatorIds: [...indicatorIds] }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: VALUE_MONITOR_PREFIX });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.valueMonitorKviCandidates(snapshot ?? ''),
      });
    },
  });
}
