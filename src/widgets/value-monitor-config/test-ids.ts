export function makeTestId(scope: string, component: string, element: string, qualifier?: string) {
  const parts = [scope, component, element, ...(qualifier === undefined ? [] : [qualifier])].map(
    (part) =>
      part
        .trim()
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase(),
  );
  if (parts.some((part) => part === '')) {
    throw new Error(`testId(): empty part in ${JSON.stringify(parts)}`);
  }
  return parts.join('-');
}

export const testIds = {
  root: makeTestId('value-monitor-config', 'card', 'root'),
  addIndicatorButton: makeTestId('value-monitor-config', 'button', 'add-indicator'),
  applyButton: makeTestId('value-monitor-config', 'button', 'apply'),
  thresholdAlertInput: makeTestId('value-monitor-config', 'input', 'threshold-alert'),
  thresholdWarningInput: makeTestId('value-monitor-config', 'input', 'threshold-warning'),
  periodSelect: makeTestId('value-monitor-config', 'select', 'period'),
  cutOffDateInput: makeTestId('value-monitor-config', 'input', 'cut-off-date'),
  rangeFromInput: makeTestId('value-monitor-config', 'input', 'range-from'),
  rangeToInput: makeTestId('value-monitor-config', 'input', 'range-to'),
  sources: makeTestId('value-monitor-config', 'list', 'sources'),
  source: (sourceId: string) => makeTestId('value-monitor-config', 'chip', 'source', sourceId),
  exceptionsInput: makeTestId('value-monitor-config', 'textarea', 'exceptions'),
  assistantContextInput: makeTestId('value-monitor-config', 'textarea', 'assistant-context'),
  candidateCheckbox: (indicatorId: string) =>
    makeTestId('value-monitor-config', 'checkbox', 'candidate', indicatorId),
  addKviModalConfirm: makeTestId('value-monitor-config', 'modal', 'confirm'),
};
