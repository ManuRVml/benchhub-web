import { testId } from '@/shared/config/test-ids';

import type { TestIdPart } from '@/shared/config/test-ids';

/** `{scope}-{component}-step-{stepId}`. */
export const stepperTestIds = {
  step: (scope: TestIdPart, component: TestIdPart, stepId: TestIdPart) =>
    testId(scope, component, 'step', stepId),
};
