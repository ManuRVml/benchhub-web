// @vitest-environment node
// Selftest of tools/contract/check-mocks.mjs over fixtures written to a temp folder: a spec with two operations, mock
// adapters and MSW handlers that are complete or miss one operation.
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterAll, describe, expect, it } from 'vitest';

const SCRIPT = fileURLToPath(new URL('./check-mocks.mjs', import.meta.url));
const SPEC = [
  'paths:',
  '  /api/v1/views/a:',
  '    get:',
  '      operationId: getA',
  '  /api/v1/commands:',
  '    post:',
  '      operationId: createB',
  '',
].join('\n');

const root = mkdtempSync(join(tmpdir(), 'check-mocks-'));
afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});

const tagged = (...ids) => ids.map((id) => `  /** @operation ${id} */\n  ${id}(),\n`).join('');

function run(name, mocks, handlers) {
  const dir = join(root, name);
  mkdirSync(join(dir, 'mocks'), { recursive: true });
  mkdirSync(join(dir, 'msw'), { recursive: true });
  writeFileSync(join(dir, 'openapi.yaml'), SPEC);
  writeFileSync(join(dir, 'mocks', 'ports.ts'), `export const ports = [\n${mocks}];\n`);
  writeFileSync(join(dir, 'msw', 'handlers.ts'), `export const handlers = [\n${handlers}];\n`);
  return spawnSync(
    process.execPath,
    [
      SCRIPT,
      '--spec',
      join(dir, 'openapi.yaml'),
      '--mocks',
      join(dir, 'mocks'),
      '--handlers',
      join(dir, 'msw'),
    ],
    { encoding: 'utf8' },
  );
}

describe('check-mocks', () => {
  it('passes when both sets cover every operation once (exit 0)', () => {
    const result = run('complete', tagged('getA', 'createB'), tagged('getA', 'createB'));
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('contract:mocks OK: 2 operation(s)');
  });

  it('fails when an MSW handler is missing (exit 1)', () => {
    const result = run('no-handler', tagged('getA', 'createB'), tagged('getA'));
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('MSW handlers: missing adapter method for operation "createB"');
  });

  it('fails when a mock adapter method is duplicated (exit 1)', () => {
    const result = run('duplicate', tagged('getA', 'getA', 'createB'), tagged('getA', 'createB'));
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('mock adapters: operation "getA" has 2 adapter methods');
  });
});
