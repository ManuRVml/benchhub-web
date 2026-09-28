#!/usr/bin/env node
// Gate-1 aggregate check (P1-26b): runs every Phase-1 checker in sequence, validates docs/design/gate-1.md and prints a
// table `checker | status | exit`. Exit 0 only when no checker fails and every `- [x]` line of gate-1.md cites evidence
// paths and checker files that exist.
//
// Usage: node tools/check-gate1.mjs            (or `pnpm gate:1`)
// Environment:
//   PROTOTYPE_DIR   folder holding BencHUD.dc.html (default: ../V2 _CUAN_ECO_Comparador 2 from the repo root);
//                   missing → render check WARN (skipped)
//   SYNTHESIS_PATH  .plan/source-map/10-synthesis.md (default: ../.plan/source-map/10-synthesis.md from the repo root);
//                   missing → synthesis-hex check WARN (skipped)
//   SOURCE_ROOT     folder holding the two source folders, forwarded to check-source-coverage (see that script)
// Status values: PASS, FAIL, WARN (skipped: required input missing), PENDING (checker file not on this branch yet).
// No dependencies.
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const rel = (p) => relative(root, p).replace(/\\/g, '/') || '.';
const prototypeDir = resolve(
  root,
  process.env.PROTOTYPE_DIR ?? join('..', 'V2 _CUAN_ECO_Comparador 2'),
);
const synthesisPath = resolve(
  root,
  process.env.SYNTHESIS_PATH ?? join('..', '.plan', 'source-map', '10-synthesis.md'),
);

/** @type {Array<{ id: string, cmd: string, args: string[], env?: object, needsFile?: string, skipIf?: () => string | null }>} */
const CHECKS = [
  {
    id: 'build-design-index --check',
    cmd: 'node',
    args: ['tools/build-design-index.mjs', '--check'],
  },
  {
    id: 'check-open-questions',
    cmd: 'node',
    args: ['tools/check-open-questions.mjs'],
  },
  {
    id: 'check-source-column (mock-data-catalog)',
    cmd: 'node',
    args: ['tools/check-source-column.mjs', 'docs/design/mock-data-catalog.md'],
  },
  {
    id: 'check-component-catalog',
    cmd: 'node',
    args: ['tools/check-component-catalog.mjs'],
  },
  {
    id: 'check-command-contracts',
    cmd: 'node',
    args: ['tools/check-command-contracts.mjs'],
  },
  {
    id: 'tokens/check-md-coverage',
    cmd: 'node',
    args: ['tools/tokens/check-md-coverage.mjs'],
  },
  {
    id: 'tokens/check-synthesis-hex',
    cmd: 'node',
    args: ['tools/tokens/check-synthesis-hex.mjs', synthesisPath],
    skipIf: () => (existsSync(synthesisPath) ? null : `SYNTHESIS_PATH not found: ${synthesisPath}`),
  },
  {
    id: 'oracles/print-kvi',
    cmd: 'node',
    args: ['tools/oracles/print-kvi.mjs'],
  },
  { id: 'check-adrs', cmd: 'node', args: ['tools/check-adrs.mjs'] },
  {
    id: 'check-reference-catalogue.py',
    cmd: 'python',
    args: ['tools/check-reference-catalogue.py'],
  },
  {
    id: 'prototype-render --check',
    cmd: 'node',
    args: ['tools/prototype-render/render.mjs', '--check'],
    env: { PROTOTYPE_DIR: prototypeDir },
    skipIf: () =>
      existsSync(join(prototypeDir, 'BencHUD.dc.html'))
        ? null
        : `PROTOTYPE_DIR has no BencHUD.dc.html: ${prototypeDir}`,
  },
  // In-flight Phase-1 deliveries: they run as soon as their checker file exists on the branch.
  {
    id: 'check-view-contracts',
    cmd: 'node',
    args: ['tools/check-view-contracts.mjs', '--dir', 'docs/design/view-data-contracts'],
    needsFile: 'tools/check-view-contracts.mjs',
  },
  {
    id: 'check-navigation-map',
    cmd: 'node',
    args: ['tools/check-navigation-map.mjs'],
    needsFile: 'tools/check-navigation-map.mjs',
  },
  {
    id: 'check-source-coverage',
    cmd: 'node',
    args: ['tools/check-source-coverage.mjs'],
    needsFile: 'tools/check-source-coverage.mjs',
  },
  {
    id: 'check-design-consistency',
    cmd: 'node',
    args: ['tools/check-design-consistency.mjs'],
    needsFile: 'tools/check-design-consistency.mjs',
  },
];

const results = [];
const failureOutput = [];

