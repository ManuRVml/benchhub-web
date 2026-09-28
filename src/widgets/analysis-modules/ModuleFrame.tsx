import { useT } from '@/shared/i18n';
import { SectionCard } from '@/shared/ui/composites/section-card';

import type { ContentModuleId, ModuleRegistry, ModuleViewProps } from './module-registry';

/** Module titles, verbatim from analysis-results.json (the SCR-08 inventory copy). */
const TITLE_KEY = {
  companyCoverage: 'analysis-results.companyCoverage.header.title',
  peerAverageComparison: 'analysis-results.peerAverageComparison.title',
  companyComparison: 'analysis-results.companyComparison.title',
  tbgIndicatorComparator: 'analysis-results.tbgIndicatorComparator.title',
  futureAspiration: 'analysis-results.futureAspiration.title',
  tbgHorizon: 'analysis-results.tbgHorizon.titleTbg',
  tbgDimensionWeights: 'analysis-results.tbgDimensionWeights.title',
  comparisonProfiles: 'analysis-results.comparisonProfiles.title',
  reportSummary: 'analysis-results.reportSummary.title',
} as const satisfies Record<ContentModuleId, string>;

/** Title of the TBG horizon module per horizon ("Horizonte TBG" / "Horizonte ILP" / "Horizonte TBG y ILP"). */
const TBG_HORIZON_TITLE = {
  tbg: 'analysis-results.tbgHorizon.titleTbg',
  ilp: 'analysis-results.tbgHorizon.titleIlp',
  union: 'analysis-results.tbgHorizon.titleUnion',
} as const;

/**
 * Placeholder frame of a content module: the module card with its verbatim title, where P5-41..P5-46 mount the module
 * body. It carries `data-module` / `data-order` so the page order can be asserted.
 */
export function ModuleFrame({ module, horizon }: ModuleViewProps) {
  const t = useT();
  const id = module.id as ContentModuleId;
  const titleKey = id === 'tbgHorizon' ? TBG_HORIZON_TITLE[horizon] : TITLE_KEY[id];
  return (
    <div data-module={module.id} data-order={module.order}>
      <SectionCard title={t(titleKey)} headingLevel={2} testId={`analysis-module-${module.id}`} />
    </div>
  );
}

/** Registry of SCR-08: every content module renders its placeholder frame until its own task replaces it. */
export const RESULTS_MODULE_REGISTRY: ModuleRegistry = {
  companyCoverage: ModuleFrame,
  peerAverageComparison: ModuleFrame,
  companyComparison: ModuleFrame,
  tbgIndicatorComparator: ModuleFrame,
  futureAspiration: ModuleFrame,
  tbgHorizon: ModuleFrame,
  tbgDimensionWeights: ModuleFrame,
  comparisonProfiles: ModuleFrame,
  reportSummary: ModuleFrame,
};
