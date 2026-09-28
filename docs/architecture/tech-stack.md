# Eco-Comparador Web Tech Stack

Every dependency is pinned to an exact version (`.npmrc` `save-exact=true`, no `^`/`~`). Versions were the latest
stable release on the checked date (`pnpm view <pkg> version`, no alpha/beta/rc), except where a row says otherwise.

## Runtime and package manager

| Tool    | Exact version | Why                                                                     | Checked    |
| ------- | ------------- | ----------------------------------------------------------------------- | ---------- |
| Node.js | 24.14.1       | Current LTS line; `engines.node >=24`, `engine-strict=true` in `.npmrc` | 2026-09-25 |
| pnpm    | 11.9.0        | Package manager (`packageManager` field); same version as the BFF       | 2026-09-25 |

## Runtime dependencies (P2-W01b, P2-W03)

| Package                          | Exact version | Why                                                                         | Checked    |
| -------------------------------- | ------------- | --------------------------------------------------------------------------- | ---------- |
| react                            | 19.3.0        | UI runtime (brief §2.4 "React 19+"); `src/main.tsx` mounts `App`            | 2026-09-25 |
| react-dom                        | 19.3.0        | DOM renderer (`react-dom/client` `createRoot`)                              | 2026-09-25 |
| react-router                     | 8.4.0         | Data router (brief §5.4, ADR-0010): lazy routes, loaders as guards (P2-W06) | 2026-09-25 |
| class-variance-authority         | 0.7.1         | Typed component variants (`cva`, ADR 0002)                                  | 2026-09-25 |
| tailwind-merge                   | 3.7.0         | Conflict-aware class merging in `cn()` (Tailwind v4 support)                | 2026-09-25 |
| clsx                             | 2.1.1         | Conditional class names in `cn()`                                           | 2026-09-25 |
| @fontsource-variable/roboto      | 5.3.0         | Self-hosted Roboto (family `Roboto Variable`), bundled by Vite; no CDN      | 2026-09-25 |
| @fontsource-variable/roboto-mono | 5.3.0         | Self-hosted Roboto Mono (family `Roboto Mono Variable`); also the harness'  | 2026-09-25 |
| i18next   | 26.4.2        | i18n core (brief §2.4, es-CO); `src/shared/i18n/`, see `docs/architecture/i18n.md` (P2-W07) | 2026-09-25 |
| react-i18next | 17.0.15   | React bindings (`useTranslation` behind `useT()`); peer `typescript ^5 \|\| ^6 \|\| ^7` (P2-W07) | 2026-09-25 |
| zod       | 4.6.5         | Schemas of URL state in `useTypedSearchParams` (ADR-0005); same major as the BFF (P5-05) | 2026-09-25 |
| zustand   | 5.0.15        | Client UI stores, one per domain, devtools only in development (ADR-0005, P5-05) | 2026-09-25 |

## Tooling devDependencies (P2-W01a, before Gate 1)

| Package                         | Exact version | Why                                                                                                       | Checked    |
| ------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------- | ---------- |
| typescript                      | 7.0.2         | `pnpm typecheck` (`tsc --noEmit`); brief §2.4 strict flags in `tsconfig.json`                             | 2026-09-25 |
| @types/node                     | 24.13.6       | Node 24 types for tooling scripts and configs (latest of the 24.x line, matching the Node runtime)        | 2026-09-25 |
| @types/react                    | 19.3.0        | React 19 types for the app (matches the react 19.3.0 runtime dependency)                                  | 2026-09-25 |
| @types/react-dom                | 19.3.0        | React DOM 19 types (`react-dom/client`)                                                                   | 2026-09-25 |
| vitest                          | 5.0.1         | `pnpm test` (`vitest run --passWithNoTests`); same version as the BFF                                     | 2026-09-25 |
| vite                            | 8.3.1         | Dev server and build (`vite.config.ts`, P2-W01b); also the required peer of vitest 5                      | 2026-09-25 |
| @vitejs/plugin-react            | 6.1.1         | React Fast Refresh + JSX transform for Vite 8 (`vite.config.ts`)                                          | 2026-09-25 |
| tailwindcss                     | 4.3.3         | Utility CSS; `@theme` generated from the tokens (ADR 0002, P2-W03)                                        | 2026-09-25 |
| @tailwindcss/vite               | 4.3.3         | Tailwind v4 Vite plugin (`vite.config.ts`)                                                                | 2026-09-25 |
| eslint                          | 10.11.0       | Linter (`eslint.config.js`, P2-W02); same version as the BFF                                              | 2026-09-25 |
| prettier                        | 3.9.9         | Formatter (`.prettierrc`, P2-W02); same version as the BFF                                                | 2026-09-25 |
| husky                           | 9.1.7         | Git hooks; `prepare` script runs `husky`, `.husky/pre-commit` runs `pnpm exec lint-staged`                | 2026-09-25 |
| lint-staged                     | 17.5.1        | Staged files: `eslint --max-warnings 0` on `*.{ts,tsx,js,mjs}` (P2-W02) + `prettier --check` (P2-W05)     | 2026-09-25 |
| @commitlint/cli                 | 21.2.3        | Validates commit messages; run by `.husky/commit-msg`                                                     | 2026-09-25 |
| @commitlint/config-conventional | 21.2.3        | Conventional Commits rules for commitlint                                                                 | 2026-09-25 |

## Test runner devDependencies (P2-W04a)

