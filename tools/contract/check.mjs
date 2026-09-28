#!/usr/bin/env node
// `pnpm contract:check` (ADR-0004 §3, §5): the contract drift gate. Exit 0 only when
//   1. the vendored tarball's SHA-256 equals contract.lock.json (fails on any byte change of either), and
//   2. Orval output is reproducible: two fresh generations from the tarball are identical, and
//   3. src/shared/api/generated/ equals a fresh generation (stale or hand-edited output fails). When the folder does
//      not exist yet (fresh clone), it is generated from the verified tarball.
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { GENERATED_DIR, diffSnapshots, readLock, runOrval, snapshot, unpack } from './lib.mjs';

const fail = (message) => {
  process.stderr.write(`contract:check FAIL: ${message}\n`);
  process.exitCode = 1;
};

async function main() {
  const lock = readLock();
  const openapi = unpack(lock); // throws when the hash does not match
  const scratch = mkdtempSync(join(tmpdir(), 'eco-contract-'));
  try {
    await runOrval(openapi, join(scratch, 'a'));
    await runOrval(openapi, join(scratch, 'b'));
    const fresh = snapshot(join(scratch, 'a'));
    const nondeterministic = diffSnapshots(fresh, snapshot(join(scratch, 'b')));
    if (nondeterministic.length) {
      fail(`Orval output is not reproducible: ${nondeterministic.join(', ')}`);
      return;
    }
    if (!existsSync(GENERATED_DIR)) {
      await runOrval(openapi, GENERATED_DIR);
    }
    const stale = diffSnapshots(fresh, snapshot(GENERATED_DIR));
    if (stale.length) {
      fail(
        `src/shared/api/generated/ differs from a fresh generation (${stale.join(', ')}); run pnpm contract:generate`,
      );
      return;
    }
    process.stdout.write(
      `contract:check OK: ${lock.package}@${lock.version} sha256 ${lock.sha256}, ${String(fresh.size)} generated file(s) up to date\n`,
    );
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

try {
  await main();
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}
