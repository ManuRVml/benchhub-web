// Shared helpers of the contract scripts (ADR-0004): the lock, the vendored tarball, its hash, unpacking and Orval.
// The web never reads the BFF repository: the only input is vendor/contract/@eco/bff-contract-<version>.tgz, pinned by
// contract.lock.json (brief L22, PLAN D4).
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';

import { generate } from 'orval';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const LOCK_FILE = join(ROOT, 'contract.lock.json');
/** Unpacked tarball (gitignored). */
export const UNPACKED_DIR = join(ROOT, 'vendor', 'contract', 'unpacked');
/** Orval output (gitignored): TypeScript types + Zod schemas only; no HTTP client, no query hooks. */
export const GENERATED_DIR = join(ROOT, 'src', 'shared', 'api', 'generated');

/** @returns {{ package: string, version: string, sha256: string }} */
export function readLock() {
  const lock = JSON.parse(readFileSync(LOCK_FILE, 'utf8'));
  for (const key of ['package', 'version', 'sha256']) {
    if (typeof lock[key] !== 'string' || lock[key] === '') {
      throw new Error(`contract.lock.json: "${key}" must be a non-empty string`);
    }
  }
  if (!/^[0-9a-f]{64}$/.test(lock.sha256)) {
    throw new Error('contract.lock.json: "sha256" must be 64 lowercase hex characters');
  }
  return lock;
}

/** vendor/contract/@eco/bff-contract-<version>.tgz for the locked package. */
export function tarballPath(lock) {
  const [scope, name] = lock.package.split('/');
  if (!scope?.startsWith('@') || !name) throw new Error(`unexpected package name ${lock.package}`);
  return join(ROOT, 'vendor', 'contract', scope, `${name}-${lock.version}.tgz`);
}

/** Reads the locked tarball and fails unless its SHA-256 equals the lock's. @returns {Buffer} */
export function verifiedTarball(lock) {
  const file = tarballPath(lock);
  const bytes = readFileSync(file);
  const actual = createHash('sha256').update(bytes).digest('hex');
  if (actual !== lock.sha256) {
    throw new Error(
      `${relative(ROOT, file)}: sha256 ${actual} does not match contract.lock.json ${lock.sha256}`,
    );
  }
  return bytes;
}

/** Entries of a gzipped ustar archive (regular files only). @returns {Map<string, Buffer>} */
export function untarGz(bytes) {
  const tar = gunzipSync(bytes);
  const files = new Map();
  let offset = 0;
  while (offset + 512 <= tar.length) {
    const header = tar.subarray(offset, offset + 512);
    if (header.every((byte) => byte === 0)) break;
    const field = (start, length) =>
      header
        .subarray(start, start + length)
        .toString('utf8')
        .replace(/\0.*$/s, '');
    const name = field(0, 100);
    const prefix = field(345, 155);
    const size = Number.parseInt(field(124, 12).trim() || '0', 8);
    const type = field(156, 1) || '0';
    const path = prefix ? `${prefix}/${name}` : name;
    const body = tar.subarray(offset + 512, offset + 512 + size);
    if (type === '0') files.set(path, Buffer.from(body));
    offset += 512 + Math.ceil(size / 512) * 512;
  }
  return files;
}

/** Unpacks the verified tarball into UNPACKED_DIR and checks its package.json against the lock. @returns {string} */
export function unpack(lock) {
  const files = untarGz(verifiedTarball(lock));
  const manifest = JSON.parse(files.get('package/package.json')?.toString('utf8') ?? 'null');
  if (manifest?.name !== lock.package || manifest?.version !== lock.version) {
    throw new Error(
      `tarball package.json is ${String(manifest?.name)}@${String(manifest?.version)}, lock says ${lock.package}@${lock.version}`,
    );
  }
  if (!files.has('package/openapi.yaml')) throw new Error('tarball has no package/openapi.yaml');
  rmSync(UNPACKED_DIR, { recursive: true, force: true });
  for (const [path, body] of files) {
    if (!path.startsWith('package/') || path.includes('..')) {
      throw new Error(`unexpected tarball entry ${path}`);
    }
    const target = join(UNPACKED_DIR, path.slice('package/'.length));
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, body);
  }
  return join(UNPACKED_DIR, 'openapi.yaml');
}

/**
 * Runs Orval on `openapiFile` into `outDir` (emptied first): `zod.ts` with the Zod schemas of every operation
 * (`client: 'zod'`) and `model/` with the TypeScript types of every component schema.
 */
export async function runOrval(openapiFile, outDir) {
  rmSync(outDir, { recursive: true, force: true });
  await generate(
    {
      input: { target: openapiFile },
      output: {
        mode: 'single',
        client: 'zod',
        target: join(outDir, 'zod.ts'),
        schemas: join(outDir, 'model'),
        clean: true,
        // The spec closes every object (`additionalProperties: false`, Zod `.strict()` on the BFF): keep them strict.
        override: {
          zod: { strict: { param: true, query: true, header: true, body: true, response: true } },
        },
      },
    },
    ROOT,
  );
}

/** Every file under `dir` as relative path → content, for comparing two generations. @returns {Map<string, string>} */
export function snapshot(dir) {
  const files = new Map();
  const walk = (current) => {
    for (const entry of readdirSync(current)) {
      const path = join(current, entry);
      if (statSync(path).isDirectory()) walk(path);
      else files.set(relative(dir, path).split(sep).join('/'), readFileSync(path, 'utf8'));
    }
  };
  walk(dir);
  return files;
}

/** Paths that differ between two snapshots (missing, extra or changed). @returns {string[]} */
export function diffSnapshots(expected, actual) {
  const paths = new Set([...expected.keys(), ...actual.keys()]);
  return [...paths].filter((path) => expected.get(path) !== actual.get(path)).sort();
}
