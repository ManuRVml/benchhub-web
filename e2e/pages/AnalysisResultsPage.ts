import { gotoAndWaitReady } from './navigation';

import type { Locator, Page } from '@playwright/test';

/** `SectionBoundary` scopes of SCR-08's Results-only content modules, in V-09 order. */
export const RESULTS_MODULE_SCOPES = [
  'company-coverage',
  'peer-average-comparison',
  'company-comparison',
  'report-summary',
] as const;

export type ResultsModuleScope = (typeof RESULTS_MODULE_SCOPES)[number];

/** SCR-08 Resultados: the frame (analysis tabs, horizon, action row) and its independently loaded modules. */
export class AnalysisResultsPage {
  readonly page: Page;
  readonly root: Locator;
  readonly actionRow: Locator;
  readonly resultsTab: Locator;
  readonly companyComparison: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = page.getByTestId('analysis-results-page');
    this.actionRow = page.getByTestId('results-action-row');
    this.resultsTab = page.getByTestId('analysis-results-analysis-tabs-tab-results');
    this.companyComparison = page.getByTestId('company-comparison');
  }

  async goto(analysisId: string): Promise<void> {
    await gotoAndWaitReady(
      this.page,
      `/analisis/${analysisId}/resultados`,
      'analysis-results-page',
    );
  }

  /** The loaded (ready) state of one module. */
  section(scope: ResultsModuleScope): Locator {
    return this.page.getByTestId(`${scope}-section-ready`);
  }

  /** A company tab of the company-comparison module, by the company's display name. */
  companyTab(name: string): Locator {
    return this.companyComparison.getByRole('tab', { name });
  }

  /** The "Ver más" link of an indicator row of the company-comparison module (kebab-cased indicator id). */
  companyComparisonVerMas(indicatorTestIdPart: string): Locator {
    return this.page.getByTestId(`company-comparison-ver-mas-${indicatorTestIdPart}`);
  }
}
