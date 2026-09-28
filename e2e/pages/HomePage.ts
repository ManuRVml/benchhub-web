import { gotoAndWaitReady } from './navigation';

import type { Locator, Page } from '@playwright/test';

/** SCR-05 Inicio: 5 independent V-03 sections, each with its own `{scope}-section-{state}` root. */
export class HomePage {
  readonly page: Page;
  readonly root: Locator;

  static readonly SECTION_SCOPES = [
    'home-banner',
    'home-executive-summary',
    'home-enabled-analyses',
    'home-peer-news',
    'home-market-indicators',
  ] as const;

  constructor(page: Page) {
    this.page = page;
    this.root = page.getByTestId('home-page');
  }

  async goto(): Promise<void> {
    await gotoAndWaitReady(this.page, '/inicio', 'home-page');
  }

  section(scope: string, state: 'loading' | 'ready' | 'error' | 'forbidden' | 'empty'): Locator {
    return this.page.getByTestId(`${scope}-section-${state}`);
  }

  /** Opens the SCR-06 analysis list from the enabled-analyses section. */
  verTodosLink(): Locator {
    return this.page.getByTestId('enabled-analyses').getByRole('link', { name: 'Ver todos ›' });
  }
  /** The BFF-resolved route for an analysis card is exposed by its accessible link name. */
  enabledAnalysis(title: string): Locator {
    return this.page.getByTestId('enabled-analyses').getByRole('link', { name: new RegExp(title) });
  }
  /** Card grid of the enabled analyses (auto-fill 280px in the prototype). */
  enabledAnalysesGrid(): Locator {
    return this.page.getByTestId('enabled-analyses-grid');
  }
  /** Card grid of the peer news (auto-fill 220px in the prototype). */
  peerNewsGrid(): Locator {
    return this.page.getByTestId('peer-news-grid');
  }
  /** Uppercase group labels of the page sections (h2). */
  groupHeadings(): Locator {
    return this.root.getByRole('heading', { level: 2 });
  }
  notificationsButton(): Locator {
    return this.page.getByTestId('app-shell-bell');
  }
  logoutButton(): Locator {
    return this.page.getByTestId('app-shell-nav-logout');
  }
}
