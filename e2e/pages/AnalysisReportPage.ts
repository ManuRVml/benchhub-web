import { gotoAndWaitReady } from './navigation';

import type { Locator, Page } from '@playwright/test';

/** SCR-09 Visualización: dashboard header/KPIs, panorama (heatmap + ranking + radar), category tiers. */
export class AnalysisReportPage {
  readonly page: Page;
  readonly root: Locator;
  readonly position: Locator;
  readonly heatmapDataTable: Locator;
  readonly companyProfileModal: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = page.getByTestId('analysis-report-page');
    this.position = page.getByTestId('report-position');
    this.heatmapDataTable = page.getByTestId('report-panorama-heatmap-data-table');
    this.companyProfileModal = page.getByTestId('modal');
  }

  async goto(analysisId: string): Promise<void> {
    await gotoAndWaitReady(
      this.page,
      `/analisis/${analysisId}/visualizacion`,
      'analysis-report-page',
    );
  }

  kpiTile(dimension: string): Locator {
    return this.page.getByTestId(`report-position-kpi-tile-${dimension}`);
  }

  rankingDimensionChip(dimension: 'fin' | 'op' | 'trans'): Locator {
    return this.page.getByTestId(`peer-weight-ranking-dimension-chip-${dimension}`);
  }

  categoryCard(categoryId: string): Locator {
    return this.page.getByTestId(`category-tiers-card-${categoryId}`);
  }

  heatmapCompanyButton(name: string): Locator {
    return this.heatmapDataTable.getByRole('button', { name });
  }
}
