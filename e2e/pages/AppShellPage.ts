import { gotoAndWaitReady } from './navigation';

import type { Locator, Page } from '@playwright/test';

/** SCR-04 app shell (sidebar, header, collapse) around every signed-in screen. */
export class AppShellPage {
  readonly page: Page;
  readonly root: Locator;
  readonly sidebar: Locator;
  readonly title: Locator;
  readonly collapseButton: Locator;
  readonly mainNav: Locator;
  readonly userLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = page.getByTestId('app-shell');
    this.sidebar = page.getByTestId('app-shell-sidebar');
    this.title = page.getByTestId('app-shell-title');
    this.collapseButton = page.getByTestId('app-shell-collapse');
    this.mainNav = page.getByRole('navigation', { name: 'Navegación principal' });
    this.userLink = page.getByTestId('app-shell-user');
  }

  navRow(id: string): Locator {
    return this.page.getByTestId(`app-shell-nav-${id}`);
  }

  async goto(path = '/'): Promise<void> {
    await gotoAndWaitReady(this.page, path, 'app-shell');
  }

  async clickNavLink(label: string): Promise<void> {
    await this.mainNav.getByRole('link', { name: label }).click();
  }

  async toggleCollapse(): Promise<void> {
    await this.collapseButton.click();
  }

  isCollapsed(): Promise<string | null> {
    return this.sidebar.getAttribute('data-collapsed');
  }
}
