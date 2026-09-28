#!/usr/bin/env node
// Cross-consistency check of the Phase 1 design docs (P1-26c, Gate 1).
//
//   node tools/check-design-consistency.mjs                 check docs/design
//   node tools/check-design-consistency.mjs --root <dir>    check another copy of docs/design (mutation tests)
//   node tools/check-design-consistency.mjs --fields        also print the informational Data-fields report
//
// Blocking rules (exit 1, one "file:line: message" per finding):
//   R1  an A-/O-/V-/C- id cited in a screen inventory or overlays.md has no contract file in view-data-contracts/;
//   R2  a contract's "- Screens:" / "- Triggered from:" bullet cites a SCR id with no screen-inventory file;
//   R3  an OQ-/CF- id cited anywhere in docs/design has no row in open-questions.md / conflicts.md;
//   R4  an inventory or overlays.md cites "<Id> <METHOD> /api/v1/<path>" that differs from that contract's Endpoint.
// Ranges are expanded: "V-01..V-08", "C-38..40", "OQ-01..OQ-22", "SCR-05..SCR-16", "SCR-09/10/11".
//
// Informational only (--fields, never fails): contract field names that an inventory "Data fields" bullet cites next to
// a V-/A- id but that do not appear as a key in that contract's JSON example. Not a gate because inventories describe
// fields in prose (nested shapes, enum values, proposed names), so a name miss is a hint, not a mechanical error.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const args = { root: path.join(HERE, '..', 'docs', 'design'), fields: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--root') args.root = path.resolve(argv[++i] ?? '');
    else if (argv[i] === '--fields') args.fields = true;
    else throw new Error(`Unknown argument: ${argv[i]}`);
  }
  return args;
}

const pad = (n) => String(n).padStart(2, '0');

// Expands the ids of one family in a line: singles, "X-01..X-08", "X-01..08", "X-01–X-08", "X-09/10/11".
function idsInLine(line, prefix, digits = '\\d{2,3}') {
  const ids = new Set();
  const p = prefix.replace('-', '\\-');
  const range = new RegExp(`\\b${p}(${digits})\\s*(?:\\.\\.|…|–)\\s*(?:${p})?(${digits})\\b`, 'g');
  for (const m of line.matchAll(range)) {
    const [a, b] = [Number(m[1]), Number(m[2])];
    if (b >= a && b - a <= 200) for (let n = a; n <= b; n++) ids.add(`${prefix}${pad(n)}`);
  }
  const slash = new RegExp(`\\b${p}(${digits})((?:/\\d{2})+)`, 'g');
  for (const m of line.matchAll(slash)) {
    ids.add(`${prefix}${m[1]}`);
    for (const n of m[2].split('/').filter(Boolean)) ids.add(`${prefix}${n}`);
  }
  for (const m of line.matchAll(new RegExp(`\\b${p}(${digits})[a-z]?\\b`, 'g')))
    ids.add(`${prefix}${m[1]}`);
  return ids;
}

function mdFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...mdFiles(full));
    else if (entry.name.endsWith('.md')) out.push(full);
  }
  return out;
}

function rowIds(file, prefix) {
  const ids = new Set();
  if (!fs.existsSync(file)) return ids;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(new RegExp(`^\\|\\s*(${prefix}\\d{2,3})\\s*\\|`));
    if (m) ids.add(m[1]);
  }
  return ids;
}

