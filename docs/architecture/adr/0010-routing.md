# ADR-0010: Routing — React Router data mode, typed route table, guards as loaders

## Status

Accepted.

## Context

The SPA has 17 screens reached through 21 URLs (`docs/design/navigation-map.md` §1), with redirects (§2) and role-based
access (§3, one row per screen inventory). The brief asks for a centralised, typed route table in
`src/app/router/routes.ts` with a `build()` per route and no route strings anywhere else, nested linkable routes for
tabs, lazy loading per page, an `errorElement` per route, 404 and 403 pages, and guards based on `/api/v1/session`. The
real session arrives only with P5-01, so the guards must work against a typed stand-in now.

Sources: `prompt_Start_Eco.md` §5.4 (L488–493), §2.4 stack table (L207, "React Router (última, modo data)"),
`.plan/source-map/10-synthesis.md` §1.19 (L527–551, role model); `docs/design/navigation-map.md` §1–§4;
`docs/design/open-questions.md` OQ-40 and OQ-42 (defaults applied).

## Decision

1. **React Router 8.4.0 in data mode** (exact pin): `createBrowserRouter` in the app, `createMemoryRouter` in tests,
   `RouterProvider` from `react-router/dom`.
2. **One typed route table** — `src/shared/config/routes.ts` is the only file with path strings (amended by CF-142: the
   table moved from `src/app/router/routes.ts` to the shared layer, because pages, widgets and features must build links
   and navigate and FSD forbids them to import `app`; router construction, guards and lazy pages stay in
   `src/app/router`, which imports the table from `@/shared/config`). Each entry carries `scr`, the `path` pattern, the
   URL-persisted `query` keys and `build(params, query)`; params are typed from the pattern.
   The routes lint rule (`tools/architecture/fsd-rules.js`) rejects string and template literals in JSX `to` / `href`,
   `navigate` / `redirect` / `replace` calls and literal `path` values of route objects anywhere else.
3. **App shell as a pathless layout route** (SCR-04) whose component draws the shell widget
   `src/widgets/app-shell/`: in FSD a page layout composed by the app is a widget, and `app` may import widgets while
   pages never import the shell. Login, access gate and admin are top-level routes outside the shell (their inventories
   have no app header). The 403 / 404 pages render inside the shell with a session and standalone without one (OQ-40
   default).
4. **Guards are route loaders.** `src/app/router/access.ts` holds one policy per route key, restating the §3 matrix and
   the §2 redirects (unauthenticated → `/login?returnTo=`, denied role → `/403`, `/acceso` without `hasAdminAccess` →
   `/inicio`, `/admin` without it → `/403`, non-analyst on Resultados → Visualización per OQ-42). The loader reads a
   `SessionSource`; until P5-01 it is the typed mock of `src/entities/session` (`VITE_MOCK_ROLE`, `VITE_MOCK_ADMIN`).
5. **Lazy page modules** — one `src/pages/<page>/index.ts` per screen, loaded through the route's `lazy`, each with its
   own `errorElement`.

## Alternatives considered

- **Declarative `<Routes>` / component mode**: no loaders, so guards would render-then-redirect and lazy data loading
  would need a second mechanism. Rejected; the brief asks for data mode.
- **TanStack Router**: stronger type inference for search params, but the brief names React Router and ADR-0005 already
  plans typed search params with Zod on top of it. Rejected.
- **Guards as wrapper components** (`<RequireRole>`): they run after the route matched and flash content before
  redirecting. Rejected in favour of loaders.
- **Shell in `src/app/`**: works, but the shell will grow sidebar, header and assistant widgets that belong to the widget
  layer. Rejected.

## Consequences

- Positive: one place to change a URL; typed params catch missing values at compile time; every navigation-map route is
  verified by a test that resolves it through the real route objects.
- Positive: pages load as separate chunks; a failing page stays inside its route's error element.
- Negative: route objects outside `routes.ts` may not use literal paths even in tests; tests build URLs from
  `routes.<key>.build()` or from the navigation map.
- Follow-up: P5-01 replaces the mock `SessionSource` with the A-04 session query (401 → `/login?returnTo=`); P5-30 fills
  the shell; OQ-40 / OQ-42 decisions may change `access.ts` only.
