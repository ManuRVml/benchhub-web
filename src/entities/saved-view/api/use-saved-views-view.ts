import { useQuery } from '@tanstack/react-query';

import { queryKeys, STALE_TIMES, useServices } from '@/shared/api';

import type { V47Response, ValueMonitorViewPort } from '@/shared/api';

/** The screens V-47 can list saved views of (the contract's `screen` enum: only the Monitor de Valor today). */
export type SavedViewsScreen = Parameters<ValueMonitorViewPort['getSavedViewsView']>[0];

/** One saved view of V-47: `id`, `name`, `createdAt` and the URL `state` C-19 stored. */
export type SavedView = V47Response['items'][number];

export interface SavedViewsViewOptions {
  /** Skips the request (a role without saved views is answered 403 by the BFF, so it is never asked). Default true. */
  enabled?: boolean;
}

/** V-47 the user's saved views of `screen` ("Mis vistas"); C-19 / C-20 refresh it. */
export function useSavedViewsView(
  screen: SavedViewsScreen,
  { enabled = true }: SavedViewsViewOptions = {},
) {
  const { valueMonitorViews } = useServices();
  return useQuery({
    queryKey: queryKeys.savedViews(screen),
    queryFn: ({ signal }) => valueMonitorViews.getSavedViewsView(screen, { signal }),
    enabled,
    staleTime: STALE_TIMES.view,
  });
}
