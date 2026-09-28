import { toKebabCase } from '@/shared/config/test-ids';

import type { TestIdPart } from '@/shared/config/test-ids';

/**
 * Ids under the table's own `testId` (e.g. `analyses-list-table`): the scroll container is `{testId}`, rows
 * `{testId}-row-{rowId}`, detail rows `{testId}-detail-{rowId}`, expand toggles `{testId}-expand-{rowId}` and the
 * empty row `{testId}-empty`. Row ids are kebab-cased; the raw id is on `data-row-id`.
 */
export const dataTableTestIds = {
  row: (testId: string, rowId: TestIdPart) => `${testId}-row-${toKebabCase(rowId)}`,
  detail: (testId: string, rowId: TestIdPart) => `${testId}-detail-${toKebabCase(rowId)}`,
  expand: (testId: string, rowId: TestIdPart) => `${testId}-expand-${toKebabCase(rowId)}`,
  empty: (testId: string) => `${testId}-empty`,
};
