# Adding a screen — from the prototype to the E2E test

How a screen (SCR-xx) goes from the V2 prototype to a tested page (`prompt_Start_Eco.md` §7, L544). Follow the steps in
order; each one names the file it produces and the check that proves it. Paths marked **(planned)** do not exist yet in
this repository; the task that creates them is named next to them. Where a file goes and why is decided with the
"Where does this file go?" tree in `AGENTS.md`; the layer rules are in `docs/architecture/c4-containers.md`.

## 1. Inventory the screen

- Write or update the screen file in `docs/design/screen-inventory/` (`SCR-xx-<name>.md`) with the 14 template fields
  of the brief: source files, route, layout, tabs, sections, components (`Cmp:` tags), charts, tables, filters and
  controls, states, interactions, data fields, role visibility, open questions.
- Every quoted Spanish string cites its prototype line (`HTML Lnnn`) or carries an `[inference]` tag.
- Map every new `Cmp:` tag to a canonical component in `docs/design/component-catalog.md`; overlays go to
  `docs/design/overlays.md`; decisions become rows in `docs/design/conflicts.md` and `docs/design/open-questions.md`.
- Check: `node tools/build-design-index.mjs --check`, `node tools/check-component-catalog.mjs`,
  `node tools/check-open-questions.mjs`.

## 2. Contract the data

- One view contract per view or independently loaded widget in `docs/design/view-data-contracts/` (`V-nn-<name>.md`):
  endpoint, params and URL defaults, minimal JSON, raw vs derived, sections (`SectionResult`), permissions,
  `budgetBytes`, commands used. Commands (writes) get their own `C-nn-<name>.md` file.
- Seed values follow the screen-parity policy of `docs/design/mock-data-catalog.md`.
- Mirror: web's contract docs follow the BFF's; `pnpm contract:docs-sync --bff <bff docs/requirements/view-data-contracts>`
  copies them (origin header stripped) and `pnpm contract:docs-check --bff <dir>` fails on drift (no-op without a BFF path,
  so CI is unaffected); run `pnpm contract:fixtures` afterwards.
- Check: `node tools/check-view-contracts.mjs --dir docs/design/view-data-contracts`,
  `node tools/check-command-contracts.mjs`. The BFF implements the contract first; the web consumes the published
  version (ADR `docs/architecture/adr/0004-contract-consumption.md`).

### Wire the typed port (ADR-0004)

Once the BFF has published the operation, consumers read or write it only through a typed port from `@/shared/api` —
never a hand-written mirror (a page/widget-local `services.http` call with its own Zod schema) and never
`pending-views.ts` (removed; if a view or command has no port yet, the instruction is **add the port first**, not
work around the gap). The order of work is a real gate, not a suggestion — each step's own check catches the previous
step being skipped:

1. `pnpm -s contract:generate` — regenerates the gitignored `src/shared/api/generated/` (types + Zod) from the vendored
   `@eco/bff-contract`. Run this first, and again after merging or rebasing onto anything that touched the contract.
2. Add the response type to `src/shared/api/ports/responses.ts` (`VxxResponse` / `CxxResponse`, e.g.
   `z.output<typeof GetXxxViewResponse>`).
3. Add the method to the port interface: `src/shared/api/ports/views.ts` for reads, `ports/commands.ts` for writes.
   Every path or query parameter the operation takes gets its own `XxxViewOptions extends CallOptions` in
   `ports/call-options.ts` — options are never inlined ad hoc on the method signature.
4. Implement it in the HTTP adapter (`src/shared/api/adapters/http/views.ts` or `commands.ts`), tagged
   `/** @operation getXxxView */` so `pnpm contract:adapters` can match it to the contract.
5. Implement the mock: an entry in `src/shared/api/adapters/mock/operations.ts` (`MOCK_OPERATIONS`), the MSW handler in
   `src/test/msw/handlers.ts`, and its call added to `handlers.test.ts`'s `calls` map.
6. In `src/shared/api/adapters/http/http-adapters.test.ts`, add the operation's row to the `OPERATIONS` array (every
   contract operation appears exactly once) and write one test that passes every option the port accepts and asserts
   the exact pathname, query string and body the adapter sends.
