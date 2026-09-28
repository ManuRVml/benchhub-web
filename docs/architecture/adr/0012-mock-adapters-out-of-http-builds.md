# ADR-0012: Mock adapters out of http builds — separate mock entry, compile-time branch, bundle check

## Status

Accepted.

## Context

The SPA runs in two API modes (`VITE_API_MODE`): `mock` (development, unit tests with MSW, Playwright mock mode) and
`http` (talks to the BFF, which serves its own mock data while the backend is mock-only). The owner requires that an
http build ships **no mock data**: the browser gets its data only from the BFF.

Before this decision an http build still emitted 97 `*.response-*.js` fixture chunks plus `mockServiceWorker.js`,
because `src/shared/api/index.ts` re-exported `./adapters/mock`, `src/shared/api/fetch-pending-view.ts` imported the
fixture loader statically, and the service container chose mock or http only at runtime.

## Decision

1. The mock adapters are reachable only through a separate entry, `@/shared/api/mock` (`src/shared/api/mock.ts`).
   `@/shared/api` no longer re-exports them. The mock bootstrap, tests, stories and the MSW handlers import the mock
   entry.
2. `createServiceContainer` (`src/app/providers/service-provider.tsx`) is asynchronous and imports `@/shared/api/mock`
   only inside an `import.meta.env.VITE_API_MODE !== 'http'` branch. Vite replaces the variable at build time, so Rollup
   drops the branch and never emits the mock chunks in http builds (an unset variable keeps today's mock default).
3. `fetch-pending-view.ts` loads contract fixtures by dynamic import only in mock mode.
4. A small Vite plugin (`vite.config.ts`) removes `mockServiceWorker.js` from http builds.
5. `pnpm check:http-bundle` (`tools/check-http-bundle.mjs`) builds with `VITE_API_MODE=http` and fails if an emitted
   file name matches `\.response-|\.request-|mock` or a chunk contains a fixture-only id. It runs inside `pnpm verify`.

## Consequences

- New code imports mocks from `@/shared/api/mock`, never from `@/shared/api`; importing them statically from app code
  fails `check:http-bundle` (proven by mutation: 100 problems reported).
- `createServiceContainer` is async; the app and its tests await it.
- Mock mode is unchanged for development, unit tests, Storybook and Playwright mock runs; `vite build` in mock mode still
  emits the fixtures.
