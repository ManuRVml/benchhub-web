import { useQuery } from '@tanstack/react-query';

import { queryKeys, STALE_TIMES, useServices } from '@/shared/api';

import type { V27Response } from '@/shared/api';

// V-27 GET /api/v1/views/value-monitor?snapshot= (SCR-11 header + KPI tiles + dimension weights). Generated in
// src/shared/api/generated/zod.ts and reachable through the typed `valueMonitorViews.getValueMonitorView` port
// (P7-HOOKS / P7-SWAP-VM); the hand-written mirror this hook used before (P5-50a/b) is gone. `kpis` and
// `dimensionWeights` are each their own SectionResult (ok/error/forbidden) — the page unwraps them independently, the
// rest of the header never blocks on either.

export type ValueMonitorView = V27Response;
export type ValueMonitorSnapshot = ValueMonitorView['header']['snapshots'][number];

/** V-27 header + KPI tiles of the Monitor de Valor, for the `corte` snapshot (default the latest, i.e. omitted). */
export function useValueMonitorView(snapshot?: string) {
  const { valueMonitorViews } = useServices();
  return useQuery({
    queryKey: queryKeys.valueMonitor(snapshot ?? ''),
    queryFn: ({ signal }) =>
      valueMonitorViews.getValueMonitorView({ ...(snapshot ? { snapshot } : {}), signal }),
    staleTime: STALE_TIMES.view,
  });
}
