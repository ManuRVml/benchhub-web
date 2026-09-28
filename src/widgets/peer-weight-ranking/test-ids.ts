import { testId } from '@/shared/config/test-ids';

import type { TestIdPart } from '@/shared/config/test-ids';

/** `peer-weight-ranking-{element}[-{qualifier}]` (brief §5.6). */
export const peerWeightRankingTestIds = {
  root: 'peer-weight-ranking',
  infoToggle: 'peer-weight-ranking-info-toggle',
  infoPanel: 'peer-weight-ranking-info-panel',
  dimensionChip: (dimension: TestIdPart) => testId('peer-weight-ranking', 'dimension', dimension),
  row: (companyId: TestIdPart) => testId('peer-weight-ranking', 'row', companyId),
  explanation: (companyId: TestIdPart) => testId('peer-weight-ranking', 'explanation', companyId),
};
