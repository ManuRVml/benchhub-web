import { testId } from '@/shared/config/test-ids';

import type { TestIdPart } from '@/shared/config/test-ids';

/** `{scope}-{component}-chip[-{qualifier}]` and the filter chip's `{scope}-{component}-chip-remove[-{qualifier}]`. */
export const chipTestIds = {
  root: (scope: TestIdPart, component: TestIdPart, qualifier?: TestIdPart) =>
    testId(scope, component, 'chip', qualifier),
  remove: (scope: TestIdPart, component: TestIdPart, qualifier?: TestIdPart) =>
    testId(scope, component, 'chip-remove', qualifier),
};
