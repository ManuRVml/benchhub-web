import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useServices } from '@/shared/api';

import { PRESENTATION_PREFIX } from './presentation-views';

// C-27 IS vendored (`PresentationCommands.createPresentation`, C27Request `{ analysisId }` / C27Response
// `{ id, createdAt }`), so this calls the typed port directly — no bypass needed.

/** C-27 — creates a presentation draft for `analysisId` ("+ Crear presentación", SCR-13). */
export function useCreatePresentationDraft() {
  const { presentations } = useServices();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (analysisId: string) => presentations.createPresentation({ analysisId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PRESENTATION_PREFIX }),
  });
}
