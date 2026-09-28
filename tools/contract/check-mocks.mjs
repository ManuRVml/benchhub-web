// `pnpm contract:mocks` (P5-03, ADR-0004): every operation of the vendored contract has exactly one mock adapter method
// (src/shared/api/adapters/mock) and exactly one MSW handler (src/test/msw). Both declare their operation with a
// `@operation <operationId>` JSDoc tag, like the HTTP adapters checked by `pnpm contract:adapters`. Fails on a missing,
// duplicated or unknown operation in either set.
//
// Usage: node tools/contract/check-mocks.mjs [--spec <openapi.yaml>] [--mocks <dir>] [--handlers <dir>]
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { compareAdapters, readAdapterTags, readOperationIds } from './check-adapters.mjs';
import { KNOWN_UNADAPTED_OPERATIONS } from './known-unadapted-operations.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DEFAULT_SPEC = join(ROOT, 'vendor', 'contract', 'unpacked', 'openapi.yaml');
const DEFAULT_MOCKS = join(ROOT, 'src', 'shared', 'api', 'adapters', 'mock');
const DEFAULT_HANDLERS = join(ROOT, 'src', 'test', 'msw');

function argValue(name, fallback) {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : resolve(process.argv[index + 1] ?? '');
}

function main() {
  const spec = argValue('--spec', DEFAULT_SPEC);
  const mocks = argValue('--mocks', DEFAULT_MOCKS);
  const handlers = argValue('--handlers', DEFAULT_HANDLERS);
  const isDefaultRun =
    spec === DEFAULT_SPEC && mocks === DEFAULT_MOCKS && handlers === DEFAULT_HANDLERS;
  const sets = [
    ['mock adapters', mocks],
    ['MSW handlers', handlers],
  ];
  if (!existsSync(spec)) {
    console.error(
      `contract:mocks FAIL: ${relative(ROOT, spec)} is missing; run pnpm contract:generate first`,
    );
    process.exit(1);
  }
  const operationIds = readOperationIds(readFileSync(spec, 'utf8'));
  if (operationIds.length === 0) {
    console.error(`contract:mocks FAIL: no operationId in ${relative(ROOT, spec)}`);
    process.exit(1);
  }
  const problems = sets.flatMap(([label, dir]) =>
    existsSync(dir)
      ? compareAdapters(
          operationIds,
          readAdapterTags(dir),
          isDefaultRun ? KNOWN_UNADAPTED_OPERATIONS : new Set(),
        ).map((problem) => `${label}: ${problem}`)
      : [`${label}: ${relative(ROOT, dir)} does not exist`],
  );
  if (problems.length > 0) {
    console.error(`contract:mocks FAIL (${String(problems.length)} problem(s)):`);
    for (const problem of problems) console.error(`  - ${problem}`);
    process.exit(1);
  }
  console.log(
    `contract:mocks OK: ${String(operationIds.length)} operation(s), one mock adapter method and one MSW handler each`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
