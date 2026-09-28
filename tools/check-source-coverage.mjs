#!/usr/bin/env node
/**
 * Gate-1 source coverage check (brief prompt_Start_Eco.md L182).
 *
 * Validates docs/design/source-files-index.md against the two source folders:
 *   - every file under the two folders has exactly one row;
 *   - no row points at a file that does not exist;
 *   - Classification is design | data | requirements | asset | not-relevant | duplicate-of `<listed path>`;
 *   - not-relevant and duplicate rows carry a Reason;
 *   - every "Used in" path exists in this repository.
 *
 * Usage: node tools/check-source-coverage.mjs [indexPath]
 *   SOURCE_ROOT (env) = folder that holds the two source folders; default ".." (the parent of the repository).
 *   From a git worktree pass it explicitly, e.g. SOURCE_ROOT=D:/Personal/Eco-Comparador.
 * Exit codes: 0 = complete, 1 = errors, 2 = source folders not found (index structure validated only).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const indexPath = path.resolve(
  process.argv[2] ?? path.join(repoRoot, 'docs', 'design', 'source-files-index.md'),
);
const sourceRoot = path.resolve(repoRoot, process.env.SOURCE_ROOT ?? '..');
const SOURCE_FOLDERS = ['Paquete_de_Pantallas_24_08_2026', 'V2 _CUAN_ECO_Comparador 2'];
const CLASSES = new Set(['design', 'data', 'requirements', 'asset', 'not-relevant']);
const HEADER = ['Path', 'Kind', 'Classification', 'Used in', 'Reason'];

const errors = [];
const fail = (msg) => errors.push(msg);
const norm = (s) => s.normalize('NFC');

let text;
try {
  text = fs.readFileSync(indexPath, 'utf8');
} catch (err) {
  console.error(`Cannot read index ${indexPath}: ${err.message}`);
  process.exit(1);
}

// Split a Markdown table row on unescaped pipes.
const cells = (line) =>
  line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split(/(?<!\\)\|/)
    .map((c) => c.trim().replace(/\\\|/g, '|'));

const lines = text.split(/\r?\n/);
const headerIdx = lines.findIndex((l) => /^\|\s*Path\s*\|/.test(l));
if (headerIdx < 0) {
  console.error('Index has no table header row starting with "| Path |".');
  process.exit(1);
}
const header = cells(lines[headerIdx]);
if (header.join('|') !== HEADER.join('|')) {
  fail(`Header must be | ${HEADER.join(' | ')} | (found | ${header.join(' | ')} |)`);
}

const rows = new Map(); // path -> { line, classification, dupOf }
for (let i = headerIdx + 2; i < lines.length; i += 1) {
  const line = lines[i];
  if (!line.trim().startsWith('|')) break;
  const n = i + 1;
  const c = cells(line);
  if (c.length !== HEADER.length) {
    fail(`L${n}: expected ${HEADER.length} cells, found ${c.length}`);
    continue;
  }
  const [pathCell, kind, classification, usedIn, reason] = c;
  const pm = pathCell.match(/^`([^`]+)`$/);
  if (!pm) {
    fail(`L${n}: Path must be a single backticked path`);
    continue;
  }
  const file = norm(pm[1]);
  if (!SOURCE_FOLDERS.some((f) => file.startsWith(`${f}/`)))
    fail(`L${n}: ${file} is outside the two source folders`);
  if (rows.has(file)) fail(`L${n}: ${file} is listed twice (first at L${rows.get(file).line})`);
  if (!kind) fail(`L${n}: ${file} has no Kind`);

  let dupOf = null;
  const dm = classification.match(/^duplicate-of `([^`]+)`$/);
  if (dm) dupOf = norm(dm[1]);
  else if (!CLASSES.has(classification))
    fail(`L${n}: ${file} has an invalid Classification "${classification}"`);
  if (
    (dupOf || classification === 'not-relevant') &&
    (!reason || reason === '—' || reason === '-')
  ) {
    fail(`L${n}: ${file} is ${dupOf ? 'a duplicate' : 'not-relevant'} but has no Reason`);
  }

  if (usedIn !== '—') {
    const listed = usedIn.replace(/\s*\(\+\d+ more\)$/, '');
    const refs = [...listed.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
    const rest = listed.replace(/`[^`]+`/g, '').replace(/[,\s]/g, '');
    if (!refs.length || rest)
      fail(`L${n}: Used in must be "—" or backticked repo paths (+ optional "(+n more)")`);
    for (const ref of refs) {
      if (!fs.existsSync(path.join(repoRoot, ref)))
        fail(`L${n}: Used in path does not exist in the repo: ${ref}`);
    }
  }
  rows.set(file, { line: n, classification, dupOf });
}

for (const [file, row] of rows) {
  if (row.dupOf && !rows.has(row.dupOf))
    fail(`L${row.line}: ${file} is a duplicate of an unlisted path: ${row.dupOf}`);
  if (row.dupOf === file) fail(`L${row.line}: ${file} is a duplicate of itself`);
}

const totals = text.match(/^Totals: (\d+) files/m);
if (totals && Number(totals[1]) !== rows.size)
  fail(`Totals line says ${totals[1]} files but the table has ${rows.size} rows`);

const present = SOURCE_FOLDERS.filter((f) => fs.existsSync(path.join(sourceRoot, f)));
if (present.length !== SOURCE_FOLDERS.length) {
  for (const e of errors) console.error(`ERROR ${e}`);
  console.log(
    `Source folders not found under ${sourceRoot} (${SOURCE_FOLDERS.filter((f) => !present.includes(f)).join(', ')}); ` +
      `validated the index structure only: ${rows.size} rows, ${errors.length} error(s). Set SOURCE_ROOT to check coverage.`,
  );
  process.exit(errors.length ? 1 : 2);
}

const onDisk = [];
const walk = (rel) => {
  for (const e of fs.readdirSync(path.join(sourceRoot, rel), {
    withFileTypes: true,
  })) {
    const child = `${rel}/${e.name}`;
    if (e.isDirectory()) walk(child);
    else onDisk.push(norm(child));
  }
};
for (const f of SOURCE_FOLDERS) walk(f);
const diskSet = new Set(onDisk);
for (const f of onDisk) if (!rows.has(f)) fail(`missing from the index: ${f}`);
for (const f of rows.keys()) if (!diskSet.has(f)) fail(`listed but not on disk: ${f}`);

for (const e of errors) console.error(`ERROR ${e}`);
const byClass = {};
for (const r of rows.values()) {
  const k = r.dupOf ? 'duplicate' : r.classification;
  byClass[k] = (byClass[k] ?? 0) + 1;
}
console.log(
  `Source files found: ${onDisk.length} (${SOURCE_FOLDERS.map((f) => `${f}: ${onDisk.filter((x) => x.startsWith(`${f}/`)).length}`).join(', ')}); ` +
    `index rows: ${rows.size}; ${Object.entries(byClass)
      .map(([k, v]) => `${k} ${v}`)
      .join(', ')}; errors: ${errors.length}`,
);
process.exit(errors.length ? 1 : 0);
