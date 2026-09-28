/// <reference types="node" />
// @vitest-environment node
// Server-renders the routes and reads docs/design with node:fs, so it runs in the node environment (jsdom's URL is not
// accepted by readFileSync).
import { readFileSync } from 'node:fs';

import { renderToStaticMarkup } from 'react-dom/server';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { mockSession } from '@/entities/session';
import { routes } from '@/shared/config';

import {
  createQueryClient,
  createServiceContainer,
  QueryProvider,
  ServiceProvider,
} from '../providers';

import { APP_SHELL_ROUTE_ID, createAppRoutes } from './router';

import type { Session } from '@/entities/session';
import type { RouteKey } from '@/shared/config';

// Every route of docs/design/navigation-map.md §1 must resolve, through the real route objects, to the page of its
// SCR (placeholder pages carry data-testid="<page>-page").
const PAGE_OF_SCR: Readonly<Record<string, string>> = {
  'SCR-01': 'login',
  'SCR-02': 'access-gate',
  'SCR-03': 'admin',
  'SCR-04': 'home',
  'SCR-05': 'home',
  'SCR-06': 'analyses',
  'SCR-07': 'analysis-definition',
  'SCR-08': 'analysis-results',
  'SCR-09': 'analysis-report',
  'SCR-10': 'indicator-detail',
  'SCR-11': 'value-monitor',
  'SCR-12': 'sensitivities',
  'SCR-13': 'presentations',
  'SCR-14': 'presentation-detail',
  'SCR-15': 'notifications',
  'SCR-16': 'settings',
};
const SAMPLE_PARAMS: Readonly<Record<string, string>> = {
  analysisId: 'ana_test',
  indicatorId: 'roace',
  presentationId: 'prs_test',
};

interface NavRow {
  readonly scr: string;
  readonly pattern: string;
}