function run(check) {
  if (check.needsFile && !existsSync(join(root, check.needsFile))) {
    return {
      status: 'PENDING',
      exit: '—',
      note: `${check.needsFile} not on this branch yet`,
    };
  }
  const skip = check.skipIf?.();
  if (skip) return { status: 'WARN', exit: '—', note: `skipped: ${skip}` };
  const env = { ...process.env, ...(check.env ?? {}) };
  let res = spawnSync(check.cmd, check.args, {
    cwd: root,
    env,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  if (res.error?.code === 'ENOENT' && check.cmd === 'python') {
    res = spawnSync('python3', check.args, {
      cwd: root,
      env,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    });
  }
  if (res.error) return { status: 'FAIL', exit: '—', note: res.error.message };
  const out = `${res.stdout ?? ''}${res.stderr ?? ''}`.trim();
  if (res.status !== 0)
    failureOutput.push({
      id: check.id,
      tail: out.split('\n').slice(-8).join('\n'),
    });
  return {
    status: res.status === 0 ? 'PASS' : 'FAIL',
    exit: String(res.status),
    note: '',
  };
}

for (const check of CHECKS) results.push({ id: check.id, ...run(check) });

// Built-in: every CF id cited under docs/ has a row in docs/design/conflicts.md.
function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (p.endsWith('.md')) acc.push(p);
  }
  return acc;
}
{
  const conflicts = join(root, 'docs/design/conflicts.md');
  if (!existsSync(conflicts)) {
    results.push({
      id: 'cf-references (built-in)',
      status: 'FAIL',
      exit: '1',
      note: 'docs/design/conflicts.md missing',
    });
  } else {
    const rows = new Set(
      [...readFileSync(conflicts, 'utf8').matchAll(/^\| (CF-\d+) \|/gm)].map((m) => m[1]),
    );
    const missing = new Map();
    for (const file of walk(join(root, 'docs'))) {
      for (const m of readFileSync(file, 'utf8').matchAll(/\bCF-\d+\b/g)) {
        if (!rows.has(m[0])) missing.set(m[0], rel(file));
      }
    }
    const ok = missing.size === 0;
    if (!ok)
      failureOutput.push({
        id: 'cf-references (built-in)',
        tail: [...missing].map(([cf, f]) => `${cf} cited in ${f} has no row`).join('\n'),
      });
    results.push({
      id: 'cf-references (built-in)',
      status: ok ? 'PASS' : 'FAIL',
      exit: ok ? '0' : '1',
      note: `${rows.size} rows`,
    });
  }
}

// Built-in: docs/design/gate-1.md — every `- [x]` line must cite existing evidence and checker files.
function pathExists(p) {
  if (p.includes('*')) {
    const dir = join(root, dirname(p));
    if (!existsSync(dir)) return false;
    const re = new RegExp(
      `^${p
        .split('/')
        .pop()
        .replace(/[.+^${}()|[\]\\]/g, '\\$&')
        .replace(/\*/g, '.*')}$`,
    );
    return readdirSync(dir).some((f) => re.test(f));
  }
  return existsSync(join(root, p));
}
{
  const gateFile = join(root, 'docs/design/gate-1.md');
  const problems = [];
  let checked = 0;
  let open = 0;
  if (!existsSync(gateFile)) problems.push('docs/design/gate-1.md missing');
  else {
    const items = [];
    for (const line of readFileSync(gateFile, 'utf8').split('\n')) {
      if (/^- \[[ x]\] /.test(line)) items.push(line);
      else if (items.length && /^\s{2,}\S/.test(line)) items[items.length - 1] += ' ' + line.trim();
    }
    for (const item of items) {
      if (item.startsWith('- [ ] ')) {
        open++;
        continue;
      }
      checked++;
      const name = item.match(/\*\*(.+?)\*\*/)?.[1] ?? item.slice(6, 40);
      const [, evidencePart = '', checkPart = ''] =
        item.match(/Evidence:(.*?)(?:— Check:(.*))?$/) ?? [];
      if (!evidencePart.trim()) problems.push(`[x] "${name}" has no Evidence`);
      for (const [, token] of evidencePart.matchAll(/`([^`]+)`/g)) {
        if (/\s|</.test(token)) continue; // prose or placeholder
        if (!pathExists(token)) problems.push(`[x] "${name}" evidence missing: ${token}`);
      }
      const commands = [...checkPart.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
      if (!commands.length) problems.push(`[x] "${name}" has no checker command`);
      for (const command of commands) {
        const [runner, file] = command.split(/\s+/);
        if (!['node', 'python', 'python3'].includes(runner) || !file) continue;
        if (!existsSync(join(root, file))) problems.push(`[x] "${name}" checker missing: ${file}`);
      }
    }
  }
  const ok = problems.length === 0;
  if (!ok)
    failureOutput.push({
      id: 'gate-1.md checklist (built-in)',
      tail: problems.join('\n'),
    });
  results.push({
    id: 'gate-1.md checklist (built-in)',
    status: ok ? 'PASS' : 'FAIL',
    exit: ok ? '0' : '1',
    note: `${checked} [x], ${open} [ ]`,
  });
}

const width = Math.max(...results.map((r) => r.id.length), 'checker'.length);
console.log(`| ${'checker'.padEnd(width)} | status  | exit | note`);
console.log(`|${'-'.repeat(width + 2)}|---------|------|-----`);
for (const r of results)
  console.log(
    `| ${r.id.padEnd(width)} | ${r.status.padEnd(7)} | ${String(r.exit).padEnd(4)} | ${r.note}`,
  );
for (const f of failureOutput) console.log(`\n--- ${f.id} (tail) ---\n${f.tail}`);
const failed = results.filter((r) => r.status === 'FAIL').length;
const counts = ['PASS', 'FAIL', 'WARN', 'PENDING']
  .map((s) => `${s} ${results.filter((r) => r.status === s).length}`)
  .join(' · ');
console.log(`\nGate 1: ${failed ? 'FAILED' : 'OK'} (${counts})`);
process.exit(failed ? 1 : 0);
