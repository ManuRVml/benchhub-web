import { testId } from '@/shared/config/test-ids';

import type { TestIdPart } from '@/shared/config/test-ids';

/** `{scope}-{component}-accordion-item-{itemId}` and `{scope}-{component}-accordion-trigger-{itemId}`. */
export const accordionTestIds = {
  item: (scope: TestIdPart, component: TestIdPart, itemId: TestIdPart) =>
    testId(scope, component, 'accordion-item', itemId),
  trigger: (scope: TestIdPart, component: TestIdPart, itemId: TestIdPart) =>
    testId(scope, component, 'accordion-trigger', itemId),
};