| Package                     | Exact version | Why                                                                                   | Checked    |
| --------------------------- | ------------- | ------------------------------------------------------------------------------------- | ---------- |
| @testing-library/react      | 16.3.3        | Component tests (`render`, `screen`), React 19 peer                                   | 2026-09-25 |
| @testing-library/dom        | 10.4.2        | Required peer of @testing-library/react 16 and jest-dom 7                             | 2026-09-25 |
| @testing-library/jest-dom   | 7.0.1         | DOM matchers for vitest (`@testing-library/jest-dom/vitest` in `tools/test/setup.ts`) | 2026-09-25 |
| @testing-library/user-event | 14.6.7        | Realistic user interactions in component tests                                        | 2026-09-25 |
| jsdom                       | 30.1.1        | Vitest `environment: 'jsdom'` (`vitest.config.ts`)                                    | 2026-09-25 |
| msw                         | 2.15.0        | Network mocks: node server `tools/test/msw/server.ts`, `onUnhandledRequest: 'error'`  | 2026-09-25 |
| @playwright/test            | 1.63.0        | E2E runner (`playwright.config.ts`, `pnpm test:e2e`); same version as `playwright`    | 2026-09-25 |
| @axe-core/playwright        | 4.13.0        | Accessibility scans inside e2e specs (WCAG 2.2 AA target)                             | 2026-09-25 |

- `vitest.config.ts` merges `vite.config.ts` (React plugin, `@` alias) and adds jsdom, the setup file and
  `include: src/**/*.test.{ts,tsx}`, `tools/**/*.test.{ts,tsx,mjs}`. `tools/test/setup.ts` loads the jest-dom
  matchers, cleans up Testing Library after each test and runs the MSW node server; any request without a handler
  fails the test. `tools/test/setup.smoke.test.tsx` proves the wiring (jsdom + jest-dom + user-event + MSW).
- `playwright.config.ts`: specs in `e2e/`, Chromium only, `list` reporter, `webServer` = `pnpm dev` on :5173 with
  `VITE_API_MODE=mock` (no BFF needed). `pnpm test:e2e` passes with no specs until the first e2e row lands.
- `pnpm-workspace.yaml` denies the msw build script: it only copies the browser service-worker file, and the tests use
  `msw/node`.

## Storybook devDependencies (P2-W04b)

| Package               | Exact version | Why                                                                              | Checked    |
| --------------------- | ------------- | -------------------------------------------------------------------------------- | ---------- |
| storybook             | 10.6.0        | Component workshop CLI (`pnpm storybook`, `pnpm build-storybook`)                | 2026-09-25 |
| @storybook/react-vite | 10.6.0        | React + Vite framework; reuses `vite.config.ts` (React + Tailwind, `@` alias)    | 2026-09-25 |
| @storybook/addon-docs | 10.6.0        | Autodocs pages from the component props and TSDoc (`tags: ['autodocs']`)         | 2026-09-25 |
| @storybook/addon-a11y | 10.6.0        | axe accessibility panel; `a11y.test: 'error'` fails stories in the test runner   | 2026-09-25 |

- `.storybook/main.ts`: stories only from `src/shared/ui/**/*.stories.tsx` (brief §5.5: every shared/ui component gets
  a story), telemetry off, `reactDocgen: 'react-docgen'` (Babel-based; `react-docgen-typescript` would need the
  TypeScript compiler API that typescript@7 lacks). `.storybook/preview.ts` imports `src/app/styles/global.css`, so
  stories render with the token theme and the self-hosted Roboto fonts. `main.ts` type-checks in `tsconfig.node.json`,
  `preview.ts` in `tsconfig.app.json` (CSS side-effect import needs `vite/client` types).
- `pnpm build-storybook` writes `storybook-static/` (git-, ESLint- and Prettier-ignored). `pnpm-workspace.yaml` allows
  the esbuild build script (platform binary check), as the BFF does.
- First component: `src/shared/ui/primitives/button/` (`Button.tsx` cva variants `primary` / `outline` / `link`, sizes
  `sm` / `md` / `lg`, `fullWidth`, `loading` with `aria-busy`, `testId` → `data-testid`, forwardRef; story and Testing
  Library test next to it). Story labels come from the i18n catalogue (`t('common.…')`), not literals.

## Lint and format devDependencies (P2-W02)

| Package                           | Exact version | Why                                                                              | Checked    |
| --------------------------------- | ------------- | -------------------------------------------------------------------------------- | ---------- |
| @eslint/js                        | 10.0.1        | ESLint recommended rules                                                         | 2026-09-25 |
| typescript-eslint                 | 8.70.1        | Type-checked TS rules (`strictTypeChecked`, `projectService`)                    | 2026-09-25 |
| eslint-plugin-react               | 7.37.5        | React rules (`flat.recommended` + `jsx-runtime`, React version pinned to 19.3)   | 2026-09-25 |
| eslint-plugin-react-hooks         | 7.1.1         | Hooks rules; `react-hooks/exhaustive-deps` is an error                           | 2026-09-25 |
| eslint-plugin-jsx-a11y            | 6.10.2        | Accessibility rules for JSX (WCAG 2.2 AA target)                                 | 2026-09-25 |
| eslint-plugin-import-x            | 4.17.1        | Import order, cycles, duplicates                                                 | 2026-09-25 |
| eslint-import-resolver-typescript | 4.4.5         | TS import resolution for import-x and boundaries                                 | 2026-09-25 |
| eslint-plugin-boundaries          | 7.2.0         | FSD layer, slice and public-API rules (`tools/architecture/fsd-rules.js`)        | 2026-09-25 |
| @vitest/eslint-plugin             | 1.6.27        | Vitest rules for `*.test.*` / `*.spec.*`                                         | 2026-09-25 |
| eslint-plugin-playwright          | 2.12.0        | Playwright rules for `e2e/**`                                                    | 2026-09-25 |
| eslint-config-prettier            | 10.1.8        | Turns off rules Prettier owns (last config block)                                | 2026-09-25 |
| globals                           | 17.12.0       | Browser + Node globals                                                           | 2026-09-25 |
| jsdom                             | 30.1.1        | DOM for the `@vitest-environment jsdom` tests of the URL hook and the layout store (P5-05) | 2026-09-25 |
| prettier-plugin-tailwindcss       | 0.8.1         | Tailwind class sorting (brief §2.4), `tailwindStylesheet` = `global.css`         | 2026-09-25 |
| typescript (tooling only)         | 6.0.3         | JS compiler API for typescript-eslint (see below); not a direct dependency       | 2026-09-25 |

