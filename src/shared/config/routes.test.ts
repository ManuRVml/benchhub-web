import { matchPath } from 'react-router';
import { describe, expect, it } from 'vitest';

import { routes } from './routes';

/** Parses a built URL back into params (via the route pattern) and query values. */
const parse = (pattern: string, url: string) => {
  const parsed = new URL(url, 'http://localhost');
  const match = matchPath(pattern, parsed.pathname);
  // matchPath leaves percent-escapes partly encoded; decode each param for the comparison.
  const params = match
    ? Object.fromEntries(
        Object.entries(match.params).map(([k, v]) => [
          k,
          v === undefined ? v : decodeURIComponent(v),
        ]),
      )
    : null;
  return {
    params,
    query: Object.fromEntries(parsed.searchParams.entries()),
  };
};

describe('routes.build round-trips', () => {
  it('Resultados: path param and URL-persisted query', () => {
    const url = routes.analysisResults.build(
      { analysisId: 'ana_desempeno_4t2025' },
      { horizonte: 'ilp', compania: 'cmp_shell', categoria: undefined },
    );
    expect(url).toBe('/analisis/ana_desempeno_4t2025/resultados?horizonte=ilp&compania=cmp_shell');
    expect(parse(routes.analysisResults.path, url)).toEqual({
      params: { analysisId: 'ana_desempeno_4t2025' },
      query: { horizonte: 'ilp', compania: 'cmp_shell' },
    });
  });

  it('Detalle de indicador: two path params, encoded values', () => {
    const url = routes.indicatorDetail.build(
      { analysisId: 'ana 1/x', indicatorId: 'margen_ebitda' },
      { origen: 'presentacion' },
    );
    expect(url).toBe('/analisis/ana%201%2Fx/indicadores/margen_ebitda?origen=presentacion');
    const back = parse(routes.indicatorDetail.path, url);
    expect(back.params).toEqual({ analysisId: 'ana 1/x', indicatorId: 'margen_ebitda' });
    expect(back.query).toEqual({ origen: 'presentacion' });
  });

  it('Monitor de Valor: no path params, list and empty values', () => {
    const url = routes.valueMonitor.build(
      {},
      { corte: '2026-04', historico: '5y', categoria: ['financiero', 'mercado'], cumplimiento: [] },
    );
    expect(url).toBe('/monitor-valor?corte=2026-04&historico=5y&categoria=financiero%2Cmercado');
    expect(parse(routes.valueMonitor.path, url)).toEqual({
      params: {},
      query: { corte: '2026-04', historico: '5y', categoria: 'financiero,mercado' },
    });
  });

  it('routes without params or query build their bare path', () => {
    expect(routes.home.build()).toBe(routes.home.path);
    expect(routes.forbidden.build()).toBe(routes.forbidden.path);
  });
});
