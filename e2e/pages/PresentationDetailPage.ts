import { gotoAndWaitReady } from './navigation';

import type { Locator, Page } from '@playwright/test';

/** SCR-14 presentation viewer: one slide on stage, the pager dots, comments. */
export class PresentationDetailPage {
  readonly page: Page;
  readonly root: Locator;
  readonly stage: Locator;
  readonly previousButton: Locator;
  readonly nextButton: Locator;
  readonly titleRow: Locator;
  readonly downloadButton: Locator;
  readonly comments: Locator;
  readonly commentItems: Locator;
  readonly commentInput: Locator;
  readonly commentSubmit: Locator;
  readonly coverBackground: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = page.getByTestId('presentation-detail-page');
    this.stage = page.getByTestId('presentation-detail-stage');
    this.previousButton = page.getByTestId('presentation-detail-previous');
    this.nextButton = page.getByTestId('presentation-detail-next');
    this.titleRow = page.getByTestId('presentation-detail-title-row');
    this.downloadButton = page.getByTestId('presentation-detail-download');
    this.comments = page.getByTestId('presentation-detail-comments');
    this.commentItems = page
      .getByTestId('presentation-detail-comments-thread-list')
      .getByTestId(/^comment-item-/);
    this.commentInput = page.getByTestId('presentation-detail-comments-thread-composer-input');
    this.commentSubmit = page.getByTestId('presentation-detail-comments-thread-composer-submit');
    this.coverBackground = page.getByTestId('slide-cover-background');
  }

  async goto(presentationId: string, slide?: number): Promise<void> {
    const query = slide === undefined ? '' : `?slide=${String(slide)}`;
    await gotoAndWaitReady(
      this.page,
      `/presentaciones/${presentationId}${query}`,
      'presentation-detail-page',
    );
  }

  dot(index: number): Locator {
    return this.page.getByTestId(`presentation-detail-dot-${String(index)}`);
  }
}