**ESLint 10 peer ranges.** eslint-plugin-react 7.37.5 and eslint-plugin-jsx-a11y 6.10.2 are the latest releases and
still declare `eslint` up to 9. Both load and run under eslint 10.11.0 (`pnpm lint` exercises them on the `.tsx`
fixtures), so `pnpm-workspace.yaml` `peerDependencyRules.allowedVersions` accepts eslint 10 for exactly those two
packages. Drop the entries when the plugins publish eslint 10 support.

**Lint scope.** `pnpm lint` runs `eslint . --max-warnings 0` (configs, `tools/**`, `tools/arch-fixtures/valid/**`,
`src/**` once it exists); `tools/arch-fixtures/planted/**` is ignored. Command-line tools under `tools/` may use
`console`. Prettier formats code and config; it skips `docs/**` and `*.md` (`.prettierignore`), which the docs tasks
curate or generate.

## Styling: design tokens → Tailwind v4 theme (P2-W03)

- `tools/tokens/build-theme.mjs` reads `docs/design/design-tokens.json` (DTCG), resolves every `{reference}` to its
  literal and writes two generated files (GENERATED header, Prettier-ignored):
  - `src/app/styles/theme.css`: a Tailwind v4 `@theme` block — colours `--color-<path>` (`brand.primary` →
    `--color-brand-primary`), `--font-sans` / `--font-mono` (fontsource family first, then the token stack),
    `--font-weight-*`, `--leading-*`, `--tracking-*`, `--text-<n>` (sizes) and `--text-<role>` with `--line-height` /
    `--letter-spacing` / `--font-weight` sub-properties (typography roles), `--spacing-*`, `--radius-*`, `--shadow-*`,
    `--breakpoint-*` — plus a `:root` block with plain custom properties for `z.*`, `motion.*`, `gradient.*`, `size.*`
    (non-font), `focus.*` and `scrollbar.*` dimensions. Deprecated tokens are emitted with a `/* deprecated */` note.
  - `src/shared/lib/tailwind-theme.generated.ts`: token names per namespace, fed to `extendTailwindMerge` in `cn()` so
    `text-eyebrow` (size) and `text-brand-primary` (colour) are not merged as one group.
- Tailwind's default `--color-*`, `--shadow-*`, `--radius-*` and `--breakpoint-*` values are reset (`initial`): the
  tokens are the only colours, shadows, radii and breakpoints (ADR 0002). Tailwind's default spacing multiplier and
  text sizes still exist; token names win where they collide (`p-28` = `--spacing-28` = 28px, not 7rem).
- Typography roles set size, weight and line height; the two mono roles also need `font-mono` (Tailwind `text-*` does
  not set the family), and `eyebrow` needs `uppercase` (the token keeps `textTransform` in `$extensions`).
- `pnpm tokens:build` regenerates; `pnpm tokens:check` (first step of `pnpm verify`) regenerates in memory and exits 1
  when a committed file differs. `DESIGN_TOKENS_PATH` / `--tokens <path>` point it at another token file.
- `tools/tokens/theme.test.mjs` (vitest) asserts every colour token path has its `--color-*` variable with the resolved
  hex and that the default palette is reset.
- `src/app/styles/global.css` imports `tailwindcss`, `theme.css` and the two fontsource packages, and sets base styles
  from tokens (body font / size / colour / page background, headings, links, focus ring, scrollbar, reduced motion).

## Charts: ECharts (P5-19)

| Package | Exact version | Why                                                                     | Checked    |
| ------- | ------------- | ----------------------------------------------------------------------- | ---------- |
| echarts | 6.1.0         | Chart engine behind `src/shared/ui/charts/` (D3), latest stable release | 2026-09-25 |

- `src/shared/ui/charts/echarts/core.ts` is the only module that imports ECharts: modular build (`echarts/core` +
  `BarChart`, `GridComponent`, `LegendComponent`, `TooltipComponent`, `SVGRenderer`), a typed `ChartOption` limited to
  what is registered, and `createChart(element)` (SVG renderer, token theme). New chart types register their series and
  components there.
- `theme.ts` builds the ECharts theme from `docs/design/design-tokens.json` (the DTCG source of `theme.css`), following
  `{reference}` aliases: palette `chart.series.1..9` (the Ecopetrol highlight `#83E377` stays out), axis / grid / tooltip
  colours from `border.*`, `text.*`, `surface.card`, font stack from `font.family.sans` with the fontsource family first.
  No colour literal in TypeScript. Named JSON imports keep unused token groups out of the bundle.
- `EChart` (React): creates the instance on mount, disposes it on unmount, resizes it with a `ResizeObserver`, replaces
  the whole option on change (`notMerge`), and forces `animation: false` under `prefers-reduced-motion: reduce`. The
  chart container is `role="img"` with `aria-label`, `data-testid` and `data-series-count`; a visually hidden `<table>`
  (caption, `th scope="col"` / `scope="row"`) carries the same values, already formatted.
- `GroupedBarChart({ categories, series, unit, ariaLabel, categoryLabel? })`: es-CO values from `src/shared/lib/format`
  for axis labels, tooltips and the data table; `null` is passed through as an ECharts gap and shows as "—", never 0.
  Story "ROACE por compañía" uses the prototype's `PEER_SETS.roace` 2024 / 2025 values.
- Tests mock `echarts/core` (`createChart`) because jsdom has no layout; they check the option passed to `setOption`.

## Contract consumption: vendored BFF contract + Orval (P3-13, ADR-0004)

| Package | Exact version | Why                                                                                   | Checked    |
| ------- | ------------- | ------------------------------------------------------------------------------------- | ---------- |
| orval   | 8.37.0        | Generates TypeScript types + Zod schemas from the vendored OpenAPI 3.1, latest stable | 2026-09-25 |

- The contract is a copy, never a path into the BFF repo (brief L22, D4): `vendor/contract/@eco/bff-contract-0.2.0.tgz`
  pinned by `contract.lock.json` (`package`, `version`, `sha256`). 0.1.0 is a partial pre-release: 48 operations
  (V-03..V-14, C-01..C-36), no query parameters yet; see the tarball's `CHANGELOG.md`.
