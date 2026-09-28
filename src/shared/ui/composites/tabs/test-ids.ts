import { testId } from '@/shared/config/test-ids';

import type { TestIdPart } from '@/shared/config/test-ids';

/** `{scope}-{component}-tablist`, `{scope}-{component}-tab-{itemId}` and `{scope}-{component}-tabpanel-{itemId}`. */
export const tabsTestIds = {
  list: (scope: TestIdPart, component: TestIdPart) => testId(scope, component, 'tablist'),
  tab: (scope: TestIdPart, component: TestIdPart, itemId: TestIdPart) =>
    testId(scope, component, 'tab', itemId),
  panel: (scope: TestIdPart, component: TestIdPart, itemId: TestIdPart) =>
    testId(scope, component, 'tabpanel', itemId),
};
