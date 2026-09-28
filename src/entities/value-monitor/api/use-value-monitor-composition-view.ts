import { useQuery } from '@tanstack/react-query';

import { queryKeys, useServices, STALE_TIMES } from '@/shared/api';

import type { V31Response } from '@/shared/api';

// V-31 GET /api/v1/views/value-monitor-composition?snapshot= (SCR-11 §9 "Composición del Monitor por categoría").
// Generated in src/shared/api/generated/zod.ts and reachable through the typed
// `valueMonitorViews.getValueMonitorCompositionView` port (P7-HOOKS / P7-SWAP-VM); this hook's own TODO(P7-PORTS) and
// hand-written mirror (predating the contract bump) are gone. `categories[].id` is now the lowercase category slug
// (`financiero` | `mercado` | `estrategico` | `grupos_interes`, matching V-30's own `category` enum) instead of the
// hand-written mirror's capitalized display name — ValueMonitorComposition's colour lookup keys were updated to
// match (see that widget).

export type ValueMonitorCompositionView = V31Response;
export type ValueMonitorCompositionCategory = ValueMonitorCompositionView['categories'][number];

/** V-31 composition donut + category table, for the `corte` snapshot (default the latest, i.e. omitted). */
export function useValueMonitorCompositionView(snapshot?: string) {
  const { valueMonitorViews } = useServices();
  return useQuery({
    queryKey: queryKeys.valueMonitorComposition(snapshot ?? ''),
    queryFn: ({ signal }) =>
      valueMonitorViews.getValueMonitorCompositionView({
        ...(snapshot ? { snapshot } : {}),
        signal,
      }),
    staleTime: STALE_TIMES.view,
  });
}
