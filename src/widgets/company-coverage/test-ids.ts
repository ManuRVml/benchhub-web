import { testId } from '@/shared/config/test-ids';

import type { TestIdPart } from '@/shared/config/test-ids';

/** `company-coverage-{element}[-{qualifier}]` (brief §5.6). */
export const companyCoverageTestIds = {
  card: (companyId: TestIdPart) => testId('company-coverage', 'card', companyId),
  cardSelect: (companyId: TestIdPart) => testId('company-coverage', 'card-select', companyId),
  cardRemove: (companyId: TestIdPart) => testId('company-coverage', 'card-remove', companyId),
  addSelect: testId('company-coverage', 'add', 'select'),
  metaInput: (companyId: TestIdPart, indicatorId: TestIdPart) =>
    testId('company-coverage', 'value-input', `${String(companyId)}-${String(indicatorId)}`),
  estimateToggle: (companyId: TestIdPart, indicatorId: TestIdPart) =>
    testId('company-coverage', 'estimate-toggle', `${String(companyId)}-${String(indicatorId)}`),
  justificationInput: (companyId: TestIdPart, indicatorId: TestIdPart) =>
    testId(
      'company-coverage',
      'justification-input',
      `${String(companyId)}-${String(indicatorId)}`,
    ),
  missingInput: (companyId: TestIdPart, indicatorId: TestIdPart) =>
    testId('company-coverage', 'missing-input', `${String(companyId)}-${String(indicatorId)}`),
  missingClear: (companyId: TestIdPart, indicatorId: TestIdPart) =>
    testId('company-coverage', 'missing-clear', `${String(companyId)}-${String(indicatorId)}`),
  cancel: testId('company-coverage', 'edit-area', 'cancel'),
  save: testId('company-coverage', 'edit-area', 'save'),
  savedFlash: testId('company-coverage', 'edit-area', 'saved-flash'),
};
