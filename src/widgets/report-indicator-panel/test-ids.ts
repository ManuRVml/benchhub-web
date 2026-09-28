import { testId } from '@/shared/config/test-ids';

import type { TestIdPart } from '@/shared/config/test-ids';

/** `report-indicator-panel-{element}[-{qualifier}]` (brief §5.6). */
export const reportIndicatorPanelTestIds = {
  root: 'report-indicator-panel',
  row: (indicatorId: TestIdPart) => testId('report-indicator-panel', 'row', indicatorId),
};
