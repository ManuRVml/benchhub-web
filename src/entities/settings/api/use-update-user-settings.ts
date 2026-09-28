import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys, useServices } from '@/shared/api';

import type { SettingsCommands } from '@/shared/api';

export type UpdateUserSettingsBody = Parameters<SettingsCommands['updateUserSettings']>[0];

/** C-37 — saves the edited settings fields and refetches V-45 so the page shows the saved values. */
export function useUpdateUserSettings() {
  const { settings } = useServices();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateUserSettingsBody) => settings.updateUserSettings(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.userSettings() });
    },
  });
}
