import { useUpdateUserSettings, useUserSettingsView } from '@/entities/settings';
import { isApiError } from '@/shared/api';
import { Skeleton } from '@/shared/ui/composites/skeleton';
import { SectionBoundary } from '@/shared/ui/layout/section-boundary';

import { SettingsForm } from './SettingsForm';

import type { Settings } from './SettingsForm';
import type { UserSettingsView } from '@/entities/settings';
import type { SectionResult } from '@/shared/api/section-result';

function toSectionResult(
  data: UserSettingsView | undefined,
  error: unknown,
): SectionResult<UserSettingsView> | undefined {
  if (data !== undefined) return { status: 'ok', data };
  if (error === null || error === undefined) return undefined;
  if (isApiError(error) && error.code === 'FORBIDDEN') return { status: 'forbidden' };
  return { status: 'error', errorCode: isApiError(error) ? error.code : 'UNKNOWN' };
}

/** SCR-16 settings: fetches V-45 and saves edits with C-37 (each field change saves immediately, matching the switch/tab UI). */
export function SettingsPage() {
  const query = useUserSettingsView();
  const updateSettings = useUpdateUserSettings();
  const result = toSectionResult(query.data, query.error);

  return (
    // The app shell header is the page h1 ("Configuración"), in every state (F0-3).
    <section data-testid="settings-page">
      <SectionBoundary
        scope="settings"
        result={result}
        isLoading={query.isFetching && query.data === undefined}
        onRetry={() => {
          void query.refetch();
        }}
        skeleton={<Skeleton shape="block" size={320} />}
      >
        {(view) => (
          <SettingsForm
            user={{
              name: view.profile.displayName,
              roleLabel: view.profile.roleLabel,
              department: view.profile.area,
            }}
            settings={{
              fontScale: view.accessibility.fontScale,
              highContrast: view.accessibility.highContrast,
              emailNotifications: view.emailNotifications,
            }}
            onChange={(patch: Partial<Settings>) => {
              updateSettings.mutate(patch);
            }}
          />
        )}
      </SectionBoundary>
    </section>
  );
}
