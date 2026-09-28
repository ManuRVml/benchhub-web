import { useMutation } from '@tanstack/react-query';

import { useServices } from '@/shared/api';

import type { SensitivityCommands } from '@/shared/api';

type CreateStrategicPlanBody = Parameters<SensitivityCommands['createStrategicPlan']>[0];

/** C-25 — "Generar plan estratégico" (OVL-03): builds the plan from the current weight simulation. */
export function useGenerateStrategicPlan() {
  const { sensitivities } = useServices();
  return useMutation({
    mutationFn: (body: CreateStrategicPlanBody) => sensitivities.createStrategicPlan(body),
  });
}
