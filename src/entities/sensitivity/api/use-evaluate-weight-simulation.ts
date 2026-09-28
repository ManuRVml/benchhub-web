import { useMutation } from '@tanstack/react-query';

import { useServices } from '@/shared/api';

import type { SensitivityCommands } from '@/shared/api';

type EvaluateWeightSimulationBody = Parameters<SensitivityCommands['evaluateWeightSimulation']>[0];

// C-24 is vendored, but its response `categories` is keyed `productivity`/`operating_costs` (the §3 scenario
// variables' before/after), not the 4 weight categories (Financiero/Mercado/Estratégico/Grupos de Interés) the §6
// widget shows — the contract doc (C-24-evaluate-weight-simulation.md) matches the generated schema exactly, so this
// is a real product/contract mismatch, not a generator drift bug (flagged in the task reply). §6 therefore uses only
// `score` / `variation` from this response; each category's own total (and its on/above/below status) is derived
// client-side from the same `weightPct` values the caller is editing — a plain sum against `targetPct`, nothing the
// BFF needs to compute.

/** C-24 — evaluates a weight change; only `score` / `variation` are meaningful here (see note above). */
export function useEvaluateWeightSimulation() {
  const { sensitivities } = useServices();
  return useMutation({
    mutationFn: (body: EvaluateWeightSimulationBody) =>
      sensitivities.evaluateWeightSimulation(body),
  });
}
