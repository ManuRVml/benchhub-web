import { testId } from '@/shared/config/test-ids';
import { chartTestIds } from '@/shared/ui/charts/primitives';

/** `company-comparison-{element}[-{qualifier}]` (SCR-08 module 4). */
export const companyComparisonTestIds = {
  root: 'company-comparison',
  aiPill: 'company-comparison-ai-pill',
  /** Owned by `ChartLegend` itself (`chartTestIds.legend`/`legendItem`), scope `company-comparison`, component `legend`. */
  legend: chartTestIds.legend('company-comparison', 'legend'),
  legendItem: (itemId: string) => chartTestIds.legendItem('company-comparison', 'legend', itemId),
  summary: 'company-comparison-summary',
  row: (indicatorId: string) => testId('company-comparison', 'row', indicatorId),
  verMas: (indicatorId: string) => testId('company-comparison', 'ver-mas', indicatorId),
};
