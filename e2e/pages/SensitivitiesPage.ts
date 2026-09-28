import { gotoAndWaitReady } from './navigation';

import type { Locator, Page } from '@playwright/test';

/** SCR-12 Sensibilidades: indicator pills + levers (V-37), scenario presets + sliders (V-38), strategic plan (V-39). */
export class SensitivitiesPage {
  readonly page: Page;
  readonly root: Locator;
  readonly driversCard: Locator;
  readonly weightSimulator: Locator;
  readonly strategicPlanCard: Locator;
  /** "Brecha vs. meta" badge of the drivers result strip (V-37 target), shown before any lever moves. */
  readonly targetGap: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = page.getByTestId('sensitivities-page');
    this.driversCard = page.getByTestId('sensitivity-drivers-card');
    this.weightSimulator = page.getByTestId('weight-simulator');
    this.strategicPlanCard = page.getByTestId('strategic-plan');
    this.targetGap = page.getByTestId('sensitivity-drivers-gap');
  }

  async goto(): Promise<void> {
    await gotoAndWaitReady(this.page, '/monitor-valor/sensibilidades', 'sensitivities-page');
  }

  indicatorPill(indicatorId: string): Locator {
    return this.page.getByTestId(`sensitivity-drivers-indicator-chip-${indicatorId}`);
  }

  lever(leverId: string): Locator {
    return this.page.getByTestId(`sensitivity-drivers-lever-${leverId}`);
  }

  preset(presetId: string): Locator {
    return this.page.getByTestId(`weight-simulator-preset-${presetId}`);
  }

  variableSlider(variableId: string): Locator {
    return this.page.getByTestId(`weight-simulator-variable-${variableId}`);
  }
}