// Lines of a top-level bullet "- <Name>:" including its indented continuation lines.
function bulletLines(lines, names) {
  const out = [];
  let on = false;
  lines.forEach((line, i) => {
    const top = line.match(/^- ([A-Za-z][A-Za-z &]*?)(?: \([^)]*\))?:/);
    if (top) on = names.includes(top[1]);
    else if (!/^\s/.test(line) && line.trim() !== '') on = false;
    if (on) out.push({ line, n: i + 1 });
  });
  return out;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const root = args.root;
  const invDir = path.join(root, 'screen-inventory');
  const conDir = path.join(root, 'view-data-contracts');
  const rel = (f) =>
    path
      .relative(path.join(root, '..', '..'), f)
      .split(path.sep)
      .join('/');
  const findings = [];

  const contracts = new Map();
  for (const f of fs.readdirSync(conDir)) {
    const m = f.match(/^([AOVC]-\d{2})[a-z]?-.*\.md$/);
    if (m) contracts.set(m[1], path.join(conDir, f));
  }
  const inventories = new Set();
  for (const f of fs.readdirSync(invDir)) {
    const m = f.match(/^(SCR-\d{2})-.*\.md$/);
    if (m) inventories.add(m[1]);
  }

  // R1: A/O/V/C ids cited in inventories and overlays.md must have a contract file.
  const r1Sources = [
    ...fs
      .readdirSync(invDir)
      .filter((f) => f.endsWith('.md'))
      .map((f) => path.join(invDir, f)),
  ];
  const overlays = path.join(root, 'overlays.md');
  if (fs.existsSync(overlays)) r1Sources.push(overlays);
  for (const file of r1Sources) {
    fs.readFileSync(file, 'utf8')
      .split(/\r?\n/)
      .forEach((line, i) => {
        for (const prefix of ['A-', 'O-', 'V-', 'C-']) {
          for (const id of idsInLine(line, prefix, '\\d{2}')) {
            if (!contracts.has(id))
              findings.push(`${rel(file)}:${i + 1}: R1 ${id} is cited but has no contract file`);
          }
        }
      });
  }

  // R4: "<Id> <METHOD> /api/v1/<path>" cited in an inventory or overlays.md must match the contract's Endpoint
  // (method + path, query string and trailing punctuation ignored; ":param" names ignored).
  const endpointOf = new Map();
  const normPath = (p) =>
    p
      .split('?')[0]
      .replace(/[`),.;]+$/, '')
      .replace(/:[A-Za-z]+/g, ':p');
  for (const [id, file] of contracts) {
    const line = fs
      .readFileSync(file, 'utf8')
      .split(/\r?\n/)
      .find((l) => l.startsWith('- Endpoint:'));
    const m = line?.match(/(GET|POST|PUT|PATCH|DELETE)\s+(\/api\/v1\/[^\s`]*)/);
    if (m) endpointOf.set(id, `${m[1]} ${normPath(m[2])}`);
  }
  for (const file of r1Sources) {
    fs.readFileSync(file, 'utf8')
      .split(/\r?\n/)
      .forEach((line, i) => {
        for (const m of line.matchAll(
          /\b([AOVC]-\d{2})`?\s+`?(GET|POST|PUT|PATCH|DELETE)\s+(\/api\/v1\/[^\s`]*)/g,
        )) {
          const cited = `${m[2]} ${normPath(m[3])}`;
          const expected = endpointOf.get(m[1]);
          if (expected && cited !== expected)
            findings.push(
              `${rel(file)}:${i + 1}: R4 ${m[1]} cited as "${cited}" but the contract says "${expected}"`,
            );
        }
      });
  }

  // R2: SCR ids in a contract's Screens / Triggered from bullet must have an inventory file.
  for (const [, file] of contracts) {
    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
    for (const { line, n } of bulletLines(lines, ['Screens', 'Triggered from'])) {
      for (const id of idsInLine(line, 'SCR-', '\\d{2}')) {
        if (!inventories.has(id))
          findings.push(`${rel(file)}:${n}: R2 ${id} has no screen-inventory file`);
      }
    }
  }

  // R3: OQ / CF ids cited anywhere in docs/design must have a row. The consistency report itself is skipped: it quotes
  // the non-existent ids used by the mutation tests on purpose.
  const oqRows = rowIds(path.join(root, 'open-questions.md'), 'OQ-');
  const cfRows = rowIds(path.join(root, 'conflicts.md'), 'CF-');
  const report = path.join(root, 'consistency-report.md');
  for (const file of mdFiles(root).filter((f) => f !== report)) {
    fs.readFileSync(file, 'utf8')
      .split(/\r?\n/)
      .forEach((line, i) => {
        for (const id of idsInLine(line, 'OQ-', '\\d{2}'))
          if (!oqRows.has(id))
            findings.push(`${rel(file)}:${i + 1}: R3 ${id} has no row in open-questions.md`);
        for (const id of idsInLine(line, 'CF-', '\\d{2,3}'))
          if (!cfRows.has(id))
            findings.push(`${rel(file)}:${i + 1}: R3 ${id} has no row in conflicts.md`);
      });
  }

  for (const f of findings) console.error(f);
  console.log(
    `design consistency: ${findings.length} finding(s) — ${contracts.size} contracts, ${inventories.size} inventories, ` +
      `${oqRows.size} OQ rows, ${cfRows.size} CF rows`,
  );

  if (args.fields) fieldReport(root, invDir, contracts, rel);
  return findings.length ? 1 : 0;
}

// Informational: backticked camelCase names in inventory "Data fields" lines that cite a V-/A- id, missing from that
// contract's JSON keys.
function fieldReport(root, invDir, contracts, rel) {
  const keysOf = new Map();
  const collect = (value, keys) => {
    if (Array.isArray(value)) value.forEach((v) => collect(v, keys));
    else if (value && typeof value === 'object')
      for (const [k, v] of Object.entries(value)) {
        keys.add(k);
        collect(v, keys);
      }
  };
  for (const [id, file] of contracts) {
    const block = fs.readFileSync(file, 'utf8').match(/```json\s*\n([\s\S]*?)\n\s*```/);
    const keys = new Set();
    try {
      if (block) collect(JSON.parse(block[1]), keys);
    } catch {
      /* unparsable blocks are reported by the contract checkers */
    }
    keysOf.set(id, keys);
  }
  let hints = 0;
  for (const f of fs.readdirSync(invDir).filter((x) => x.endsWith('.md'))) {
    const file = path.join(invDir, f);
    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
    let current = null;
    for (const { line, n } of bulletLines(lines, ['Data fields'])) {
      const cited = [...idsInLine(line, 'V-', '\\d{2}'), ...idsInLine(line, 'A-', '\\d{2}')];
      if (cited.length) current = cited[0];
      if (!current || !keysOf.has(current)) continue;
      for (const m of line.matchAll(/`([a-z][A-Za-z0-9]*)`/g)) {
        if (!keysOf.get(current).has(m[1])) {
          hints++;
          console.log(`${rel(file)}:${n}: info ${current} has no JSON key "${m[1]}"`);
        }
      }
    }
  }
  console.log(`data-fields report: ${hints} hint(s) (informational, not a gate)`);
}

try {
  process.exitCode = main();
} catch (error) {
  console.error(`FAIL: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
