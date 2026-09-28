import { gotoAndWaitReady } from './navigation';

import type { Locator, Page } from '@playwright/test';

/** SCR-07 "Definición del análisis": the 5-step draft wizard, `?paso=1..5` in the URL. */
export class AnalysisDefinitionPage {
  readonly page: Page;
  readonly root: Locator;
  readonly wizard: Locator;
  readonly nameInput: Locator;
  readonly nextButton: Locator;
  readonly previousButton: Locator;
  readonly autosaveToast: Locator;
  /** "Configuración / Resultados / Presentación" tab bar above the stepper. */
  readonly analysisTabs: Locator;
  /** Step 1 "Periodo actual" / "Periodo comparado" row. */
  readonly periods: Locator;
  /** Step 1 "Fecha de corte" field wrapper. */
  readonly cutOffDateField: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = page.getByTestId('analysis-definition-page');
    this.wizard = page.getByTestId('analysis-definition-wizard');
    this.nameInput = page.getByTestId('definition-general-name');
    this.nextButton = page.getByTestId('analysis-definition-next');
    this.previousButton = page.getByTestId('analysis-definition-previous');
    this.autosaveToast = page.getByTestId('toast-autosave');
    this.analysisTabs = page.getByTestId('analysis-definition-analysis-tabs-tablist');
    this.periods = page.getByTestId('definition-general-periods');
    this.cutOffDateField = page.getByTestId('definition-general-cut-off-date-field');
  }

  async goto(analysisId: string, paso = 1): Promise<void> {
    await gotoAndWaitReady(
      this.page,
      `/analisis/${analysisId}/definicion?paso=${String(paso)}`,
      'analysis-definition-page',
    );
  }

  stepperStep(step: number): Locator {
    return this.page.getByTestId(`analysis-definition-stepper-step-${String(step)}`);
  }

  analysisTab(id: 'configuration' | 'results' | 'presentation'): Locator {
    return this.page.getByTestId(`analysis-definition-analysis-tabs-tab-${id}`);
  }

  /** Step 1 option chip of "Tipo de análisis" (`type`) or "Alcance" (`scope`). */
  generalChip(group: 'type' | 'scope', id: string): Locator {
    return this.page.getByTestId(`definition-general-${group}-chip-${id}`);
  }

  currentStep(): Promise<string | null> {
    return this.wizard.getAttribute('data-step');
  }
}
