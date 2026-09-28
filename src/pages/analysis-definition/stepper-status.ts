import type { V05Response } from '@/shared/api';
import type { StepStatus } from '@/shared/ui/composites/stepper';

export type StepStatusValue = V05Response['stepStatus'][number]['status'];

/**
 * Stepper state of a wizard step (SCR-07 States "Validation": `done` = valid AND visited, `current`, `pending`).
 * V-05 `stepStatus` only says whether the step's data is valid: a brand-new draft already has valid steps 2–4 (default
 * competitors, indicators and their sources), so validity alone must not paint them as completed. A step counts as
 * visited when it comes before the current one (the prototype's positional rule, BencHUD.dc.html:3969) or the user
 * opened it in this session (`seen`). An unvisited step is `pending` whatever its status; a visited invalid one is
 * `invalid`.
 */
export function stepperStatus(
  step: number,
  current: number,
  status: StepStatusValue | undefined,
  seen: readonly number[],
): StepStatus {
  if (step === current) return 'current';
  const visited = step < current || seen.includes(step);
  if (!visited) return 'pending';
  if (status === 'valid') return 'done';
  if (status === 'invalid') return 'invalid';
  return 'pending';
}
