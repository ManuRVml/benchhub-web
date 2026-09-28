import { gotoAndWaitReady } from './navigation';

import type { Locator, Page } from '@playwright/test';

/**
 * The A-05 mock credential pair (owner decision 2026-09-28): the default MOCK_LOGIN_USERNAME / MOCK_LOGIN_PASSWORD of
 * the mock BFF, and the pair the web's own mock adapter and MSW handler accept (VITE_API_MODE=mock).
 */
export const MOCK_CREDENTIALS = {
  username: 'ecopetrol@ecopetrol.com',
  password: 'ecopetrol',
} as const;

/** SCR-01 Iniciar sesión, standalone (no app shell); only renders when there is no session. */
export class LoginPage {
  readonly page: Page;
  readonly root: Locator;
  readonly heading: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorBanner: Locator;
  readonly background: Locator;
  readonly brand: Locator;
  readonly card: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = page.getByTestId('login-page');
    this.heading = page.getByRole('heading', { level: 1 });
    this.usernameInput = page.getByTestId('login-username');
    this.passwordInput = page.getByTestId('login-password');
    this.submitButton = page.getByRole('button', { name: 'Ingresar' });
    this.errorBanner = page.getByTestId('login-error');
    this.background = page.getByTestId('login-background');
    this.brand = page.getByTestId('login-brand');
    this.card = page.getByTestId('login-card');
  }

  /** Bounding box of a rendered block; fails the test when the block is not laid out. */
  async boxOf(locator: Locator): Promise<{ x: number; y: number; width: number; height: number }> {
    const box = await locator.boundingBox();
    if (box === null) throw new Error('the block is not rendered');
    return box;
  }

  /** HTTP status of the background photo the page references. */
  async backgroundStatus(): Promise<number> {
    const src = await this.background.getAttribute('src');
    if (src === null) return 0;
    const response = await this.page.request.get(src);
    return response.status();
  }

  async goto(query = ''): Promise<void> {
    await gotoAndWaitReady(this.page, `/login${query}`, 'login-page');
  }

  /** Fills both fields and clicks "Ingresar" (defaults: the mock credential pair). */
  async signIn(
    username: string = MOCK_CREDENTIALS.username,
    password: string = MOCK_CREDENTIALS.password,
  ): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