- `pnpm contract:generate` (`tools/contract/generate.mjs`): verifies the SHA-256, unpacks the tarball with Node only
  (`node:zlib` + a ustar reader) into `vendor/contract/unpacked/` and runs Orval's programmatic API with `client: 'zod'`
  and strict objects into `src/shared/api/generated/`: `zod.ts` (operation schemas, e.g. `GetHomeViewResponse`) and
  `model/` (component types, e.g. `V03Response`). Both folders are gitignored; no HTTP client and no query hooks are
  generated (P5-01 `httpClient`, P5-04 hooks are hand-written on these types).
- `pnpm contract:check` (`tools/contract/check.mjs`): fails on a hash mismatch, on non-reproducible Orval output (two
  scratch generations must be identical) and on a `src/shared/api/generated/` that differs from a fresh generation; on
  a fresh clone it generates the folder.
- `pnpm verify` starts with `contract:generate`, so typecheck and tests work from a clean clone. Lint, Prettier and the
  architecture check ignore the generated folder; only `src/shared/api/**` may import it.
- `src/shared/api/generated-smoke.test.ts` parses the V-03 example of `docs/design/view-data-contracts/V-03-home.md`
  with `GetHomeViewResponse` (V-03 agrees between 0.1.0 and the web docs) and rejects a retired unit (`usd_per_bbl`).

## HTTP client and service container (P5-01)

No new dependency: the client is `fetch` only, tested with MSW (devDependency, P2-W04a).

- `src/shared/api/http-client.ts`: `createHttpClient({ baseUrl?, onUnauthenticated?, fetch? })` →
  `get(path, { schema, query?, signal? })`, `post / put / patch / delete(path, body, { schema, signal? })`. Relative
  `/api/v1`, `credentials: 'include'`, JSON. Every response goes through the generated Zod schema the caller passes;
  a mismatch (or a non-JSON body) throws `ApiError { code: 'INVALID_RESPONSE' }` with the Zod issues in `details`.
  Query values use the URL encoding of `routes.<key>.build()` (lists comma-joined, empty values dropped).
- `src/shared/api/errors.ts`: `ApiError` (`code`, `message`, `traceId`, `status`, `details?`; the brief L278 body plus
  the HTTP status). `traceId` comes from `X-Trace-Id` (else the body). The client raises `INVALID_RESPONSE`,
  `NETWORK_ERROR` (status 0), `UNAUTHENTICATED` (401, after calling `onUnauthenticated()`), `CSRF_INVALID` and
  `HTTP_ERROR` (non-2xx without an ApiError body); other codes are the BFF's. An aborted call rejects with the fetch
  `AbortError` unchanged.
- `src/shared/api/csrf.ts`: synchronizer token (BFF ADR-0004 §6) read from `GET /api/v1/session` (`csrfToken`) and
  kept in memory only; one shared request for concurrent callers. `POST / PUT / PATCH / DELETE` send `X-CSRF-Token`;
  a 403 `CSRF_INVALID` refreshes the token once and retries the call once, a second 403 surfaces. Contract 0.1.0 has
  no session operation yet, so `sessionCsrfSchema` reads only `csrfToken`.
- `src/app/providers/service-provider.tsx`: `ServiceContainer { http, mode }`, `mode` from `VITE_API_MODE` (`http`,
  anything else `mock`). `mock` holds a stub whose calls reject with `MOCK_NOT_IMPLEMENTED` until the mock adapters
  (P5-03). `ServiceProvider` wraps the router in `App.tsx`; `useServices()` throws outside it. The 401 handler
  navigates to `routes.login.build({}, { returnTo })`.

## Ports and HTTP adapters (P5-02)

No new dependency.

- `src/shared/api/ports/`: interfaces only (brief §4.3), one per screen or domain. View ports: `HomeViewPort`,
  `AnalysesViewPort`, `AnalysisDefinitionViewPort`, `ResultsViewPort`. Command ports: `AnalysisDraftCommands`,
  `AnalysisEditCommands`, `ReviewCommands`, `ReportCommands`, `ValueMonitorCommands`, `SavedViewCommands`,
  `SensitivityCommands`, `PresentationCommands`, `AssistantCommands`, `NotificationCommands`. `ApiPorts` groups them.
  Methods take path params first, then the body (the Orval model, e.g. `C01Request`), then `{ signal? }`; 0.1.0 has
  no query parameters, and a method gains a typed `query` when the contract adds one.
- Response types (`ports/responses.ts`, `V03Response` … `C36Response`) are `z.output` of each operation's generated Zod
  schema, i.e. exactly what the adapter returns after validation. Orval's interfaces write optional members `x?: T` and
  its Zod outputs `x?: T | undefined`, which are not assignable under `exactOptionalPropertyTypes`.
