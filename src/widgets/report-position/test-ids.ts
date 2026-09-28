import { testId } from '@/shared/config/test-ids';

import type { TestIdPart } from '@/shared/config/test-ids';

/** `report-position-{element}[-{qualifier}]` (brief §5.6). */
export const reportPositionTestIds = {
  root: 'report-position',
  eyebrow: 'report-position-eyebrow',
  tierName: 'report-position-tier-name',
  contextLine: 'report-position-context-line',
  createPresentation: 'report-position-create-presentation',
  kpiTile: (dimension: TestIdPart) => testId('report-position', 'kpi-tile', dimension),
};
