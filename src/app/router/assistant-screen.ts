import { matchPath } from 'react-router';

import { routes } from '@/shared/config';

import type { AssistantScreen } from '@/features/assistant';

/** The screen the Yarbis assistant is on (C-33 `context.screen`, V-46 through `toAssistantContextScreen`). */
export interface AssistantRouteContext {
  screen: AssistantScreen;
  /** Set when the route belongs to an analysis (C-33 `context.analysisId`, V-46 `?analysisId=`). */
  analysisId?: string;
}

// One row per route that has an assistant screen; first match wins, so the fixed `/presentaciones/nueva` comes before
// the `:presentationId` patterns. The routes without one (login, gate, admin, 403, 404) get no assistant.
const ASSISTANT_ROUTES: readonly { path: string; screen: AssistantScreen }[] = [
  { path: routes.home.path, screen: 'inicio' },
  { path: routes.analyses.path, screen: 'analisis' },
  { path: routes.analysisDefinition.path, screen: 'definicion' },
  { path: routes.analysisResults.path, screen: 'resultados' },
  { path: routes.analysisReport.path, screen: 'visualizacion' },
  { path: routes.indicatorDetail.path, screen: 'detalle-indicador' },
  { path: routes.valueMonitor.path, screen: 'monitor-valor' },
  { path: routes.sensitivities.path, screen: 'sensibilidades' },
  { path: routes.presentations.path, screen: 'presentaciones' },
  { path: routes.presentationNew.path, screen: 'presentaciones' },
  { path: routes.presentationEdit.path, screen: 'presentaciones' },
  { path: routes.analysisPresentations.path, screen: 'presentaciones' },
  { path: routes.presentationDetail.path, screen: 'presentacion-detalle' },
  { path: routes.notifications.path, screen: 'notificaciones' },
  { path: routes.settings.path, screen: 'configuracion' },
];

/** Route → assistant screen (and analysis), or `null` where the assistant has no screen. */
export function assistantContextForPath(pathname: string): AssistantRouteContext | null {
  for (const { path, screen } of ASSISTANT_ROUTES) {
    const match = matchPath({ path, end: true }, pathname);
    if (match === null) continue;
    const { analysisId } = match.params;
    return analysisId === undefined ? { screen } : { screen, analysisId };
  }
  return null;
}
