import { testId } from '@/shared/config/test-ids';

import type { TestIdPart } from '@/shared/config/test-ids';

/** `yarbis-assistant-{element}[-{qualifier}]` (brief §5.6). Message ids go through `testId()` on both sides. */
export const yarbisTestIds = {
  fab: testId('yarbis', 'assistant', 'fab'),
  panel: testId('yarbis', 'assistant', 'panel'),
  log: testId('yarbis', 'assistant', 'log'),
  message: (id: TestIdPart) => testId('yarbis', 'assistant', 'message', id),
  composer: testId('yarbis', 'assistant', 'composer'),
  contextLoading: testId('yarbis', 'assistant', 'context-loading'),
  contextError: testId('yarbis', 'assistant', 'context-error'),
  contextRetry: testId('yarbis', 'assistant', 'context-retry'),
};
