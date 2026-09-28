import { expect, test } from '@playwright/test';

import { AnalysesPage } from '../pages/AnalysesPage';
import { AnalysisDefinitionPage } from '../pages/AnalysisDefinitionPage';
import { AnalysisReportPage } from '../pages/AnalysisReportPage';
import { AnalysisResultsPage } from '../pages/AnalysisResultsPage';
import { ErrorPages } from '../pages/ErrorPages';
import { HomePage } from '../pages/HomePage';
import { IndicatorDetailPage } from '../pages/IndicatorDetailPage';
import { gotoAndWaitReady } from '../pages/navigation';
import { NotificationsPage } from '../pages/NotificationsPage';
import { PresentationDetailPage } from '../pages/PresentationDetailPage';
import { PresentationsPage } from '../pages/PresentationsPage';
import { SensitivitiesPage } from '../pages/SensitivitiesPage';
import { SettingsPage } from '../pages/SettingsPage';
import { ValueMonitorPage } from '../pages/ValueMonitorPage';

import { freezeClock, screenOptions, unrollScroll, waitForFonts } from './capture';

import type { Page } from '@playwright/test';

// The same mock fixtures the functional e2e specs open (e2e/specs/*.spec.ts).
const ANALYSIS_ID = 'ana_e2e_smoke';
const INDICATOR_ID = 'ind_roace';
const PRESENTATION_ID = 'prs_directorio_t4';

interface Screen {
  readonly id: string;
  readonly title: string;
  readonly open: (page: Page) => Promise<void>;
}

// Signed-in screens (default mock session analyst_creator). SCR-01 lives in login.visual.spec.ts; SCR-02 needs an
// admin session this project's server does not carry (see e2e/specs/access-gate.spec.ts), so it has no baseline.
const SCREENS: readonly Screen[] = [
  { id: 'scr-05-inicio', title: 'SCR-05 inicio', open: (page) => new HomePage(page).goto() },
  {
    id: 'scr-06-analisis',
    title: 'SCR-06 analisis',
    open: (page) => new AnalysesPage(page).goto(),
  },
  {
    id: 'scr-07-definicion-paso-1',
    title: 'SCR-07 definicion paso 1',
    open: (page) => new AnalysisDefinitionPage(page).goto(ANALYSIS_ID, 1),
  },
  {
    id: 'scr-08-resultados',
    title: 'SCR-08 resultados',
    open: (page) => new AnalysisResultsPage(page).goto(ANALYSIS_ID),
  },
  {
    id: 'scr-09-visualizacion',
    title: 'SCR-09 visualizacion',
    open: (page) => new AnalysisReportPage(page).goto(ANALYSIS_ID),
  },
  {
    id: 'scr-10-detalle-indicador',
    title: 'SCR-10 detalle indicador',
    open: (page) => new IndicatorDetailPage(page).goto(ANALYSIS_ID, INDICATOR_ID),
  },
  {
    id: 'scr-11-monitor-de-valor',
    title: 'SCR-11 monitor de valor',
    open: (page) => new ValueMonitorPage(page).goto(),
  },
  {
    id: 'scr-12-sensibilidades',
    title: 'SCR-12 sensibilidades',
    open: (page) => new SensitivitiesPage(page).goto(),
  },
  {
    id: 'scr-13-presentaciones',
    title: 'SCR-13 presentaciones',
    open: (page) => new PresentationsPage(page).goto(),
  },
  {
    id: 'scr-13-builder',
    title: 'SCR-13 builder',
    open: (page) =>
      gotoAndWaitReady(page, `/presentaciones/${PRESENTATION_ID}/editar`, 'presentation-builder'),
  },
  {
    id: 'scr-14-presentacion',
    title: 'SCR-14 presentacion',
    open: (page) => new PresentationDetailPage(page).goto(PRESENTATION_ID),
  },
  {
    id: 'scr-15-notificaciones',
    title: 'SCR-15 notificaciones',
    open: (page) => new NotificationsPage(page).goto(),
  },
  {
    id: 'scr-16-configuracion',
    title: 'SCR-16 configuracion',
    open: (page) => new SettingsPage(page).goto(),
  },
  { id: 'scr-17-403', title: 'SCR-17 403', open: (page) => new ErrorPages(page).gotoForbidden() },
  { id: 'scr-17-404', title: 'SCR-17 404', open: (page) => new ErrorPages(page).gotoUnknownUrl() },
];

for (const screen of SCREENS) {
  test(screen.title, async ({ page }) => {
    await freezeClock(page);
    await screen.open(page);
    await waitForFonts(page);
    await unrollScroll(page);
    await expect(page).toHaveScreenshot(`${screen.id}.png`, screenOptions(page, screen.id));
  });
}
