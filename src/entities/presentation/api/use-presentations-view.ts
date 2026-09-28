import { useQuery } from '@tanstack/react-query';

import { STALE_TIMES, useServices } from '@/shared/api';

import { PRESENTATION_PREFIX } from './presentation-views';

import type { V40Response } from '@/shared/api';

// V-40 GET /api/v1/views/presentations — the SCR-13 list "Presentaciones creadas", through the typed port
// (P7-PORTS-PRES).

export const presentationsListQueryKeys = {
  list: (analysisId: string | undefined, page: number) =>
    [...PRESENTATION_PREFIX, 'list', analysisId ?? null, page] as const,
};

export type PresentationStatus = V40Response['items'][number]['status'];
export type PresentationsListItem = V40Response['items'][number];
export type PresentationsList = V40Response;

export interface PresentationsViewOptions {
  page?: number;
  /** Skips the request (e.g. the builder routes, which share `PresentationsPage` but need no list). Default true. */
  enabled?: boolean;
}

/**
 * V-40 the SCR-13 list. `analysisId` scopes it to the analysis tab bar route (`/analisis/:analysisId/presentaciones`,
 * OQ-14); left undefined on the sidebar route (`/presentaciones`), where the BFF returns every presentation the role
 * can see (consumers: published only; drafts: their own, per the contract doc).
 */
export function usePresentationsView(
  analysisId?: string,
  { page = 1, enabled = true }: PresentationsViewOptions = {},
) {
  const { presentationViews } = useServices();
  return useQuery({
    queryKey: presentationsListQueryKeys.list(analysisId, page),
    queryFn: ({ signal }) =>
      presentationViews.getPresentationsView({
        ...(analysisId === undefined ? {} : { analysisId }),
        page,
        signal,
      }),
    enabled,
    staleTime: STALE_TIMES.view,
  });
}
