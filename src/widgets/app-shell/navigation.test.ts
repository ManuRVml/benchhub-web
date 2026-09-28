import { describe, expect, it } from 'vitest';

import { mockSession } from '@/entities/session';
import { routes } from '@/shared/config';

import { isNavItemActive, shellNavigationFromSession } from './navigation';

import type { ShellNavId, ShellNavItem } from './navigation';

const ANALYSIS = 'ana_01J9Y8D4T2';
const OTHER_ANALYSIS = 'ana_other';

const itemsOf = (role: Parameters<typeof mockSession>[0]) =>
  new Map(shellNavigationFromSession(mockSession(role)).map((item) => [item.id, item]));

/** The rows active on a URL, for the analyst (Ref. Competitivo → Resultados) and a viewer (→ Visualización). */
function activeRows(url: string, role: Parameters<typeof mockSession>[0] = 'analyst_creator') {
  const { pathname, search } = new URL(url, 'http://local');
  return [...itemsOf(role).values()]
    .filter((item) => isNavItemActive(item, pathname, search))
    .map((item) => item.id);
}

describe('isNavItemActive', () => {
  it.each<[string, string, ShellNavId]>([
    ['Inicio', routes.home.build(), 'home'],
    [
      'the analyses list opened from the sidebar',
      routes.analyses.build({}, { ref: 'tbg-ilp' }),
      'refTbgIlp',
    ],
    ['the analyses list without ref', routes.analyses.build(), 'refTbgIlp'],
    [
      'the analyses list with filters',
      routes.analyses.build({}, { q: 'roace', page: 2 }),
      'refTbgIlp',
    ],
    [
      'Definición',
      routes.analysisDefinition.build({ analysisId: ANALYSIS }, { paso: 3 }),
      'refCompetitive',
    ],
    ['Resultados', routes.analysisResults.build({ analysisId: ANALYSIS }), 'refCompetitive'],
    [
      'Resultados of another analysis with a query',
      routes.analysisResults.build({ analysisId: OTHER_ANALYSIS }, { horizonte: 'ilp' }),
      'refCompetitive',
    ],
    ['Visualización', routes.analysisReport.build({ analysisId: ANALYSIS }), 'refCompetitive'],
    [
      'Detalle de indicador',
      routes.indicatorDetail.build({ analysisId: ANALYSIS, indicatorId: 'ind_roace' }),
      'refCompetitive',
    ],
    ['Monitor de Valor', routes.valueMonitor.build({}, { corte: '2026-04' }), 'valueMonitor'],
    ['Sensibilidades', routes.sensitivities.build({}, { indicador: 'roace' }), 'valueMonitor'],
    ['Presentaciones', routes.presentations.build(), 'presentations'],
    [
      'a new presentation',
      routes.presentationNew.build({}, { analysisId: ANALYSIS }),
      'presentations',
    ],
    [
      'a presentation',
      routes.presentationDetail.build({ presentationId: 'prs_1' }, { slide: 2 }),
      'presentations',
    ],
    [
      'a presentation in edit',
      routes.presentationEdit.build({ presentationId: 'prs_1' }),
      'presentations',
    ],
    [
      'the analysis presentations',
      routes.analysisPresentations.build({ analysisId: ANALYSIS }),
      'presentations',
    ],
    ['Notificaciones', routes.notifications.build({}, { severidad: ['warn'] }), 'notifications'],
  ])('highlights only its row on %s (%s)', (_, url, id) => {
    expect(activeRows(url)).toEqual([id]);
  });

  it('keeps "Ref. Competitivo" active on Resultados for a role whose target is Visualización', () => {
    expect(
      activeRows(routes.analysisResults.build({ analysisId: ANALYSIS }), 'executive_integral'),
    ).toEqual(['refCompetitive']);
    expect(
      activeRows(routes.analysisReport.build({ analysisId: ANALYSIS }), 'executive_integral'),
    ).toEqual(['refCompetitive']);
  });

  it.each([routes.settings.build(), routes.forbidden.build(), '/desconocida'])(
    'highlights no row on %s',
    (url) => {
      expect(activeRows(url)).toEqual([]);
    },
  );

  it('follows a target the BFF points elsewhere (exact URL match)', () => {
    const item: ShellNavItem = {
      id: 'valueMonitor',
      to: routes.notifications.build(),
      isLocked: false,
    };
    expect(isNavItemActive(item, routes.notifications.build(), '')).toBe(true);
  });
});
