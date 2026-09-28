import { testId } from '@/shared/config/test-ids';

import type { TestIdPart } from '@/shared/config/test-ids';

/** `{scope}-{component}-{element}[-{qualifier}]` for chart primitives, e.g. `results-peer-average-bar-roace`. */
export const chartTestIds = {
  bar: (scope: TestIdPart, component: TestIdPart, qualifier?: TestIdPart) =>
    testId(scope, component, 'bar', qualifier),
  input: (scope: TestIdPart, component: TestIdPart, qualifier?: TestIdPart) =>
    testId(scope, component, 'input', qualifier),
  segment: (scope: TestIdPart, component: TestIdPart, qualifier?: TestIdPart) =>
    testId(scope, component, 'segment', qualifier),
  tip: (scope: TestIdPart, component: TestIdPart, qualifier?: TestIdPart) =>
    testId(scope, component, 'tip', qualifier),
  legend: (scope: TestIdPart, component: TestIdPart) => testId(scope, component, 'legend'),
  legendItem: (scope: TestIdPart, component: TestIdPart, itemId: TestIdPart) =>
    testId(scope, component, 'legend-item', itemId),
};
