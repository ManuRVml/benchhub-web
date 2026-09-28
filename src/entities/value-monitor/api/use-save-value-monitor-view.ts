import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys, useServices } from '@/shared/api';

// C-19 "Guardar vista" (SCR-11 header): saves the current snapshot as the screen's state, then refreshes "Mis vistas"
// (V-47) and lets the header show its inline confirmation. `state` follows C19Request's generic shape (filters /
// columns / sort), not a value-monitor-specific one — there is no dedicated state shape in the contract yet either.

export function useSaveValueMonitorView() {
  const { savedViews } = useServices();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (snapshot: string) =>
      savedViews.createSavedView({
        screen: 'monitor-valor',
        state: {
          filters: { corte: snapshot },
          columns: [],
          sort: { key: 'corte', direction: 'asc' },
        },
      }),
    // Not awaited: the header's "Vista guardada" confirmation must not wait for the list to reload.
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.savedViews('value-monitor') });
    },
  });
}
