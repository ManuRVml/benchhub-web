import { testId } from '@/shared/config/test-ids';

import type { TestIdPart } from '@/shared/config/test-ids';

/** `comparison-profiles-summary-{element}[-{qualifier}]` (brief §5.6). */
export const comparisonProfilesTestIds = {
  root: 'comparison-profiles-summary',
  kpiTile: (kind: TestIdPart) => testId('comparison-profiles-summary', 'kpi-tile', kind),
  ranking: 'comparison-profiles-summary-ranking',
  rankingRow: (companyId: TestIdPart) =>
    testId('comparison-profiles-summary', 'ranking-row', companyId),
  yarbisNote: 'comparison-profiles-summary-yarbis-note',
  table: 'comparison-profiles-summary-table',
  select: (profileId: TestIdPart) => testId('comparison-profiles-summary', 'select', profileId),
};
