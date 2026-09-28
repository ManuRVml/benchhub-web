// `pnpm contract:adapters` (P5-02, ADR-0004): every operation of the vendored contract has exactly one HTTP adapter
// method. Operations are the `operationId`s of vendor/contract/unpacked/openapi.yaml (written by `pnpm contract:generate`);
// adapter methods declare theirs with a JSDoc tag `@operation <operationId>` in src/shared/api/adapters/http/*.ts.
// Fails when an operation has no adapter method, has more than one, or a tag names an operation the contract lacks.
//
// Usage: node tools/contract/check-adapters.mjs [--spec <openapi.yaml>] [--adapters <dir>]
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { KNOWN_UNADAPTED_OPERATIONS } from './known-unadapted-operations.mjs';

// Paths as in lib.mjs, which is not imported: it loads Orval, and this check only reads text files.
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const UNPACKED_DIR = join(ROOT, 'vendor', 'contract', 'unpacked');

/** operationIds of an OpenAPI YAML document, in order (the generated spec writes one `operationId: x` per line). */
export function readOperationIds(yamlText) {
  return [...yamlText.matchAll(/^\s+operationId:\s*['"]?([A-Za-z0-9_]+)['"]?\s*$/gm)].map(
    (m) => m[1],
  );
}

/** `@operation x` tags of the adapter sources, each with the file and line it was found at. */
export function readAdapterTags(dir) {
  const tags = [];
  const walk = (current) => {
    for (const entry of readdirSync(current)) {
      const path = join(current, entry);
      if (statSync(path).isDirectory()) walk(path);
      else if (/\.tsx?$/.test(entry) && !/\.(test|stories)\.tsx?$/.test(entry)) {
        readFileSync(path, 'utf8')
          .split('\n')
          .forEach((line, index) => {
            for (const match of line.matchAll(/@operation\s+([A-Za-z0-9_]+)/g)) {
              tags.push({
                operationId: match[1],
                at: `${relative(ROOT, path)}:${String(index + 1)}`,
              });
            }
          });
      }
    }
  };
  walk(dir);
  return tags;
}

/**
 * Problems of an adapter set against the contract's operations; empty when every operation has exactly one method.
 * `knownUnadapted` (default: none) exempts named operations from the "missing" check — `main()` passes the real
 * registry only for the default (unpacked, non-overridden) spec/adapters pair, so a caller checking a synthetic or
 * partial spec (tests, `--spec`/`--adapters` overrides) sees the bare, unexempted rule.
 */
export function compareAdapters(operationIds, tags, knownUnadapted = new Set()) {
  const problems = [];
  const known = new Set(operationIds);
  const byOperation = new Map();
  for (const tag of tags) {
    if (!known.has(tag.operationId)) {
      problems.push(`unknown operation "${tag.operationId}" at ${tag.at} (not in the contract)`);
      continue;
    }
    byOperation.set(tag.operationId, [...(byOperation.get(tag.operationId) ?? []), tag.at]);
  }
  for (const operationId of operationIds) {
    const found = byOperation.get(operationId) ?? [];
    if (found.length === 0 && !knownUnadapted.has(operationId)) {
      problems.push(`missing adapter method for operation "${operationId}"`);
    }
    if (found.length > 0 && knownUnadapted.has(operationId)) {
      problems.push(
        `operation "${operationId}" now has an adapter method (${found.join(', ')}); remove it from known-unadapted-operations.mjs`,
      );
    }
    if (found.length > 1) {
      problems.push(
        `operation "${operationId}" has ${String(found.length)} adapter methods: ${found.join(', ')}`,
      );
    }
  }
  for (const operationId of knownUnadapted) {
    if (!known.has(operationId)) {
      problems.push(
        `known-unadapted-operations.mjs names "${operationId}", which is not in the contract`,
      );
    }
  }
  return problems;
}

function argValue(name, fallback) {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : resolve(process.argv[index + 1] ?? '');
}

function main() {
  const defaultSpec = join(UNPACKED_DIR, 'openapi.yaml');
  const defaultAdapters = join(ROOT, 'src', 'shared', 'api', 'adapters', 'http');
  const spec = argValue('--spec', defaultSpec);
  const adapters = argValue('--adapters', defaultAdapters);
  const isDefaultRun = spec === defaultSpec && adapters === defaultAdapters;
  if (!existsSync(spec)) {
    console.error(
      `contract:adapters FAIL: ${relative(ROOT, spec)} is missing; run pnpm contract:generate first`,
    );
    process.exit(1);
  }
  const operationIds = readOperationIds(readFileSync(spec, 'utf8'));
  if (operationIds.length === 0) {
    console.error(`contract:adapters FAIL: no operationId in ${relative(ROOT, spec)}`);
    process.exit(1);
  }
  const problems = compareAdapters(
    operationIds,
    readAdapterTags(adapters),
    isDefaultRun ? KNOWN_UNADAPTED_OPERATIONS : new Set(),
  );
  if (problems.length > 0) {
    console.error(`contract:adapters FAIL (${String(problems.length)} problem(s)):`);
    for (const problem of problems) console.error(`  - ${problem}`);
    process.exit(1);
  }
  console.log(
    `contract:adapters OK: ${String(operationIds.length)} operation(s), one adapter method each (${relative(ROOT, adapters)})`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
