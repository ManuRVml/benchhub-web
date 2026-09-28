import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys, useServices } from '@/shared/api';

import type { SavedViewCommands } from '@/shared/api';

/** Prefix of the saved views lists (V-47, `queryKeys.savedViews`); both commands refresh it. */
export const SAVED_VIEWS_PREFIX = [...queryKeys.all, 'saved-views'] as const;

/** C-19 save the current view state of a screen. */
export function useCreateSavedView() {
  const { savedViews } = useServices();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<SavedViewCommands['createSavedView']>[0]) =>
      savedViews.createSavedView(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SAVED_VIEWS_PREFIX }),
  });
}

/** C-20 delete a saved view. */
export function useDeleteSavedView() {
  const { savedViews } = useServices();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (viewId: string) => savedViews.deleteSavedView(viewId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SAVED_VIEWS_PREFIX }),
  });
}
