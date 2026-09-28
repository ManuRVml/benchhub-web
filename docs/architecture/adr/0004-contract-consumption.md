# ADR-0004: Contract consumption — vendored tarball, Orval-generated types

## Status

Accepted.

## Context

The web and BFF are separate repositories meeting only at the HTTP contract. The BFF publishes `openapi.yaml` as a versioned tarball; the web must consume it without cross-repo paths.

Constraints:
- Neither repo may reference the sibling folder in scripts, configs, or tests (brief L22).
- The contract must be integrity-checked (SHA256 hash).
- Types and runtime schemas must be generated, never hand-edited.
- CI must detect drift (stale or modified contract).

Sources: `PLAN.md` D4, `eco-comparator-bff/docs/architecture/adr/0002-contract-publication.md`, `prompt_Start_Eco.md` L94.

## Decision

1. **Vendored tarball**: The web stores the contract as `vendor/contract/@eco/bff-contract-<x.y.z>.tgz` (npm-format tarball containing `package.json`, `openapi.yaml`, `CHANGELOG.md` excerpt).

2. **Contract lock file**: `contract.lock.json` at repo root:
   ```json
   {
     "package": "@eco/bff-contract",
     "version": "0.1.0",
     "sha256": "45650313217e9e36a9aebb494bd9500a1d9eccfab54d20e28d82572c67da4f3e"
   }
   ```

3. **Hash verification**: `pnpm contract:check`:
   - Reads `contract.lock.json`.
   - Verifies `vendor/contract/@eco/bff-contract-*.tgz` SHA256 matches `sha256` in lock.
   - If mismatch, fails with error.

4. **Generation**: `pnpm contract:generate` (`tools/contract/generate.mjs`):
   - Verifies the tarball hash (as `contract:check`), then unpacks it to `vendor/contract/unpacked/` (gitignored).
   - Runs Orval (programmatic API, `client: 'zod'`, strict objects) into `src/shared/api/generated/` (gitignored):
     - `zod.ts`: Zod schemas for every operation (params, query, body, response).
     - `model/`: TypeScript types for every component schema.
   - Orval generates **types + Zod only**: no Axios client and no React Query hooks. The fetch `httpClient` (CSRF,
     `traceId`, Zod validation of responses, `ApiError`) is hand-written in P5-01 and the query hooks in P5-04, both on
     top of the generated types and schemas.
   - Only `src/shared/api/**` may import `src/shared/api/generated/` (architecture rule, `pnpm check:architecture`); the
     rest of the app goes through the `shared/api` public API. Lint and the architecture check ignore the folder.
   - A fresh clone needs no committed output: `pnpm verify` runs `contract:generate` before typecheck and tests.

5. **CI gates**:
   - `contract:check`: verifies the hash, generates twice into a scratch folder (fails if Orval output is not
     reproducible) and fails if `src/shared/api/generated/` differs from a fresh generation (generates it when absent).
   - `contract:build` (BFF side): Ensures `openapi.yaml` matches `src/contracts/` Zod schemas.

6. **Updating the contract**: PR replaces `vendor/contract/@eco/bff-contract-*.tgz` and updates `contract.lock.json` with new version and SHA256.

## Alternatives considered

- **Private npm registry (Azure Artifacts/GitHub Packages)**: Deferred until a registry exists; tarball works offline.
- **GitHub release with raw `openapi.yaml`**: Lacks package metadata and changelog; tarball is npm-compatible.
- **Git submodule to BFF repo**: Violates "no cross-repo paths" (brief L22).
- **Relative path `../eco-comparator-bff/contracts/openapi.yaml`**: Explicitly forbidden (brief L22).

## Consequences

- Positive: No registry needed; works offline with SHA256 integrity.
- Positive: Mechanical drift detection via `contract:check`.
- Positive: Generated types and Zod schemas prevent manual errors; the HTTP client and hooks stay small and hand-written.
- Negative: Manual copy step per BFF release.
- Negative: `orval` needs to be reconfigured if BFF adds new features (pagination, filters).
