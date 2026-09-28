import { useQuery } from '@tanstack/react-query';

import { queryKeys, STALE_TIMES, useServices } from '@/shared/api';

import type { V42Response, V43Response } from '@/shared/api';

// Query hooks of the SCR-14 viewer: V-43 presentation detail (frame, slideRef, comment count) and V-42 presentation
// slides, through the typed ports (P7-PORTS-PRES).

/** Prefix of the presentation views (not in `queryKeys` until the contract ships them). */
export const PRESENTATION_PREFIX = [...queryKeys.all, 'presentation'] as const;

export const presentationQueryKeys = {
  detail: (presentationId: string) => [...PRESENTATION_PREFIX, presentationId, 'detail'] as const,
  slides: (presentationId: string, order: readonly string[]) =>
    [...PRESENTATION_PREFIX, presentationId, 'slides', order.join(',')] as const,
};

export type PresentationDetail = V43Response;

/** V-42: the slide types of the renderer (entities/presentation/ui/slide-renderer/types.ts) derive from this. */
export type PresentationSlides = V42Response;

/** V-43 detail frame of one presentation. Idle until the id is non-empty. */
export function usePresentationDetail(presentationId: string) {
  const { presentationViews } = useServices();
  return useQuery({
    queryKey: presentationQueryKeys.detail(presentationId),
    queryFn: ({ signal }) =>
      presentationViews.getPresentationDetailView(presentationId, { signal }),
    enabled: presentationId !== '',
    staleTime: STALE_TIMES.frame,
  });
}

/**
 * V-42 slides of a presentation, in the saved order unless `order` lists slide keys. Idle until the detail has
 * resolved (the caller passes `detail.data?.slideRef.path` as a truthy marker, same as before the port swap).
 */
export function usePresentationSlides(
  presentationId: string,
  slidesPath: string | undefined,
  order: readonly string[] = [],
) {
  const { presentationViews } = useServices();
  return useQuery({
    queryKey: presentationQueryKeys.slides(presentationId, order),
    queryFn: ({ signal }) =>
      presentationViews.getPresentationSlidesView(presentationId, { order, signal }),
    enabled: slidesPath !== undefined,
    staleTime: STALE_TIMES.view,
  });
}