7. Remove the operation id from `tools/contract/known-unadapted-operations.mjs`. `pnpm contract:adapters` and
   `pnpm contract:mocks` fail the build if an operation has a real adapter or mock and is still listed there.
8. Hook it into the page through `useServices().<port>.<method>(options)` in `src/entities/<x>/api/` — a page, widget
   or feature never imports `http`/`services.http` or the generated contract types directly (ADR-0004; enforced by
   `pnpm check:architecture`'s `no-restricted-imports` rule).

**Pitfalls we hit, so the next screen doesn't repeat them:**

- *Guessing the contract number.* The `V-xx` / `C-xx` id comes from the `Contract V-xx: docs/requirements/…` comment
  directly above the schema in `generated/zod.ts` — never guessed from the screen inventory or a similarly named view.
- *A stale generated contract.* `src/shared/api/generated/` is gitignored and only ever correct right after
  `contract:generate` runs; skipping it after a merge produced false "missing view" reports, and its absence in a
  fresh worktree produces `Cannot find module '../../generated/zod'` typecheck failures that look like real
  regressions in the merged code but aren't.
- *Patching the fixtures instead of asking the contract.* Never edit `src/test/fixtures/contracts/` or
  `src/shared/api/adapters/mock/mock-gaps.ts` to make a test pass — a fixture that doesn't parse against the schema
  is a question for the BFF's contract, not something to quietly work around in the web repo.
- *Sending display labels instead of contract identifiers.* A KVI category chip shows "Financiero" but its URL/query
  value is the V-30 slug `financiero`, not the label; a comment's `entityType` is the contract's enum value
  (`value_monitor`), not the screen's hyphenated slug (`value-monitor`). Sending the label instead of the identifier
  passes a shallow render test and fails against the real BFF.
- *A zero-argument call proves nothing.* An adapter test that calls a method with no options and only checks the
  method and base pathname does not prove the port forwards its params — assert the exact URL from a call that passes
  every option the method accepts.
- *A raw client call is blank in mock mode.* A hook that calls `services.http` directly (a hand-written mirror) never
  reaches the mock adapter, so in mock mode (the dev server and every e2e run) it rejects with
  `MOCK_NOT_IMPLEMENTED` and the section stays in its error state — Iris's P5-71 e2e found Visualización and Monitor
  de Valor blank for exactly this reason. Only port calls are answered by the mock adapter.

## 3. Add the route

- Add the route to `src/shared/config/routes.ts`, the only file that spells paths; everything else (any layer) imports
  `routes` from `@/shared/config` and calls `routes.<key>.build(params, query)`. Mirror the row of `docs/design/navigation-map.md` (params, query params, guard,
  breadcrumb); guards live in `src/app/router/guards.ts`.
- Check: `node tools/check-navigation-map.mjs`, `pnpm test` (`src/shared/config/routes.test.ts` and `src/app/router/router.test.tsx`).

## 4. Build the page

- Create the page slice in `src/pages/` (`src/pages/<page>/`, public API `index.ts`, component `<Name>Page.tsx`). A page
  only composes widgets and features and reads URL state; it holds no business logic.
- Render every state of the inventory: loading, empty, error, forbidden and partial (one `SectionResult` per section).
- Check: `pnpm lint`, `pnpm check:architecture`.

## 5. Add widgets, features and entities

- Screen blocks (cards, rails, chart sections) go to `src/widgets/` (`src/widgets/<widget>/`); user actions that send a
  command (C-xx) go to `src/features/` **(planned)** (`src/features/<feature>/`); business entities (models, query hooks,
  entity UI) go to `src/entities/`.
- Reuse the design system of `src/shared/ui/` (primitives, composites, charts per ADR-0003) and the canonical names of
  `docs/design/component-catalog.md`; tokens only, no hex values.
- Data comes through the typed ports and adapters in `src/shared/api/` (§2 "Wire the typed port"), Zod-validated end
  to end. If the view or command you need has no port yet, add the port first — do not write a local mirror schema
  to unblock the widget.

## 6. Copy and i18n keys

- Visible copy is never hard-coded: add es-CO keys to the page's namespace in `src/shared/i18n/locales/es-CO/`
  (`<page>.json`), verbatim from the inventory. Rules in `docs/architecture/i18n.md`.
- Numbers, dates and units are formatted es-CO by the shared formatters; raw values come from the BFF.

## 7. Test ids

- Give every interactive element and every asserted value a `data-testid` built with `testId()` from
  `src/shared/config/test-ids.ts` (hierarchical kebab-case `{page|widget}-{component}-{element}[-{qualifier}]`); keep
  the ids of a slice in its own `test-ids.ts` and share them between the component and its tests.

## 8. Stories

- One story per variant and state next to each new shared component or widget (`*.stories.tsx`); Storybook
  configuration in `.storybook/`.
- A stories file is a CSF module: `export default meta` plus named stories. Never put vitest code in it —
  `build-storybook` refuses to index a file without a default export (`src/test/stories.smoke.test.tsx` checks this).
- `.storybook/preview.ts` has no global decorators and no MSW addon, and the smoke test renders every story bare. A
  component that calls `useServices()` or a query hook needs its own decorator: `ServiceContext.Provider` with
  `{ ...createMockPorts(), http: createHttpClient(), mode: 'mock' }` plus a `QueryClientProvider` (both from
  `@/shared/api` and `@tanstack/react-query`); a component with `<Link>` or `useNavigate` needs a `MemoryRouter`.
  Pages and widgets must not import `@/app/providers` (FSD boundaries).

## 9. Unit and component tests

- Vitest + Testing Library next to the code (`*.test.tsx`): one test per state (loading, empty, error, forbidden,
  partial, data), permission flags hiding actions, and URL-state round trips. Mock the ports, never the network.
- If §2's typed-port workflow added a new operation, its own tests live with the port layer, not here:
  `http-adapters.test.ts` (adapter row + options test), `mock-adapters.test.ts` and `handlers.test.ts` (mock + MSW
  wiring, including their operation-count assertions).
- Check: `pnpm test`.

## 10. End-to-end spec

- A Playwright spec in `e2e/specs/` **(planned, P2-W04)** with a page object in `e2e/pages/` **(planned, P5-70)**,
  running in mock mode; selectors only by `data-testid`, no fixed sleeps.
- Run with a unique `E2E_PORT` per worktree (e.g. `E2E_PORT=5199 pnpm test:e2e`): `playwright.config.ts` defaults to
  5173, and `reuseExistingServer` would otherwise silently test another worktree's already-running dev server on that
  same port instead of yours.
- Axe scans (`e2e/pages/accessibility.ts`) must come back with zero serious/critical violations
  and no rule exclusions; a failing scan means fixing the token, not excluding the rule (CF-143, CF-144).
- Check: `pnpm test:e2e` **(planned, P2-W04)**.

## 11. Visual baseline

- Compare the page with the prototype render of the same screen in `docs/design/screenshots/prototype/` (listed in
  `docs/design/screenshots/prototype/manifest.json`, states in `tools/prototype-render/states.json`) at the widths of
  ADR `docs/architecture/adr/0007-visual-regression.md`, within its tolerance and masks.
- If a baseline must change, re-render with `pnpm prototype:render` and prove it with `pnpm prototype:check`.

## 12. Verify and deliver

- `pnpm verify` (tokens check, lint, typecheck, unit tests, build) and `pnpm gate:1` (design documents stay consistent)
  must pass on a clean committed tree; commit with Conventional Commits and attach the commands with their exit codes.
- If §2's typed-port workflow touched anything under `src/shared/api/`, also run `pnpm contract:adapters`,
  `pnpm contract:mocks` and `pnpm contract:fixtures --check` — they catch a missing adapter/mock method, a leftover
  `known-unadapted-operations.mjs` entry, and a fixture that no longer matches its schema, none of which `pnpm verify`
  checks on its own.
- `pnpm check:architecture` runs a separate ESLint config (`tools/architecture/eslint.architecture.config.js`) that does
  not register `react-hooks` and reports unused disable directives as errors. A named
  `eslint-disable-next-line react-hooks/exhaustive-deps` fails it ("Definition for rule not found"): use a bare
  `eslint-disable-next-line` and exempt that file there (see the `PresentationDownloadModal.tsx` entry).
