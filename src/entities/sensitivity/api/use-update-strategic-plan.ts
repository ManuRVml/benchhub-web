import { useMutation } from '@tanstack/react-query';

import { useServices } from '@/shared/api';

import type { SensitivityCommands } from '@/shared/api';

type UpdateStrategicPlanBody = Parameters<SensitivityCommands['updateStrategicPlan']>[1];

/** C-26 — "Guardar en el análisis" (OVL-03): persists the plan's rows as actionable items. */
export function useUpdateStrategicPlan(planId: string) {
  const { sensitivities } = useServices();
  return useMutation({
    mutationFn: (body: UpdateStrategicPlanBody) => sensitivities.updateStrategicPlan(planId, body),
  });
}
