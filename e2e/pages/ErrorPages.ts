import { gotoAndWaitReady } from './navigation';

import type { Page } from '@playwright/test';

export class ErrorPages {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async gotoForbidden(): Promise<void> {
    await gotoAndWaitReady(this.page, '/403', 'forbidden-page');
  }

  async gotoUnknownUrl(): Promise<void> {
    await gotoAndWaitReady(this.page, '/ruta-que-no-existe', 'not-found-page');
  }

  get notFoundHeading() {
    return this.page.getByRole('heading', { name: 'No encontramos esta página' });
  }

  get notFoundAction() {
    return this.page.getByRole('button', { name: 'Ir al inicio' });
  }

  get forbiddenHeading() {
    return this.page.getByRole('heading', { name: 'No tienes permiso para ver esta página' });
  }

  get forbiddenAction() {
    return this.page.getByRole('button', { name: 'Ir al inicio' });
  }
}
