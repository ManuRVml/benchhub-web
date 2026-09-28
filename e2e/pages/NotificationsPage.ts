import { gotoAndWaitReady } from './navigation';

import type { Locator, Page } from '@playwright/test';
/** SCR-15 Notificaciones (V-44): items render, opening the page marks them all read once (optimistic C-36). */ export class NotificationsPage {
  readonly page: Page;
  readonly root: Locator;
  readonly cards: Locator;
  readonly searchInput: Locator;
  constructor(page: Page) {
    this.page = page;
    this.root = page.getByTestId('notifications-page');
    this.cards = page.getByTestId('notification-card');
    this.searchInput = page.getByTestId('notifications-search');
  }
  async goto(query = ''): Promise<void> {
    await gotoAndWaitReady(this.page, `/notificaciones${query}`, 'notifications-page');
  }
  cardIcon(card: Locator): Locator {
    return card.getByTestId('notification-card-icon');
  }
  cardTag(card: Locator): Locator {
    return card.getByTestId('notification-card-tag');
  }
  cardTime(card: Locator): Locator {
    return card.getByTestId('notification-card-time');
  }
  severityChip(severity: 'info' | 'success' | 'warn' | 'error'): Locator {
    return this.page.getByTestId(`notifications-severity-chip-chip-${severity}`);
  }
  /** The per-card unread dots only: the header bell's label ("Notificaciones (n sin leer)") also contains this text. */ unreadDots(): Locator {
    return this.root.getByLabel('Sin leer', { exact: true });
  }
}
