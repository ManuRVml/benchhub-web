import { useQuery } from '@tanstack/react-query';

import { queryKeys, STALE_TIMES, useServices } from '@/shared/api';

import type { AssistantContextScreen, V46Response } from '@/shared/api';

export type AssistantContextView = V46Response;

/**
 * V-46 assistant context: the Yarbis proactive tip and suggestion chips of one screen (`analysisId` for the screens of
 * an analysis). Independent of the host view: a failure here never touches the screen behind the panel.
 */
export function useAssistantContextView(
  screen: AssistantContextScreen,
  analysisId?: string,
  { enabled = true }: { enabled?: boolean } = {},
) {
  const { assistantContext } = useServices();
  return useQuery({
    queryKey: queryKeys.assistantContext(screen, analysisId),
    queryFn: ({ signal }) =>
      assistantContext.getAssistantContextView(screen, analysisId, { signal }),
    staleTime: STALE_TIMES.view,
    enabled,
  });
}
