import { testId } from '@/shared/config/test-ids';

/** `weight-composition-{element}[-{qualifier}]` (SCR-09 "Composición de peso por línea de indicador"). */
export const weightCompositionTestIds = {
  root: 'weight-composition',
  overweightBanner: 'weight-composition-overweight-banner',
  ecopetrolBox: 'weight-composition-ecopetrol-box',
  footer: 'weight-composition-footer',
  row: (companyId: string) => testId('weight-composition', 'row', companyId),
  total: (companyId: string) => testId('weight-composition', 'total', companyId),
  /** Owner of the per-row `StackedShareBar`'s own testIds (segment / tip), one row per company. */
  barOwner: (companyId: string) => ({ scope: 'weight-composition', component: `row-${companyId}` }),
  legendInfo: (code: string) => testId('weight-composition', 'legend-info', code),
  legendPanel: (code: string) => testId('weight-composition', 'legend-panel', code),
};
