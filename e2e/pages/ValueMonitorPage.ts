import { gotoAndWaitReady } from './navigation';

import type { Locator, Page } from '@playwright/test';

/** SCR-11 Monitor de Valor: header/snapshot, history, KVI table + filters, benchmark radar. */
export class ValueMonitorPage {
  readonly page: Page;
  readonly root: Locator;
  readonly header: Locator;
  readonly snapshotSelect: Locator;
  readonly benchmarkRadar: Locator;
  readonly column: Locator;
  readonly benchmarkChart: Locator;
  readonly configSources: Locator;
  readonly compositionDonut: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = page.getByTestId('value-monitor-page');
    this.header = page.getByTestId('value-monitor-header');
    this.snapshotSelect = page.getByTestId('value-monitor-snapshot-select');
    this.benchmarkRadar = page.getByTestId('value-monitor-benchmark-radar');
    this.column = page.getByTestId('value-monitor-column');
    this.benchmarkChart = page.getByTestId('value-monitor-benchmark-radar-radar');
    this.configSources = page.getByTestId('value-monitor-config-list-sources');
    this.compositionDonut = page.getByTestId('value-monitor-composition-donut');
  }

  async goto(): Promise<void> {
    await gotoAndWaitReady(this.page, '/monitor-valor', 'value-monitor-page');
  }

  historyRangeChip(range: 'actual' | '5y' | '8y' | '10y'): Locator {
    return this.page.getByTestId(`value-monitor-history-range-chip-${range}`);
  }

  benchmarkCompanyToggle(companyId: string): Locator {
    return this.page.getByTestId(`value-monitor-benchmark-radar-company-toggle-${companyId}`);
  }

  configIndicatorChips(): Locator {
    return this.page.locator('[data-testid^="value-monitor-config-indicator-chip-"]');
  }

  kviCategoryFilterChip(categoryId: string): Locator {
    return this.page.getByTestId(`kvi-table-category-filter-chip-${categoryId}`);
  }
}
