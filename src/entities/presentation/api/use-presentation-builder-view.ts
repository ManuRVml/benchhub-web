import { useQuery } from '@tanstack/react-query';

import { STALE_TIMES, useServices } from '@/shared/api';

import { PRESENTATION_PREFIX } from './presentation-views';

import type { V41Response } from '@/shared/api';

// V-41 GET /api/v1/views/presentation-builder/:presentationId — the SCR-13 builder frame, through the typed port
// (P7-PORTS-PRES).

export const presentationBuilderQueryKeys = {
  builder: (presentationId: string) => [...PRESENTATION_PREFIX, presentationId, 'builder'] as const,
};

export type PresentationTemplateId = V41Response['meta']['templateId'] & string;
export type BuilderModule = V41Response['modules'][number];
export type BuilderChart = BuilderModule['charts'][number];
export type PresentationBuilder = V41Response;

/** V-41 builder frame of one presentation. Idle until the id is non-empty. */
export function usePresentationBuilderView(presentationId: string) {
  const { presentationViews } = useServices();
  return useQuery({
    queryKey: presentationBuilderQueryKeys.builder(presentationId),
    queryFn: ({ signal }) =>
      presentationViews.getPresentationBuilderView(presentationId, { signal }),
    enabled: presentationId !== '',
    staleTime: STALE_TIMES.frame,
  });
}
