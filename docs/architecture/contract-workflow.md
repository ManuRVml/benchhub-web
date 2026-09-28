# Contract Workflow

This document describes the vendored contract, typed ports and adapters, and the workflow for working with the BFF contract.

## Vendored Contract

The `@eco/bff-contract` package is vendored and pinned:

- **Tarball location**: `vendor/contract/@eco/bff-contract-<version>.tgz`
- **Lock file**: `contract.lock.json` (SHA-256 verification)
- **Unpacked spec**: `vendor/contract/unpacked/openapi.yaml`

### Verification

```bash
pnpm contract:check  # Verifies tarball hash matches lock.json
```

The check runs:

1. SHA-256 of the tarball matches `contract.lock.json` (fails on any byte change)
2. Orval output is reproducible (two generations are identical)
3. Generated files match a fresh generation (no hand edits)

## Contract Generation

```bash
pnpm contract:generate  # Generates types + Zod into src/shared/api/generated/
```

This unpacks the vendored tarball and runs Orval into `src/shared/api/generated/` (gitignored):

- `zod.ts` — Zod schemas for every operation
- `model/` — TypeScript types for every schema component

Run this after:

- Merging or rebasing onto anything that touched the contract
- A fresh clone (generated folder doesn't exist)
- A new `@eco/bff-contract` version is published and pinned

## Typed Ports and Adapters

### Ports

Typed interfaces in `src/shared/api/ports/` (never edit `src/shared/api/generated/` directly):

- **Views** (`views.ts`): Read operations (one interface per domain: ShellViewPort, HomeViewPort, etc.)
- **Commands** (`commands.ts`): Write operations (AnalysisDraftCommands, AnalysisEditCommands, etc.)
- **Call options** (`call-options.ts`): Path and query parameters for each operation
- **Responses** (`responses.ts`): TypeScript response types (VxxResponse, CxxResponse)
- **Operation index** (`operations.ts`): All operationIds for the BFF

Every port method:

- Uses generated Zod schemas for request/response validation
- Takes optional `CallOptions` for path/query parameters
- Returns `Promise<VxxResponse>` or `Promise<CxxResponse>`

Example:

```typescript
export interface HomeViewPort {
  getHomeView(options?: CallOptions): Promise<V03Response>;
}
```

### HTTP Adapters

Implementation in `src/shared/api/adapters/http/` (one file per domain):

- `views.ts` — HTTP GET requests
- `commands.ts` — HTTP POST/PUT/DELETE requests

Each method:

- Declares `/** @operation <operationId> */` JSDoc tag (links to contract operation)
- Uses `src/shared/api/http-client.ts` for network calls
- Validates response with generated Zod schema
- Returns `Promise<T>` where `T` is from `responses.ts`

### Mock Adapters

Implementation in `src/shared/api/adapters/mock/`:

- `operations.ts` — `MOCK_OPERATIONS` map (operationId → mock handler)
- `mock-gaps.ts` — Exempted operations without mocks

### MSW Handlers

Implementation in `src/test/msw/handlers.ts`:

- MSW request handlers for each operation
- Links to `@operation` tags in adapter sources
- Tests in `src/test/msw/handlers.test.ts`

## Contract Commands

### Generate and Check

```bash
pnpm contract:generate  # Regenerate types + Zod from vendored contract
pnpm contract:check     # Verify tarball hash, reproducibility, and freshness
```

### Validate Adapters and Mocks

```bash
pnpm contract:adapters  # Every operation has exactly one HTTP adapter method
pnpm contract:mocks     # Every operation has one mock adapter + MSW handler
```

Both fail if:

- An operation has no adapter method
- An operation has more than one
- A tag names an operation the contract lacks
- A known-unadapted operation now has an adapter

### Fixtures

```bash
pnpm contract:fixtures --check  # Contract examples match current schema
```

This runs `tools/contracts/extract-examples.mjs` to extract Zod example values from the spec into fixtures (`src/test/fixtures/contracts/`) and verifies they parse correctly.

### Documentation

```bash
pnpm contract:docs-sync --bff <bff-docs-dir>  # Copy view/command docs from BFF (origin header stripped)
pnpm contract:docs-check --bff <bff-docs-dir> # Fail if docs have drifted (no-op without BFF path)
```

## Re-vendoring a New BFF Contract

**1. Get the tarball SHA-256** (from BFF release or build):

```bash
# On the BFF repository:
pnpm contract:build && pnpm contract:pack  # Creates dist-contract/eco-bff-contract-<version>.tgz (+ .sha256)

# Copy the tarball into this repo's vendor/contract/; its SHA-256 is in the .sha256 file:
cat dist-contract/eco-bff-contract-*.tgz.sha256
```

**2. Update `contract.lock.json`**:

```json
{
  "package": "@eco/bff-contract",
  "version": "x.y.z",
  "sha256": "<64-char-lowercase-hex>"
}
```

**3. Run contract generation**:

```bash
pnpm contract:generate
pnpm contract:check  # Must pass
```

**4. Update adapters and mocks** (if new operations):

- Add HTTP adapter methods in `src/shared/api/adapters/http/views.ts` or `commands.ts`
- Add mock adapter entries in `src/shared/api/adapters/mock/operations.ts`
- Add MSW handlers in `src/test/msw/handlers.ts`
- Remove operationIds from `tools/contract/known-unadapted-operations.mjs`
- Run `pnpm contract:adapters` and `pnpm contract:mocks`

**5. Update fixtures**:

```bash
pnpm contract:fixtures --check
```

## Adding a View or Command (ADR-0004 §2-5)

The typed-port workflow is a real gate (not a suggestion):

**1. `pnpm contract:generate`** — Regenerate `src/shared/api/generated/` from the vendored contract
**2. Add response type** — Add `VxxResponse` / `CxxResponse` to `src/shared/api/ports/responses.ts`
**3. Add port method** — Add method to `src/shared/api/ports/views.ts` or `commands.ts` with options in `call-options.ts`
**4. Implement HTTP adapter** — Add method in `src/shared/api/adapters/http/` with `@operation <operationId>` tag
**5. Implement mock** — Add entry in `src/shared/api/adapters/mock/operations.ts`, MSW handler in `src/test/msw/handlers.ts`
**6. Test the adapter** — Add row to `OPERATIONS` array in `src/shared/api/adapters/http/http-adapters.test.ts`
**7. Remove from known-unadapted** — Remove operationId from `tools/contract/known-unadapted-operations.mjs`

**Pitfalls to avoid:**

- **Don't guess contract numbers** — `V-xx` / `C-xx` comes from the `Contract V-xx: docs/requirements/…` comment in `generated/zod.ts`
- **Never edit fixtures or mock-gaps.ts** to make tests pass — a fixture that doesn't parse is a contract question for the BFF
- **Always pass all options in adapter tests** — A zero-argument test proves nothing about parameter forwarding
