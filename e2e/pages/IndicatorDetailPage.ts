import { gotoAndWaitReady } from './navigation';

import type { Locator, Page } from '@playwright/test';

/** SCR-10 Detalle de indicador (V-24): KPIs, chart, insight and traceability, each its own section. */
export class IndicatorDetailPage {
  readonly page: Page;
  readonly root: Locator;
  readonly kpiEcopetrol: Locator;
  readonly kpiPeerAverage: Locator;
  readonly kpiGeVsAverage: Locator;
  readonly chartCard: Locator;
  readonly traceabilityCard: Locator;
  readonly commentsCard: Locator;
  /** "Trazabilidad del dato" cells: fuente, actualización, historial (a 4-column grid, as in the prototype). */
  readonly traceabilityGrid: Locator;
  readonly historyToggle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = page.getByTestId('indicator-detail-page');
    this.kpiEcopetrol = page.getByTestId('indicator-detail-kpi-ecopetrol');
    this.kpiPeerAverage = page.getByTestId('indicator-detail-kpi-peer-average');
    this.kpiGeVsAverage = page.getByTestId('indicator-detail-kpi-ge-vs-average');
    this.chartCard = page.getByTestId('indicator-detail-chart-card');
    this.traceabilityCard = page.getByTestId('indicator-detail-traceability-card');
    this.commentsCard = page.getByTestId('indicator-detail-comments-card');
    this.traceabilityGrid = page.getByTestId('indicator-detail-traceability-grid');
    this.historyToggle = page.getByTestId('indicator-detail-history-toggle');
  }

  async goto(analysisId: string, indicatorId: string): Promise<void> {
    await gotoAndWaitReady(
      this.page,
      `/analisis/${analysisId}/indicadores/${indicatorId}`,
      'indicator-detail-page',
    );
  }
}
