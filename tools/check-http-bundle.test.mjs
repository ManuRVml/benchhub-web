// @vitest-environment node
// Selftest of tools/check-http-bundle.mjs over fake build folders written to a temp folder (`--dir`, no vite build):
// a clean http build, a fixture chunk by name, mock code by name and a fixture id hidden in an innocent chunk.
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterAll, describe, expect, it } from 'vitest';

import { scanBundle } from './check-http-bundle.mjs';

const SCRIPT = fileURLToPath(new URL('./check-http-bundle.mjs', import.meta.url));

const root = mkdtempSync(join(tmpdir(), 'check-http-bundle-test-'));
afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});

/** A fake build folder: index.html plus the given `assets/` files. */
function bundle(name, assets) {
  const dir = join(root, name);
  mkdirSync(join(dir, 'assets'), { recursive: true });
  writeFileSync(
    join(dir, 'index.html'),
    '<!doctype html><script src="/assets/index-a1.js"></script>',
  );
  for (const [file, code] of Object.entries(assets)) writeFileSync(join(dir, 'assets', file), code);
  return dir;
}

const run = (dir) => spawnSync(process.execPath, [SCRIPT, '--dir', dir], { encoding: 'utf8' });

describe('check-http-bundle', () => {
  it('passes on an http build without mock chunks or fixture ids (exit 0)', () => {
    const dir = bundle('clean', {
      'index-a1.js': 'fetch("/api/v1/views/home")',
      'index-b2.css': '.a{}',
    });
    const result = run(dir);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('check:http-bundle OK: 3 file(s)');
  });

  it('fails on a fixture chunk and names it (exit 1)', () => {
    const dir = bundle('fixture-chunk', {
      'index-a1.js': 'x',
      'V-43.response-B30RwMlh.js': 'export default {}',
    });
    const result = run(dir);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('assets/V-43.response-B30RwMlh.js: file name matches');
  });

  it('fails on mock code or the MSW worker by name (exit 1)', () => {
    const dir = bundle('mock-chunk', { 'index-a1.js': 'x', 'mock-C9HCWcvH.js': 'x' });
    writeFileSync(join(dir, 'mockServiceWorker.js'), 'self.addEventListener("fetch", () => {})');
    expect(scanBundle(dir)).toEqual([
      'assets/mock-C9HCWcvH.js: file name matches /\\.response-|\\.request-|mock/i',
      'mockServiceWorker.js: file name matches /\\.response-|\\.request-|mock/i',
    ]);
    expect(run(dir).status).toBe(1);
  });

  it('fails when an innocent-looking chunk inlines a fixture id (exit 1)', () => {
    const dir = bundle('inlined', { 'index-a1.js': 'const d={id:"prs_directorio_t4"}' });
    const result = run(dir);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      'assets/index-a1.js: contains the fixture id "prs_directorio_t4"',
    );
  });

  it('fails when the given folder does not exist (exit 1)', () => {
    const result = run(join(root, 'missing'));
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('does not exist');
  });
});