- `src/shared/api/adapters/http/`: one adapter per port on `createHttpClient`; every method passes its operation's
  generated response schema (the client's `schema` is required, so an unvalidated call does not typecheck). Path params
  go through the `apiPath` tagged template (`encodeURIComponent` per segment). `createHttpPorts(http)` builds them all.
- `pnpm contract:adapters` (`tools/contract/check-adapters.mjs`, in `pnpm verify` after `contract:generate`): every
  `operationId` of `vendor/contract/unpacked/openapi.yaml` must have exactly one adapter method, declared with a
  `@operation <operationId>` JSDoc tag; a missing, duplicated or unknown operation fails. Selftest:
  `tools/contract/check-adapters.test.mjs`.
- The service container spreads the ports next to `http` and `mode` (`useServices().results.getResultsHeaderView(id)`);
  in `mock` mode they sit on the rejecting stub until P5-03.

## Mock adapters and MSW scenarios (P5-03)

No new dependency (MSW 2.15.0 is the test devDependency of P2-W04a).

- `src/shared/api/adapters/mock/`: `createMockPorts()` implements every port (the same 48 methods, each with
  `@operation`). A call answers the operation's docs fixture (`src/test/fixtures/contracts/<ID>.response.json`, P5-FX1)
  parsed by its generated 0.1.0 response schema, so the mocks return exactly the port types and never unvalidated
  data. Fixtures load lazily (`import.meta.glob`, one chunk each). `mode: 'mock'` of the service container uses these
  ports; its raw `http` client still rejects (`MOCK_NOT_IMPLEMENTED`).
- `MOCK_GAPS`: the fixtures follow the current docs (up to CF-138) and 0.1.0 predates several decisions. The 12
  operations whose fixture fails 0.1.0 (V-04, V-09, C-09, C-10, C-11, C-15, C-16, C-24, C-25, C-28, C-30, C-32) are
  listed with the reason and serve a minimal valid payload built in code. C-30 has none: its 0.1.0 `fileName` pattern is
  `\.pptx?$/i` (the regex flag leaked into the pattern), which no file name matches, so the mock fails with
  `INVALID_RESPONSE` exactly as the HTTP client would. A test recomputes the failing set from the fixtures.
- `src/test/msw/`: `scenarioHandlers(scenario)` returns handlers for the 48 operations (plus `GET /session` for the CSRF
  token) at the paths the HTTP adapters call. Scenarios: `ok` (default), `empty` (lists emptied when the schema allows),
  `error` (500 ApiError + `X-Trace-Id`), `slow` (`SLOW_DELAY_MS` 1500), `forbidden` (403), `partial` (first
  `SectionResult` in error). Tests switch with `server.use(...scenarioHandlers('error'))`; `server.ts` is the vitest
  server (`tools/test/msw/server.ts` re-exports it). `browser.ts` (`startMockWorker`, `?msw=<scenario>`) is not wired
  into the app and needs `public/mockServiceWorker.js` (`pnpm exec msw init public`) before use.
- `pnpm contract:mocks` (`tools/contract/check-mocks.mjs`, in `pnpm verify` after `contract:adapters`): every
  `operationId` of the vendored spec has exactly one mock adapter method and one MSW handler (`@operation` tags).
  Selftest: `tools/contract/check-mocks.test.mjs`.
- The app bundle never imports `src/test/msw`, so neither the default nor the `VITE_API_MODE=mock` build contains MSW.

## Server state: TanStack Query hooks (P5-04b, ADR-0005)

| Package               | Exact version | Why                                                                             | Checked    |
| --------------------- | ------------- | ------------------------------------------------------------------------------- | ---------- |
| @tanstack/react-query | 5.103.2       | Server-state cache (ADR-0005): query hooks, mutations, invalidation, optimistic | 2026-09-25 |

- `src/app/providers/query-provider.tsx`: `createQueryClient()` + `QueryProvider`, mounted in `App.tsx` inside
  `ServiceProvider`. Defaults: `retry: shouldRetry` (a 4xx ApiError or `INVALID_RESPONSE` is never retried, other
  failures twice), `staleTime` 30 s, no refetch on window focus, mutations never retried.
- `src/shared/api/query-policy.ts`: `Register { defaultError: ApiError }` (hooks expose `error` as ApiError),
  `shouldRetry`, `STALE_TIMES` (catalog 10 min, view 30 s, frame 2 min), and the optimistic helpers `patchQueries` /
  `restoreQueries` / `deepPatch`.
- `src/shared/api/service-context.ts`: `ServiceContainer`, `ServiceContext` and `useServices` moved here from
  `app/providers` so entity hooks can read the ports (FSD: entities import shared only); `app/providers` re-exports them.
- Query hooks, one per view method, keyed by `queryKeys` (P5-04a): `entities/home` (`useHomeView`) and
  `entities/analysis` (`useAnalysesView`, `useAnalysisDefinitionView`, `useCompetitorCatalogView`,
  `useIndicatorCatalogView`, `useAnalysisValidationView`, `useResultsHeaderView`, `useCompanyCoverageView`,
  `usePeerAverageComparisonView`, `useCompanyComparisonView`, `useReportSummaryView`, `useAiFindingsView`); hooks with
  an id stay idle while it is empty.
- Mutation hooks: `entities/analysis` C-01..C-09 (draft commands invalidate the draft views, analysis commands the
  whole `queryKeys.analysis(id)` prefix, C-01 / C-03 / C-09 also the analyses list) and C-10..C-13 (`REVIEW_PREFIX`);
  `entities/value-monitor` C-16 (`VALUE_MONITOR_PREFIX`); `entities/saved-view` C-19 / C-20 (`SAVED_VIEWS_PREFIX`).
  Views of later contract versions key under those prefixes until `queryKeys` gains their factories.
- Optimistic updates with rollback: C-06 (value overrides patch the V-10 selected panel and the V-12 rows of that
  company), C-07 (any cached `{ indicatorId, weight }` row — none in 0.1.0 yet), C-16 (any cached `{ kviId, meta }`
  object). On error the snapshot is restored; on settle the prefix is invalidated.
- `src/shared/lib/autosave`: `useDebouncedAutosave(save, { delayMs: 500, onError })` → `schedule` / `flush` /
  `cancel`; one save per burst with the last value, a pending value is saved on unmount, failures go to `onError`.

## Architecture rules (FSD)

`tools/architecture/fsd-rules.js` holds the rules once; `eslint.config.js` applies them to `src/**` and the valid
fixtures, `tools/architecture/eslint.architecture.config.js` applies them without type information.

- Layers `app → pages → widgets → features → entities → shared`: a layer imports only lower layers; slices of the same
  layer never import each other; another slice is imported only through its `index.ts` / `index.tsx`; `app` and
  `shared` have no slices (eslint-plugin-boundaries `boundaries/dependencies`, default disallow).
- `echarts` / `echarts/*` / `zrender` imports only inside `src/shared/ui/charts/` (`no-restricted-imports`, D3).
- `src/shared/api/generated/` (Orval output) imported only inside `src/shared/api/` (`no-restricted-imports` regex,
  ADR-0004). The two import fences share one rule, so `fsd-rules.js` emits one block outside both homes and one block
  per home carrying the other fence.
- Route paths only in `src/shared/config/routes.ts` (`no-restricted-syntax`, CF-142): outside it, string or template literals
  starting with `/` in JSX `to` / `href` (also inside `{…}`), in `navigate` / `redirect` / `redirectDocument` / `replace`
  calls (also `router.navigate(…)`), and any literal `path` of a route object are rejected. Code uses
  `routes.<key>.build(params, query)` and `routes.<key>.path`.
- `pnpm check:architecture` lints `src` and `tools/arch-fixtures/valid` with the architecture config (must pass).
- `pnpm check:architecture:selftest` (`tools/architecture/selftest.mjs`) lints `tools/arch-fixtures/planted` through the
  ESLint API and passes only if each of the ten planted files is rejected by exactly its expected rule (shared →
  features, entities → features, feature → feature, deep import past `index.ts`, echarts outside charts, generated
  contract outside `shared/api`, and four route
  cases: JSX string, JSX template literal, `redirect('/…')`, route object `path`) and the support files stay clean. Nothing in the tracked tree is modified.

## Router (P2-W06)

- `src/shared/config/routes.ts` (moved from `src/app/router/` by CF-142, so every layer can import it from
  `@/shared/config`): the typed route table (21 routes of `docs/design/navigation-map.md` §1 + the `*` 404
  pattern). Each entry has `scr`, `path`, the URL-persisted `query` keys and `build(params, query)`; params are typed from
  the pattern (`:analysisId` → `{ analysisId: string }`) and URI-encoded, empty query values are dropped, lists are
  comma-joined.
- `src/app/router/router.tsx`: `createBrowserRouter` over `createAppRoutes(getSession)`. Login, access gate and admin are
  top-level routes; every other page is a child of the pathless layout route `app-shell` (SCR-04), whose component draws
  the shell placeholder `src/widgets/app-shell/` (a page layout is a widget in FSD: `app` composes it, pages never import
  it). Each page is a lazy module `src/pages/<page>/index.ts` with its own chunk and `errorElement`; `/` redirects to
  `/inicio`; `*` renders the 404 page.
- Guards: every page route's loader applies `src/app/router/access.ts` (the §3 role × screen matrix and the §2
  redirects: unauthenticated → `/login?returnTo=`, role denied → `/403`, `/acceso` without `hasAdminAccess` →
  `/inicio`, `/admin` without it → `/403`; OQ-40 / OQ-42 defaults). The session is the typed mock of
  `src/entities/session` (`VITE_MOCK_ROLE`, `VITE_MOCK_ADMIN` in development) until P5-01 wires `GET /api/v1/session`.
