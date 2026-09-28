import { useMutation } from '@tanstack/react-query';

import { useServices } from '@/shared/api';

import type { SensitivityCommands } from '@/shared/api';

type EvaluateSensitivityBody = Parameters<SensitivityCommands['evaluateSensitivity']>[0];

/**
 * C-21 — stateless lever evaluation (SCR-12 §1). No cache to invalidate: callers (the debounced lever panel) read the
 * mutation's own `data` for the result strip and linked-variable lines.
 */
export function useEvaluateSensitivity() {
  const { sensitivities } = useServices();
  return useMutation({
    mutationFn: (body: EvaluateSensitivityBody) => sensitivities.evaluateSensitivity(body),
  });
}
