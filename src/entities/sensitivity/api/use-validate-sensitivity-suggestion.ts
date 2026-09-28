import { useMutation } from '@tanstack/react-query';

import { useServices } from '@/shared/api';

/**
 * C-22 — validates the Yarbis lever suggestion (SCR-12 §1 "Marcar como validada"). V-37 has no `updatedAt` / ETag to
 * invalidate against and the mock fixture never changes, so the caller applies the mutation's own response
 * (`validatedBy`, `validatedAt`) as a local override of the suggestion status instead of refetching V-37.
 */
export function useValidateSensitivitySuggestion() {
  const { sensitivities } = useServices();
  return useMutation({
    mutationFn: (suggestionId: string) =>
      sensitivities.validateSensitivitySuggestion(suggestionId, {}),
  });
}
