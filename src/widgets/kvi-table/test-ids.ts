import { testId } from '@/shared/config/test-ids';

import type { TestIdPart } from '@/shared/config/test-ids';

/** `kvi-table-{element}[-{kviId}]` (brief §5.6); the row/expand/empty ids of the table itself come from
 * `dataTableTestIds` under the `table` id below. */
export const kviTableTestIds = {
  table: testId('kvi-table', 'table', 'root'),
  categoryFilter: testId('kvi-table', 'filter', 'category'),
  complianceFilter: testId('kvi-table', 'filter', 'compliance'),
  indicator: (kviId: TestIdPart) => testId('kvi-table', 'indicator', 'trigger', kviId),
  metaInput: (kviId: TestIdPart) => testId('kvi-table', 'meta', 'input', kviId),
  metaRetoInput: (kviId: TestIdPart) => testId('kvi-table', 'meta-reto', 'input', kviId),
  resultChip: (kviId: TestIdPart) => testId('kvi-table', 'result', 'chip', kviId),
  retoChip: (kviId: TestIdPart) => testId('kvi-table', 'reto', 'chip', kviId),
  traceabilityModal: testId('kvi-table', 'traceability', 'modal'),
};
