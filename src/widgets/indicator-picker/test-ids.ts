import { testId } from '@/shared/config/test-ids';

import type { TestIdPart } from '@/shared/config/test-ids';

/** `indicator-picker-{element}[-{qualifier}]` (brief §5.6). Group and indicator ids go through `testId()`. */
export const indicatorPickerTestIds = {
  sourceTabs: testId('indicator-picker', 'source', 'tabs'),
  conceptFilter: (concept: TestIdPart) => testId('indicator-picker', 'concept', concept),
  horizonFilter: (horizon: TestIdPart) => testId('indicator-picker', 'horizon', horizon),
  groupToggle: (groupId: TestIdPart) => testId('indicator-picker', 'group-toggle', groupId),
  item: (itemId: TestIdPart) => testId('indicator-picker', 'item', itemId),
  error: testId('indicator-picker', 'error', 'text'),
};