function navigationMapRoutes(): NavRow[] {
  const text = readFileSync(
    new URL('../../../docs/design/navigation-map.md', import.meta.url),
    'utf8',
  );
  const section = text.split(/^## 1\./m)[1]?.split(/^## 2\./m)[0] ?? '';
  const rows: NavRow[] = [];
  for (const line of section.split('\n')) {
    const cells = line.split(/(?<!\\)\|/).map((c) => c.trim());
    const pattern = /`([^`]+)`/.exec(cells[1] ?? '')?.[1]?.replace(/\\\|/g, '|');
    const scr = cells[2];
    if (pattern && scr && /^SCR-\d{2}$/.test(scr)) rows.push({ scr, pattern });
  }
  return rows;
}

/** Concrete URL for a navigation-map pattern: query template dropped, `:param` replaced, `*` → an unknown path. */
const sampleUrl = (pattern: string): string =>
  pattern === '*'
    ? '/ruta-que-no-existe'
    : (pattern.split('?')[0] ?? '').replace(
        /:([A-Za-z]+)/g,
        (_, name: string) => SAMPLE_PARAMS[name] ?? name,
      );

const expectedPage = ({ scr, pattern }: NavRow): string =>
  scr === 'SCR-17' ? (pattern === '*' ? 'not-found' : 'forbidden') : (PAGE_OF_SCR[scr] ?? '');

/** Screens drawn without the app shell (their routes sit outside the SCR-04 layout route). */
const STANDALONE_SCRS: ReadonlySet<string> = new Set(['SCR-01', 'SCR-02', 'SCR-03']);

/** Session the screen needs to open: none for Login, admin for the gate / back office, the analyst otherwise. */
const sessionFor = (scr: string): Session | null =>
  scr === 'SCR-01' ? null : mockSession('analyst_creator', scr === 'SCR-02' || scr === 'SCR-03');

/** SCR of the matched leaf route: its route-table entry, or SCR-17 for the `*` not-found route. */
const scrOfLeaf = (matchIds: readonly string[]): string | undefined => {
  const leaf = matchIds.at(-1);
  if (leaf === 'notFound') return 'SCR-17';
  return leaf !== undefined && leaf in routes ? routes[leaf as RouteKey].scr : undefined;
};

// The router lazy-loads one chunk per SCR page (router.tsx PAGES); on a busy run the first (cold) dynamic import of
// a real page can itself take seconds, which raced the default test timeout below. Preload every page module here
// instead of raising a timeout, so the it.each and guard tests below always render against an already-resolved
// module graph.
beforeAll(async () => {
  await Promise.all([
    import('@/pages/login'),
    import('@/pages/access-gate'),
    import('@/pages/admin'),
    import('@/pages/home'),
    import('@/pages/analyses'),
    import('@/pages/analysis-definition'),
    import('@/pages/analysis-results'),
    import('@/pages/analysis-report'),
    import('@/pages/indicator-detail'),
    import('@/pages/value-monitor'),
    import('@/pages/sensitivities'),
    import('@/pages/presentations'),
    import('@/pages/presentation-detail'),
    import('@/pages/notifications'),
    import('@/pages/settings'),
    import('@/pages/forbidden'),
    import('@/pages/not-found'),
  ]);
  // Cold-transforming all 17 page graphs at once exceeded 30 s in three full-suite runs on a loaded machine (INT-D11,
  // INT-D11 rerun, INT-D13) while the file alone takes ~10 s: the budget is for the one-off preload, not a test.
}, 120_000);

const created: { dispose(): void }[] = [];
afterEach(() => {
  for (const r of created.splice(0)) r.dispose();
});

async function open(url: string, session: Session | null) {
  const router = createMemoryRouter(
    createAppRoutes(() => session),
    { initialEntries: [url] },
  );
  created.push(router);
  await new Promise<void>((resolve) => {
    const ready = () => router.state.initialized && router.state.navigation.state === 'idle';
    if (ready()) {
      resolve();
      return;
    }
    const unsubscribe = router.subscribe(() => {
      if (ready()) {
        unsubscribe();
        resolve();
      }
    });
  });
  // The whole matched tree renders inside the router, as in the app: layout routes (the SCR-04 shell) and the page,
  // so pages and the shell can use router hooks and links (useNavigate, useSearchParams, <Link>). The loaders and lazy
  // pages have resolved by now, so one static render shows the final screen.
  const services = await createServiceContainer({
    mode: 'mock',
    onUnauthenticated: () => undefined,
  });
  return {
    pathname: router.state.location.pathname,
    matchIds: router.state.matches.map((m) => m.route.id),
    // Same providers as App.tsx (mock services, a fresh query cache): pages that query V-xx render their loading state.
    html: renderToStaticMarkup(
      <ServiceProvider services={services}>
        <QueryProvider client={createQueryClient()}>
          <RouterProvider router={router} />
        </QueryProvider>
      </ServiceProvider>,
    ),
    errors: router.state.errors,
  };
}

describe('router resolves every navigation-map §1 route', () => {
  const rows = navigationMapRoutes();

  it('reads the 21 routes of SCR-01..SCR-17', () => {
    expect(rows).toHaveLength(21);
    expect(new Set(rows.map((r) => r.scr)).size).toBe(17);
  });

  it.each(rows.map((r) => [r.scr, r.pattern, r] as const))('%s %s', async (_scr, _pattern, row) => {
    const result = await open(sampleUrl(row.pattern), sessionFor(row.scr));
    expect(result.errors).toBeNull();
    expect(result.html).toContain(`data-testid="${expectedPage(row)}-page"`);
    // The matched leaf route is the SCR's own route (the placeholder title used to carry the SCR id; real pages do not).
    expect(scrOfLeaf(result.matchIds)).toBe(row.scr === 'SCR-04' ? 'SCR-05' : row.scr);
    expect(result.matchIds.includes(APP_SHELL_ROUTE_ID)).toBe(!STANDALONE_SCRS.has(row.scr));
    // The shell is really drawn around shell pages (signed in) and absent from the standalone screens.
    expect(result.html.includes('data-testid="app-shell"')).toBe(!STANDALONE_SCRS.has(row.scr));
  });
});

describe('HydrateFallback', () => {
  it('renders while the root loader is pending (mutation: remove HydrateFallback -> test fails)', async () => {
    const routeObjects = createAppRoutes(() => mockSession()).map((route) =>
      route.id === 'root' ? { ...route, loader: () => new Promise<never>(() => undefined) } : route,
    );
    const router = createMemoryRouter(routeObjects, { initialEntries: [routes.root.path] });
    created.push(router);

    const services = await createServiceContainer({
      mode: 'mock',
      onUnauthenticated: () => undefined,
    });
    // The root loader is intentionally unresolved, so the initial render uses HydrateFallback.
    const html = renderToStaticMarkup(
      <ServiceProvider services={services}>
        <QueryProvider client={createQueryClient()}>
          <RouterProvider router={router} />
        </QueryProvider>
      </ServiceProvider>,
    );

    // Extract the HydrateFallback element and verify its attributes
    // Match from <div to >, including any attributes before or after data-testid
    const hydrateFallbackRegex = /<div[^>]*data-testid="hydrate-fallback"[^>]*>/;
    const hydrateFallbackMatch = hydrateFallbackRegex.exec(html);
    expect(hydrateFallbackMatch).not.toBeNull();
    const fallbackElement = hydrateFallbackMatch?.[0] ?? '';
    expect(fallbackElement).toContain('aria-busy="true"');
    expect(fallbackElement).toContain('role="status"');

    // Verify the loading text is in the document
    expect(html).toContain('Cargando…');
  });
});

describe('guards (navigation-map §2 redirects, §3 matrix)', () => {
  it('/ redirects to /inicio', async () => {
    const result = await open(routes.root.build(), mockSession());
    expect(result.pathname).toBe(routes.home.path);
  });

  it('unauthenticated users go to /login?returnTo=', async () => {
    const result = await open(routes.valueMonitor.build({}, { corte: '2026-04' }), null);
    expect(result.html).toContain('data-testid="login-page"');
  });

  it('the access gate sends users without hasAdminAccess to /inicio', async () => {
    const result = await open(routes.accessGate.build(), mockSession('analyst_creator', false));
    expect(result.pathname).toBe(routes.home.path);
  });

  it('the back office answers 403 without hasAdminAccess', async () => {
    const result = await open(routes.admin.build(), mockSession('executive_integral', false));
    expect(result.pathname).toBe(routes.forbidden.path);
  });

  it('executive_viewer gets 403 on Análisis and Visualización', async () => {
    const list = await open(routes.analyses.build(), mockSession('executive_viewer'));
    const viz = await open(
      routes.analysisReport.build({ analysisId: 'ana_test' }),
      mockSession('executive_viewer'),
    );
    expect([list.pathname, viz.pathname]).toEqual([routes.forbidden.path, routes.forbidden.path]);
  });

  it('explorer_viewer gets 403 on Presentaciones', async () => {
    const result = await open(routes.presentations.build(), mockSession('explorer_viewer'));
    expect(result.pathname).toBe(routes.forbidden.path);
  });

  it('a non-analyst on Resultados is sent to Visualización (OQ-42 default)', async () => {
    const result = await open(
      routes.analysisResults.build({ analysisId: 'ana_test' }),
      mockSession('explorer_integral'),
    );
    expect(result.pathname).toBe(routes.analysisReport.build({ analysisId: 'ana_test' }));
  });

  it('logged-in admins are sent from /login to the access gate', async () => {
    const result = await open(routes.login.build(), mockSession('analyst_creator', true));
    expect(result.pathname).toBe(routes.accessGate.path);
  });

  it('the 404 page renders without the shell when signed out (OQ-40 default)', async () => {
    const result = await open('/ruta-que-no-existe', null);
    expect(result.html).toContain('data-testid="not-found-page"');
    expect(result.matchIds).toContain(APP_SHELL_ROUTE_ID);
    expect(result.html).not.toContain('data-testid="app-shell"');
  });
});
