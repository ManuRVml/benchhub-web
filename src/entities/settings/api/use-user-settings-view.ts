import { useQuery } from '@tanstack/react-query';

import { queryKeys, STALE_TIMES, useServices } from '@/shared/api';

import type { V45Response } from '@/shared/api';

export type UserSettingsView = V45Response;

/** V-45 user settings: profile, accessibility (font scale, high contrast) and email notifications. */
export function useUserSettingsView() {
  const { settingsViews } = useServices();
  return useQuery({
    queryKey: queryKeys.userSettings(),
    queryFn: ({ signal }) => settingsViews.getUserSettingsView({ signal }),
    staleTime: STALE_TIMES.view,
  });
}
