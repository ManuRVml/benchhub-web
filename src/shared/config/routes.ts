// The only file that spells route paths (brief §5.4, eco/routes-only-in-routes-ts). It lives in shared/config so every
// layer can build links and navigate (CF-142); router construction, guards and lazy pages stay in src/app/router. Every other module builds URLs
// with `routes.<key>.build(params, query)` and matches with `routes.<key>.path`.
// Source of the table: docs/design/navigation-map.md §1 (21 routes of SCR-01..SCR-17).
import { encodeQueryValue } from '@/shared/lib/url';

import type { QueryValue } from '@/shared/lib/url';

export type ScrId =
  | 'SCR-01'
  | 'SCR-02'
  | 'SCR-03'
  | 'SCR-04'
  | 'SCR-05'
  | 'SCR-06'
  | 'SCR-07'
  | 'SCR-08'
  | 'SCR-09'
  | 'SCR-10'
  | 'SCR-11'
  | 'SCR-12'
  | 'SCR-13'
  | 'SCR-14'
  | 'SCR-15'
  | 'SCR-16'
  | 'SCR-17';

/** `:name` segments of a path pattern, e.g. `'/analisis/:analysisId/resultados'` → `'analysisId'`. */
export type PathParamName<P extends string> = P extends `${string}:${infer Name}/${infer Rest}`
  ? Name | PathParamName<`/${Rest}`>
  : P extends `${string}:${infer Name}`
    ? Name
    : never;

export type RouteParams<P extends string> = Readonly<Record<PathParamName<P>, string>>;

/** Query values use the URL-state encoding of `@/shared/lib/url` (lists comma-joined, empty values dropped). */
export type RouteQuery<Q extends string> = Readonly<Partial<Record<Q, QueryValue>>>;

type BuildArgs<P extends string, Q extends string> = [PathParamName<P>] extends [never]
  ? [params?: Readonly<Record<string, never>>, query?: RouteQuery<Q>]
  : [params: RouteParams<P>, query?: RouteQuery<Q>];

export interface RouteDefinition<P extends string, Q extends string> {
  /** Screen inventory that owns the route (docs/design/screen-inventory/<scr>-*.md). */
  readonly scr: ScrId;
  /** Path pattern for the router (`:param` segments). */
  readonly path: P;
  /** Query params that hold URL-persisted state, in the order they are written. */
  readonly query: readonly Q[];
  /** Concrete URL: params are URI-encoded, empty query values are dropped. */
  build(...args: BuildArgs<P, Q>): string;
}

function defineRoute<const P extends string, const Q extends string = never>(
  scr: ScrId,
  path: P,
  query: readonly Q[] = [],
): RouteDefinition<P, Q> {
  return {
    scr,
    path,
    query,
    build(...args: BuildArgs<P, Q>): string {
      const [rawParams, rawQuery] = args as readonly unknown[];
      const params = rawParams as Readonly<Record<string, string>> | undefined;
      const search = rawQuery as Readonly<Record<string, QueryValue>> | undefined;
      const pathname = path.replace(/:([A-Za-z][A-Za-z0-9]*)/g, (_, name: string) => {
        const value = params?.[name];
        if (value === undefined) throw new Error(`Missing route param "${name}" for ${path}`);
        return encodeURIComponent(value);
      });
      const qs = new URLSearchParams();
      for (const key of query) {
        const value = encodeQueryValue(search?.[key]);
        if (value !== null) qs.set(key, value);
      }
      const text = qs.toString();
      return text ? `${pathname}?${text}` : pathname;
    },
  };
}

export const routes = {
  root: defineRoute('SCR-05', '/'),
  login: defineRoute('SCR-01', '/login', ['returnTo', 'error']),
  accessGate: defineRoute('SCR-02', '/acceso', ['returnTo']),
  admin: defineRoute('SCR-03', '/admin'),
  home: defineRoute('SCR-05', '/inicio'),
  analyses: defineRoute('SCR-06', '/analisis', ['q', 'fecha', 'creador', 'estado', 'ref', 'page']),
  analysisDefinition: defineRoute('SCR-07', '/analisis/:analysisId/definicion', ['paso']),
  analysisResults: defineRoute('SCR-08', '/analisis/:analysisId/resultados', [
    'horizonte',
    'compania',
    'categoria',
    'pvc',
    'resumen',
  ]),
  analysisReport: defineRoute('SCR-09', '/analisis/:analysisId/visualizacion', [
    'categoria',
    'ranking',
    'peso',
  ]),
  indicatorDetail: defineRoute('SCR-10', '/analisis/:analysisId/indicadores/:indicatorId', [
    'origen',
  ]),
  valueMonitor: defineRoute('SCR-11', '/monitor-valor', [
    'corte',
    'historico',
    'categoria',
    'cumplimiento',
    'vista',
  ]),
  sensitivities: defineRoute('SCR-12', '/monitor-valor/sensibilidades', ['indicador']),
  presentations: defineRoute('SCR-13', '/presentaciones', ['page']),
  presentationNew: defineRoute('SCR-13', '/presentaciones/nueva', ['analysisId']),
  presentationEdit: defineRoute('SCR-13', '/presentaciones/:presentationId/editar'),
  analysisPresentations: defineRoute('SCR-13', '/analisis/:analysisId/presentaciones'),
  presentationDetail: defineRoute('SCR-14', '/presentaciones/:presentationId', ['slide']),
  notifications: defineRoute('SCR-15', '/notificaciones', ['q', 'severidad']),
  settings: defineRoute('SCR-16', '/configuracion'),
  forbidden: defineRoute('SCR-17', '/403'),
} as const;

/** Catch-all pattern of the 404 page (SCR-17); it has no URL of its own to build. */
export const NOT_FOUND_PATH = '*';

export type RouteKey = keyof typeof routes;