- Tests: `src/app/router/router.test.tsx` parses navigation-map §1 and resolves every route through a memory router to
  its page placeholder (plus guard cases); `routes.test.ts` round-trips `build()` through `matchPath`.

## Client state and URL state (P5-05)

- `src/shared/lib/url/`: `useTypedSearchParams(schema)` (`[value, set(patch, { replace })]`) over React Router's
  `useSearchParams`, plus the pure `parseSearchParams` / `patchSearchParams` / `encodeQueryValue` it is built on.
  `routes.ts` imports `encodeQueryValue`, so `build()` and the hook serialise the same way (lists comma-joined, empty
  values dropped). Invalid values fall back to their defaults and are removed on the next write; unrelated params are
  kept.
- Stores (Zustand, ADR-0005): `useLayoutStore` (`src/shared/model/`, persisted `sidebarCollapsed`),
  `useAssistantStore` (`src/features/assistant/`, panel + proactive tip seen per screen, session only),
  `useComparisonUiStore` (`src/entities/comparison/`, expanded rows, ephemeral). Actions are imperative, selectors are
  exported, DevTools only in development (`storeDevtools`, `src/shared/lib/store/`).

## Overlay composites (P5-16)

| Package                 | Exact version | Why                                                                         | Checked    |
| ----------------------- | ------------- | --------------------------------------------------------------------------- | ---------- |
| @radix-ui/react-dialog  | 1.1.23        | `Modal`: focus trap, Esc / outside dismiss, `aria-labelledby` / `describedby` | 2026-09-25 |
| @radix-ui/react-popover | 1.1.23        | `Popover`: non-modal anchored panel, Esc / outside dismiss, focus return    | 2026-09-25 |

- `src/shared/ui/composites/modal/`: `Modal` (title and description required; widths 420 · 440 · 480 · 520 · 560 ·
  640; `closeOnEscape`, `closeOnOverlayClick`, `initialFocusRef`, `footer`). Scrim `overlay.scrim`, card
  `radius.modal` + `shadow.modal`, stacked at `z.modal` via `z-(--z-modal)`. A controlled modal without `trigger`
  returns focus to the element that opened it.
- `src/shared/ui/composites/toast/`: `ToastProvider` + `useToast()` (`show`, `dismiss`, `autosave`, `success`, `error`,
  `undo`) over a framework-free queue (`toast-store.ts`). Variants and defaults follow the prototype: autosave
  bottom-right 1.8 s (one reused toast), undo bottom-center 5 s with "Deshacer" (`onUndo`; timeout, dismissal or
  eviction fire `onExpire` instead), success bottom-right 2.2 s, error top-center until dismissed. `durationMs` per
  toast; timers pause on hover and focus; `maxVisible` per position (default 3, oldest dropped). Stacks sit at
  `z.toast`; bottom stacks are `role="status"` / `aria-live="polite"`, the error stack `role="alert"` (assertive).
- `src/shared/ui/composites/section-card/` (P5-12): `SectionCard` (flat bordered card, `<section>` named by its title, "(i)"
  `InfoToggle` + `InlineInfoPanel` region, Escape closes and refocuses the toggle), `Eyebrow`, and `InfoGroup` (one open
  panel per group, CF-61); no new dependency.
- `src/shared/ui/composites/comment-thread/` (P5-22): presentational `CommentThread` / `CommentItem` / `CommentComposer` for
  V-26 threads; permission flags hide controls, relative times via `Intl.RelativeTimeFormat` (es-CO); no new dependency.
