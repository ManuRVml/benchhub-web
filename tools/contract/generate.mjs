#!/usr/bin/env node
// `pnpm contract:generate` (ADR-0004 §4): verifies the vendored tarball against contract.lock.json, unpacks it into
// vendor/contract/unpacked/ and runs Orval into src/shared/api/generated/ (both gitignored): TypeScript types (`model/`)
// and Zod schemas (`zod.ts`) only. The HTTP client (P5-01) and the query hooks (P5-04) are hand-written on these types.
import { GENERATED_DIR, readLock, runOrval, unpack } from './lib.mjs';

const lock = readLock();
await runOrval(unpack(lock), GENERATED_DIR);
process.stdout.write(
  `contract:generate: ${lock.package}@${lock.version} -> src/shared/api/generated/ (types + Zod)\n`,
);
