import { Fragment } from 'react';

import { resolveModules } from './module-registry';
import { RESULTS_MODULE_REGISTRY } from './ModuleFrame';

import type { FrameSlots, ModuleRegistry, ResultsHorizon, ResultsModule } from './module-registry';

export interface AnalysisModulesProps {
  analysisId: string;
  horizon: ResultsHorizon;
  /** V-09 `modules[]`. */
  modules: readonly ResultsModule[];
  /** Content of the frame slots (`actionRow`, `footerActions`), placed where V-09 orders them. */
  slots?: FrameSlots;
  /** Registry override (tests, stories); defaults to the SCR-08 registry. */
  registry?: ModuleRegistry;
}

/** The left column of SCR-08: the V-09 modules visible in `horizon`, in order, each through the registry. */
export function AnalysisModules({
  analysisId,
  horizon,
  modules,
  slots = {},
  registry = RESULTS_MODULE_REGISTRY,
}: AnalysisModulesProps) {
  return (
    <>
      {resolveModules(modules, horizon, registry).map((entry) =>
        entry.kind === 'slot' ? (
          <Fragment key={entry.module.id}>{slots[entry.slot] ?? null}</Fragment>
        ) : (
          <entry.View
            key={entry.module.id}
            analysisId={analysisId}
            horizon={horizon}
            module={entry.module}
          />
        ),
      )}
    </>
  );
}