- `src/shared/ui/composites/popover/`: `Popover` (required `label` names the panel) and `PopoverGroup`, a single-open
  group for the inline info popovers (CF-61). There is no popover z token; the panel uses `z.upload` so it floats above
  an open modal and below toasts.
- Copy: `common.toast.undo` "Deshacer" (quoted in SCR-08) and the accessible-only `common.a11y.*` labels
  (`closeDialog`, `dismissToast`, `toastRegion`, [inference] in `docs/architecture/i18n.md`).
  Messages are passed in by callers, already translated.

## Tabs, stepper and accordion (P5-14)

| Package                   | Exact version | Why                                                                          | Checked    |
| ------------------------- | ------------- | ---------------------------------------------------------------------------- | ---------- |
| @radix-ui/react-accordion | 1.2.20        | `Accordion`: `type="multiple"`, header buttons with `aria-expanded`, arrows  | 2026-09-25 |

- `src/shared/ui/composites/tabs/`: `SegmentedTabs` (brand · dark · dimension · buttons · withDot; sm · md) and
  `PillTabs` (solid · subtle) share `TabBar`, a WAI-ARIA tab list with its own roving tabindex (`rovingTarget`:
  ArrowLeft / ArrowRight wrap, Home / End, disabled tabs skipped), automatic or manual activation, controlled or
  uncontrolled. No Radix Tabs: most bars filter or navigate instead of switching panels; with `idPrefix` the tabs get
  `aria-controls` and `TabPanel` renders the panels.
- `src/shared/ui/composites/stepper/`: `Stepper`, `<ol>` named "Pasos", `aria-current="step"`, done / current /
  pending / invalid; with `onStepClick` enabled steps are native buttons.
- `src/shared/ui/composites/accordion/`: `Accordion` (Radix, `headingLevel`, `defaultOpen` or controlled `value`).
- Copy: accessible-only `common.a11y.steps`, `stepDone`, `stepInvalid` and `analysisTabs` ([inference]).

## Input primitives (P5-15)

| Package                | Exact version | Why                                                                      | Checked    |
| ---------------------- | ------------- | ------------------------------------------------------------------------ | ---------- |
| @radix-ui/react-switch | 1.3.7         | `Switch`: `role="switch"` + `aria-checked`, Space / Enter toggle         | 2026-09-25 |
| @radix-ui/react-slider | 1.4.7         | `RangeSlider`: keyboard (arrows, Page, Home / End), `aria-value*`, thumb | 2026-09-25 |

- `src/shared/ui/primitives/inputs/`: `TextField`, `SearchInput`, `DateInput`, `Textarea`, `Select`, `NumberInput`,
  `Switch`, `RangeSlider`. Each takes a required `label` bound to the control (`<label htmlFor>`, or
  `aria-labelledby` for the slider thumb; `hideLabel` keeps it for screen readers only), `description` and `error`
  joined in `aria-describedby`, `error` also sets `aria-invalid` and the `status.danger.base` border, `disabled`,
  `testId` (wrapper `<testId>-field`) and a forwarded ref.
- `Select` is the native `<select>` (component catalog: native for simple filters); `allLabel` adds the "todos" first
  option. `DateInput` is `type="date"` with ISO values. `SearchInput` is `type="search"` with a clear button
  (`common.a11y.clearSearch`); its leading `icon` slot has no default because the prototype search field has no icon
  and the P5-10 set has none.
- `NumberInput` is `type="text"` + `inputMode="decimal"` (`type="number"` rejects the es-CO comma). It parses with
  `parseEsCoNumber` (`,` decimal, `.` thousands: "7,4" → 7.4, "4.102" → 4102), emits `number | null` (blank → `null`,
  never 0, CF-37), keeps invalid or out-of-range text with `aria-invalid` without emitting it, steps with Arrow Up /
  Down, and renders mono (`font-mono text-mono-input`) with an optional suffix ("%"). `variant="estimate"` uses
  `status.warning.bg` / `status.warning.text` with a dashed `status.warning.base` border (SCR-08 "Estimado").
- `Switch` is the 36×20 SCR-16 toggle (`brand.primary` when on); `RangeSlider` themes the thumb and range with
  `brand.primary` on `chart.track` (OQ-11) and takes `formatValue` for the shown value and `aria-valuetext`.
- Widths off the spacing tokens use Tailwind's 4px multiplier (`w-9` = 36px); a named spacing token wins over the
  multiplier (`w-18` is the 18px token), so the md NumberInput is `w-72`, the `space.72` token (P5-TK4).

## Data table (P5-17)

| Package               | Exact version | Why                                                                          | Checked    |
| --------------------- | ------------- | ---------------------------------------------------------------------------- | ---------- |
| @tanstack/react-table | 9.2.4         | Headless `DataTable` state: sorting, row expanding, stable row ids (`getRowId`) | 2026-09-25 |

- `src/shared/ui/table/`: `DataTable<T>` (catalogue "DataTable"; SCR-06 analyses, SCR-08 report summary, SCR-11 KVI
  table). Columns are TanStack v9 column definitions over `dataTableFeatures` (`rowSortingFeature`,
  `rowExpandingFeature`, sorted row model, stock sort functions) built with `createDataTableColumnHelper<T>()`;
  `columnDef.meta` is `DataTableColumnMeta` (`width` grid track, `align`, `rowHeader`).
- Semantics: a real `<table>` with `<caption>` (visually hidden unless `captionVisible`), `<th scope="col">`, and
  `<th scope="row">` for `meta.rowHeader` columns. Each `<tr>` is a CSS grid on the tracks from `meta.width`, so the
  header, rows, empty row and full-width detail rows (`col-span-full`) share one template; the table is
  `min-width: min-content` so rows always paint the whole track sum.
- Sorting is opt-in per column (`enableSorting: true`), ascending first for text and numbers alike
  (`sortDescFirst: false`); the header is a button and the `<th>` carries `aria-sort` none → ascending → descending
  → none. `sorting` + `onSortingChange` control it, `defaultSorting` seeds the uncontrolled state.
