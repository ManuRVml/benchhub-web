import { gotoAndWaitReady } from './navigation';

import type { Locator, Page } from '@playwright/test';

/** SCR-16 Configuración: profile card, font-size tabs, accessibility switches (presentational, no view fetch yet). */
export class SettingsPage {
  readonly page: Page;
  readonly root: Locator;
  readonly highContrastSwitch: Locator;
  readonly emailNotificationsSwitch: Locator;
  readonly fontSizeDecreaseButton: Locator;
  readonly fontSizeNormalButton: Locator;
  readonly fontSizeIncreaseButton: Locator;
  readonly form: Locator;
  readonly profileCard: Locator;
  readonly profileAvatar: Locator;
  readonly accessibilityCard: Locator;
  readonly fontSizeRow: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = page.getByTestId('settings-page');
    this.highContrastSwitch = page.getByRole('switch', { name: 'Alto contraste' });
    this.emailNotificationsSwitch = page.getByRole('switch', { name: 'Notificaciones por correo' });
    this.fontSizeDecreaseButton = page.getByRole('tab', { name: 'A-' });
    this.fontSizeNormalButton = page.getByRole('tab', { name: 'A', exact: true });
    this.fontSizeIncreaseButton = page.getByRole('tab', { name: 'A+' });
    this.form = page.getByTestId('settings-form');
    this.profileCard = page.getByTestId('settings-profile-card');
    this.profileAvatar = page.getByTestId('settings-profile-avatar');
    this.accessibilityCard = page.getByTestId('settings-accessibility-card');
    this.fontSizeRow = page.getByTestId('settings-font-size-row');
  }

  async goto(): Promise<void> {
    await gotoAndWaitReady(this.page, '/configuracion', 'settings-page');
  }
}
