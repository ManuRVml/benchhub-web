# Testing

This document describes the testing pyramid and verification workflow.

## Test Pyramid

```text
E2E (Playwright) ────────┐
                         │
Integration/Vitest ──────┼─────── MSW mocks, createQueryHarness
                         │
Unit/Vitest ────────────┘
```

## Vitest Unit and Integration Tests

### Setup

Runs with `pnpm test` (`vitest run --passWithNoTests`).

### Mocking

- **MSW (Mock Service Worker)** intercepts network requests at the browser level
- **createQueryHarness** (from `@/shared/api`) creates TanStack Query clients pre-wired with mock ports

### Mutation Discipline

Mutations (writes/commands) are tested through:

1. Port method in `src/shared/api/ports/commands.ts`
2. HTTP adapter in `src/shared/api/adapters/http/commands.ts`
3. Mock adapter in `src/shared/api/adapters/mock/operations.ts`
4. MSW handler in `src/test/msw/handlers.ts`
5. Adapter tests in `src/shared/api/adapters/http/http-adapters.test.ts`

Never mock at the network level for component tests — mock at the port layer.

## Playwright E2E Tests

### Configuration

Two configuration modes:

| Mode | Config | Port | URL |
| --- | --- | --- | --- |
| **Mock mode** | `playwright.config.ts` | `E2E_PORT` (default 5173) | `http://localhost:E2E_PORT` |
| **Stack mode** | `playwright.stack.config.ts` | `STACK_URL` (from compose) | `http://127.0.0.1:8088` |

### Mock Mode

```bash
pnpm test:e2e  # Uses playwright.config.ts
```

- Runs against the Vite dev server
- Use `E2E_PORT=5199 pnpm test:e2e` for isolated worktree testing (prevents `reuseExistingServer` from testing wrong port)
- Mocks the BFF via MSW handlers defined with `@operation` tags
- E2E page objects in `e2e/pages/` use only `data-testid` selectors (no CSS, no fixed sleeps)

### Stack Mode

```bash
pnpm test:e2e:stack  # Uses playwright.stack.config.ts
```

- Runs against the full stack (web + BFF mock containers)
- Uses `STACK_URL=http://127.0.0.1:8088` (from compose.yaml)
- Real HTTP calls to the BFF mock container

### Machine Rule (maxWorkers=1 / workers=1)

Both configs set `maxWorkers: 1` (mock mode) or `workers: 1` (stack mode) to ensure:

- Tests run sequentially, not in parallel
- No port conflicts or state leakage between specs
- Deterministic test ordering

### Accessibility Scans

Every E2E run includes axe-core accessibility checks via `e2e/pages/accessibility.ts`:

```typescript
import { settledPage } from '@/e2e/pages/accessibility';

test('page is accessible', async ({ page }) => {
  const accessibilityScanResults = await settledPage(page, { timeout: 30000 });
  await expect(accessibilityScanResults).toHaveNoViolations();
});
```

## What pnpm verify Runs

The verification script runs everything before deliver:

```bash
pnpm verify
```

Expands to:

```bash
pnpm contract:generate && \
pnpm contract:adapters && \
pnpm contract:mocks && \
pnpm contract:fixtures --check && \
pnpm i18n:inferred && \
pnpm tokens:check && \
pnpm lint && \
pnpm typecheck && \
pnpm test && \
vite build
```

### Steps

| Step | Command | Purpose |
| --- | --- | --- |
| 1 | `pnpm contract:generate` | Regenerate types/Zod from vendored contract |
| 2 | `pnpm contract:adapters` | Every contract operation has exactly one HTTP adapter method |
| 3 | `pnpm contract:mocks` | Every operation has one mock adapter + MSW handler |
| 4 | `pnpm contract:fixtures --check` | Contract examples match current schema |
| 5 | `pnpm i18n:inferred` | All inferred keys have Spanish copy |
| 6 | `pnpm tokens:check` | Generated tokens match design spec |
| 7 | `pnpm lint` | ESLint max-warnings 0 |
| 8 | `pnpm typecheck` | TypeScript strict mode |
| 9 | `pnpm test` | Vitest unit/component tests |
| 10 | `vite build` | Production build succeeds |

## Gate:1

Phase 1 documentation gate (`pnpm gate:1`) validates:

- Every ADR in `docs/architecture/adr/` follows the template
- Every design doc in `docs/design/` is consistent with its index
- All backticked paths in docs exist (unless marked `(planned)`)
- Mermaid blocks are non-empty and start with known keywords

Run: `node tools/check-gate1.mjs`
