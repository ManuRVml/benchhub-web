import { gotoAndWaitReady } from './navigation';

import type { Locator, Page } from '@playwright/test';

/** SCR-13 "Presentaciones creadas" list (V-40). */
export class PresentationsPage {
  readonly page: Page;
  readonly root: Locator;
  readonly table: Locator;
  readonly createButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = page.getByTestId('presentations-page');
    this.table = page.getByTestId('presentations-table');
    this.createButton = page.getByTestId('presentations-page-create-button');
  }

  async goto(): Promise<void> {
    await gotoAndWaitReady(this.page, '/presentaciones', 'presentations-page');
  }

  /** The analysis-scoped list (`/analisis/:analysisId/presentaciones`), the only one with the analysis tabs. */
  async gotoForAnalysis(analysisId: string): Promise<void> {
    await gotoAndWaitReady(
      this.page,
      `/analisis/${analysisId}/presentaciones`,
      'presentations-page',
    );
  }

  /** SCR-13 builder of an existing draft (`/presentaciones/:id/editar`, CF-145). */
  async gotoBuilder(presentationId: string): Promise<void> {
    await gotoAndWaitReady(
      this.page,
      `/presentaciones/${presentationId}/editar`,
      'presentation-builder',
    );
  }

  get builder(): Locator {
    return this.page.getByTestId('presentation-builder');
  }

  builderPart(
    part:
      | 'title-row'
      | 'templates'
      | 'slide-count'
      | 'draft-all'
      | 'cover'
      | 'closing'
      | 'comments'
      | 'footer',
  ): Locator {
    return this.page.getByTestId(`presentation-builder-${part}`);
  }

  builderGroup(moduleId: string): Locator {
    return this.page.getByTestId(`presentation-builder-group-${moduleId}`);
  }

  builderNotes(moduleId: string): Locator {
    return this.page.getByTestId(`presentation-builder-notes-${moduleId}`);
  }

  get versionPanel(): Locator {
    return this.page.getByTestId('presentation-version');
  }

  get analysisTabs(): Locator {
    return this.page.getByTestId('presentations-page-analysis-tabs-tablist');
  }

  analysisTab(id: 'configuration' | 'results' | 'presentation'): Locator {
    return this.page.getByTestId(`presentations-page-analysis-tabs-tab-${id}`);
  }

  viewDetailButton(presentationId: string): Locator {
    return this.page.getByTestId(`presentations-row-${presentationId}-view-detail`);
  }
}
