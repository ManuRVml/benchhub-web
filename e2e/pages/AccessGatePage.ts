import type { Locator, Page } from '@playwright/test';

/** SCR-02 "Acceso" gate, standalone; the route guard (`ACCESS.accessGate`) only allows sessions with admin access. */
export class AccessGatePage {
  readonly page: Page;
  readonly root: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = page.getByTestId('access-gate-page');
  }

  /** No shared ready-wait here on purpose: the whole point of this page object is the guard redirecting away
   * before `root` ever renders (access-gate.spec.ts asserts exactly that). */
  async goto(): Promise<void> {
    await this.page.goto('/acceso');
  }
}
