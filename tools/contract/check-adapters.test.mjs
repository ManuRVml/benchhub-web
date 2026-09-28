// @vitest-environment node
// Selftest of tools/contract/check-adapters.mjs: runs the CLI over small fixtures written to a temp folder (a spec with
// three operations and adapter sources that are complete, or miss one and duplicate another).
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterAll, describe, expect, it } from 'vitest';

import { compareAdapters, readOperationIds } from './check-adapters.mjs';

const SCRIPT = fileURLToPath(new URL('./check-adapters.mjs', import.meta.url));
const SPEC = [
  'openapi: 3.1.0',
  'paths:',
  '  /api/v1/views/a:',
  '    get:',
  '      operationId: getA',
  '  /api/v1/views/b/{id}:',
  '    get:',
  '      operationId: getB',
  '  /api/v1/commands:',
  '    post:',
  '      operationId: createC',
  '',
].join('\n');

const root = mkdtempSync(join(tmpdir(), 'check-adapters-'));
afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});

/** Writes a spec and one adapter file per entry; returns the CLI result. */
function run(name, adapterFiles) {
  const dir = join(root, name);
  mkdirSync(join(dir, 'adapters'), { recursive: true });
  writeFileSync(join(dir, 'openapi.yaml'), SPEC);
  for (const [file, text] of Object.entries(adapterFiles))
    writeFileSync(join(dir, 'adapters', file), text);
  return spawnSync(
    process.execPath,
    [SCRIPT, '--spec', join(dir, 'openapi.yaml'), '--adapters', join(dir, 'adapters')],
    { encoding: 'utf8' },
  );
}

const method = (operationId) =>
  `  /** @operation ${operationId} */\n  ${operationId}: () => undefined,\n`;

describe('check-adapters', () => {
  it('reads the operationIds of a spec', () => {
    expect(readOperationIds(SPEC)).toEqual(['getA', 'getB', 'createC']);
  });

  it('passes when every operation has exactly one adapter method (exit 0)', () => {
    const result = run('complete', {
      'views.ts': `export const views = {\n${method('getA')}${method('getB')}};\n`,
      'commands.ts': `export const commands = {\n${method('createC')}};\n`,
      'views.test.ts': `// @operation getA (tests are ignored)\n`,
    });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('contract:adapters OK: 3 operation(s)');
  });

  it('fails on a missing and a duplicated operation (exit 1)', () => {
    const result = run('broken', {
      'views.ts': `export const views = {\n${method('getA')}${method('getA')}};\n`,
      'commands.ts': `export const commands = {\n${method('createC')}};\n`,
    });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('missing adapter method for operation "getB"');
    expect(result.stderr).toContain('operation "getA" has 2 adapter methods');
  });

  it('fails on a tag that names an operation the contract lacks (exit 1)', () => {
    const result = run('unknown', {
      'views.ts': `export const views = {\n${method('getA')}${method('getB')}${method('getZ')}};\n`,
      'commands.ts': `export const commands = {\n${method('createC')}};\n`,
    });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('unknown operation "getZ"');
  });

  it('compareAdapters reports nothing for a complete set', () => {
    const tags = ['getA', 'getB', 'createC'].map((operationId) => ({ operationId, at: 'x.ts:1' }));
    expect(compareAdapters(['getA', 'getB', 'createC'], tags)).toEqual([]);
  });
});