- `renderExpanded` adds a leading toggle column: buttons with `aria-expanded` + `aria-controls` pointing at a detail row
  that is always rendered (`hidden` while closed, content mounted only when open); `singleExpand` keeps one open
  (SCR-06). Expanded state is keyed by `getRowId`, so it follows the row across sorting and data reorders.
- The table sits in a `role="region"` scroll container with `tabIndex={0}`, named by the caption (axe
  `scrollable-region-focusable`); `minWidth` (SCR-11: 1080px), `maxHeight` + `stickyHeader`, `density` `sm | md`,
  `highlightedRowId`, `emptyState` (default `common.section.empty`), `testId` (`dataTableTestIds`).
- Header text is the eyebrow role in `text.secondary`: the prototype's `text.eyebrow` on `surface.page` is 3.2:1,
  below WCAG AA for 11px text.
- Copy: accessible-only `common.a11y.rowDetails` ("Detalle de {{label}}"), `rowDetailsColumn` and `rowActions`
  ([inference]).

## Forms: react-hook-form (P5-36)

| Package             | Exact version | Why                                                                          | Checked    |
| ------------------- | ------------- | ---------------------------------------------------------------------------- | ---------- |
| react-hook-form     | 7.88.0        | Wizard step forms (SCR-07 step 1): field state, `Controller` over the inputs | 2026-09-25 |
| @hookform/resolvers | 5.9.1         | `zodResolver`: the step's Zod rules (zod 4) as the form resolver             | 2026-09-25 |

- `src/features/analysis-draft-general/`: step 1 "Información general" on `useForm` + `zodResolver`, every input a
  `Controller` (the P5-15 inputs are controlled). Edits go through one handler that updates the field and queues it:
  the fields changed in a burst are merged into one C-02 `fields` patch (keys = the V-05 draft paths, e.g.
  `currentPeriod.quarter` [inference]) and saved 500 ms after the last edit with `useDebouncedAutosave` (P5-04b).
  C-02 `validationState.errors[]` ({ field, code }, CF-100) become `setError(field, { type: 'server' })`.
- No `watch()` subscription: the React Compiler skips memoizing components that use it (`react-hooks/incompatible-library`).

## Prototype render harness (P1-03a, vendored scripts since P2-W01b)

`tools/prototype-render/render.mjs` serves these files offline in place of the prototype's CDN URLs.

| Package                          | Exact version | Why                                                              | Checked |
| -------------------------------- | ------------- | ---------------------------------------------------------------- | ------- |
| playwright                       | 1.63.0        | Headless Chromium that renders the reference screenshots         | P1-03a  |
| @fontsource-variable/roboto      | 5.3.0         | Offline replacement for the prototype's Google Fonts Roboto (now a runtime dependency, shared with the app) | P1-03a  |
| @fontsource-variable/roboto-mono | 5.3.0         | Offline replacement for the prototype's Google Fonts Roboto Mono (runtime dependency, shared)               | P1-03a  |

**Vendored prototype scripts (P2-W01b).** The prototype loads React 18.3.1, ReactDOM 18.3.1 and @babel/standalone
7.29.0 UMD builds from unpkg with SRI (`support.js` L1143–1148). The app needs `react` / `react-dom` 19 under the same
package names, and React 19 ships no UMD build, so the three files are byte copies under
`tools/prototype-render/vendor/` (`react.production.min.js`, `react-dom.production.min.js`, `babel.min.js`, MIT
licensed, headers kept) and are no longer devDependencies. `tools/prototype-render/vendor/manifest.json` records url, source package,
version and sha384 of each file. On every run `render.mjs` re-hashes each file and fails (exit 1) when the file does not
match its recorded sha384 or the recorded value differs from the SRI pinned in `support.js`;
`PROTOTYPE_VENDOR_MANIFEST` points it at another manifest (used by the mutation check). `.gitattributes` marks the
files `-text` and ESLint / Prettier ignore the folder, so they stay byte-exact.

## TypeScript 7 and tools that need the compiler API

typescript@7 is the native (Go) compiler and ships no classic JS compiler API, while typescript-eslint 8.70.1 peers
`typescript >=4.8.4 <6.1.0` and loads `typescript` as a library. `.pnpmfile.cjs` (copied from
`eco-comparator-bff/.pnpmfile.cjs`) therefore gives only the tooling packages (`@typescript-eslint/*`,
`typescript-eslint`, `ts-api-utils`, `@vitest/eslint-plugin`, and `eslint-plugin-n` / `dependency-cruiser` should they
be added) their own `typescript@6.0.3` dependency instead of the root peer; `pnpm typecheck` keeps running tsc 7.0.2.
pnpm `overrides` and `packageExtensions` do not change peer resolution, so they are not an alternative. orval and
zod-to-openapi (later tasks) may need the same treatment: add them to the hook's pattern if they peer `typescript`.
Remove the hook once typescript-eslint supports typescript@7.

## Supply-chain policy

pnpm 11 enforces a minimum release age. vite 8.3.1 (published 2026-09-24T12:26Z) was younger than that window on 2026-09-25, so `pnpm add` recorded it
in `pnpm-workspace.yaml` `minimumReleaseAgeExclude`. Remove that entry once the version is older than the window (or
when vite is bumped).

## TypeScript configuration

`tsconfig.base.json` holds the brief §2.4 flags (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`,
`noImplicitOverride`) plus Bundler module resolution and `verbatimModuleSyntax`. `tsconfig.json` is a solution file that
references two projects:

- `tsconfig.app.json` — browser code: `src/**` and `tools/arch-fixtures/**` (planted fixtures excluded, they may import
  missing packages), DOM libs, `jsx: react-jsx`, `types: ["vite/client"]`, path alias `@/*` → `src/*` (mirrors the Vite
  `resolve.alias`; no `baseUrl`, which TypeScript 7 removed).
- `tsconfig.node.json` — `vite.config.ts` with Node types only, so browser code cannot use Node globals.

`pnpm typecheck` runs `tsc --noEmit` on both projects (no emit, so no `tsc -b`); `pnpm build` is typecheck + `vite
build` (≈10 s), and `pnpm verify` ends with `vite build`.
