import { testId } from '@/shared/config/test-ids';

import type { TestIdPart } from '@/shared/config/test-ids';

/** `competitor-picker-{element}[-{qualifier}]` (brief §5.6). Group and company ids go through `testId()`. */
export const competitorPickerTestIds = {
  businessLineFilter: (option: TestIdPart) => testId('competitor-picker', 'business-line', option),
  groupToggle: (groupId: TestIdPart) => testId('competitor-picker', 'group-toggle', groupId),
  company: (companyId: TestIdPart) => testId('competitor-picker', 'company', companyId),
  suggestion: testId('competitor-picker', 'suggestion', 'box'),
  error: testId('competitor-picker', 'error', 'text'),
};
