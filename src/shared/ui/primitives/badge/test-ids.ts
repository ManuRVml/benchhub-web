import { testId } from '@/shared/config/test-ids';

import type { TestIdPart } from '@/shared/config/test-ids';

/** `{scope}-{component}-badge[-{qualifier}]`, e.g. `analyses-status-badge-{analysisId}`. */
export function badgeTestId(scope: TestIdPart, component: TestIdPart, qualifier?: TestIdPart) {
  return testId(scope, component, 'badge', qualifier);
}
