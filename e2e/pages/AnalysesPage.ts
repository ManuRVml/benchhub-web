import { gotoAndWaitReady } from './navigation';

import type { Locator, Page } from '@playwright/test';

function toKebabCase(part: string): string {
  return part
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

/** SCR-06 Análisis list: search + Fecha / Creador / Estado selects are URL-persisted (ADR-0005). */
export class AnalysesPage {
  readonly page: Page;
  readonly root: Locator;
  readonly searchInput: Locator;
  readonly dateFilter: Locator;
  readonly creatorFilter: Locator;
  readonly statusFilter: Locator;
  readonly clearFiltersButton: Locator;
  readonly table: Locator;
  readonly createButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = page.getByTestId('analyses-page');
    this.searchInput = page.getByTestId('analyses-page-search');
    this.dateFilter = page.getByTestId('analyses-page-date-filter');
    this.creatorFilter = page.getByTestId('analyses-page-creator-filter');
    this.statusFilter = page.getByTestId('analyses-page-status-filter');
    this.clearFiltersButton = page.getByTestId('analyses-page-clear-filters');
    this.table = page.getByTestId('analyses-table');
    this.createButton = page.getByTestId('analyses-page-create-button');
  }

  async goto(query = ''): Promise<void> {
    await gotoAndWaitReady(this.page, `/analisis${query}`, 'analyses-page');
  }

  /** Bounding box of a rendered control; fails the test when it is not laid out. */
  async boxOf(locator: Locator): Promise<{ x: number; y: number; width: number; height: number }> {
    const box = await locator.boundingBox();
    if (box === null) throw new Error('the control is not rendered');
    return box;
  }

  /** The blue "(i)" after an analysis name, which opens its description row. */
  infoToggle(id: string): Locator {
    return this.page.getByTestId(`analyses-table-expand-${toKebabCase(id)}`);
  }

  detailRow(id: string): Locator {
    return this.page.getByTestId(`analyses-table-detail-${toKebabCase(id)}`);
  }

  row(id: string): Locator {
    return this.page.getByTestId(`analyses-table-row-${toKebabCase(id)}`);
  }

  viewDetailsButton(id: string): Locator {
    // F7: the accessible name is "Ver detalle de <analysis name>" (the visible text stays "Ver detalle").
    return this.row(id).getByRole('button', { name: /^Ver detalle de / });
  }
}
