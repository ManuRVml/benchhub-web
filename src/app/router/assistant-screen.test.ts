import { describe, expect, it } from 'vitest';

import { routes } from '@/shared/config';

import { assistantContextForPath } from './assistant-screen';

describe('assistantContextForPath', () => {
  it('maps the home route to inicio, with no analysis', () => {
    expect(assistantContextForPath(routes.home.build())).toEqual({ screen: 'inicio' });
  });

  it('maps the analysis screens and carries the analysis id from the route params', () => {
    const analysisId = 'ana_01';
    expect(assistantContextForPath(routes.analysisDefinition.build({ analysisId }))).toEqual({
      screen: 'definicion',
      analysisId,
    });
    expect(assistantContextForPath(routes.analysisResults.build({ analysisId }))).toEqual({
      screen: 'resultados',
      analysisId,
    });
    expect(assistantContextForPath(routes.analysisReport.build({ analysisId }))).toEqual({
      screen: 'visualizacion',
      analysisId,
    });
    expect(
      assistantContextForPath(
        routes.indicatorDetail.build({ analysisId, indicatorId: 'ind_roace' }),
      ),
    ).toEqual({ screen: 'detalle-indicador', analysisId });
    expect(assistantContextForPath(routes.analysisPresentations.build({ analysisId }))).toEqual({
      screen: 'presentaciones',
      analysisId,
    });
  });

  it('maps the screens that have no analysis in their route', () => {
    expect(assistantContextForPath(routes.analyses.build())).toEqual({ screen: 'analisis' });
    expect(assistantContextForPath(routes.valueMonitor.build())).toEqual({
      screen: 'monitor-valor',
    });
    expect(assistantContextForPath(routes.sensitivities.build())).toEqual({
      screen: 'sensibilidades',
    });
    expect(assistantContextForPath(routes.notifications.build())).toEqual({
      screen: 'notificaciones',
    });
    expect(assistantContextForPath(routes.settings.build())).toEqual({
      screen: 'configuracion',
    });
  });

  it('tells the presentation list, the new/edit builder and the viewer apart', () => {
    expect(assistantContextForPath(routes.presentations.build())).toEqual({
      screen: 'presentaciones',
    });
    expect(assistantContextForPath(routes.presentationNew.build())).toEqual({
      screen: 'presentaciones',
    });
    expect(
      assistantContextForPath(routes.presentationEdit.build({ presentationId: 'prs_1' })),
    ).toEqual({ screen: 'presentaciones' });
    expect(
      assistantContextForPath(routes.presentationDetail.build({ presentationId: 'prs_1' })),
    ).toEqual({ screen: 'presentacion-detalle' });
  });

  it('gives the routes without an assistant screen null', () => {
    const paths = [
      routes.login.build(),
      routes.accessGate.build(),
      routes.admin.build(),
      routes.forbidden.build(),
      '/no-existe',
    ];
    for (const path of paths) expect(assistantContextForPath(path)).toBeNull();
  });
});
