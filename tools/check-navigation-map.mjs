#!/usr/bin/env node
/**
 * Checks docs/design/navigation-map.md against the screen inventories (P1-21).
 *   - every SCR-01..SCR-17 has at least one row in the route table (section 1);
 *   - for each SCR, the first code span of its first route row equals the first code span of the
 *     `- Proposed route:` line of docs/design/screen-inventory/SCR-NN-*.md;
 *   - every SCR has exactly one row in the role × screen matrix (section 3), and every matrix row has a
 *     Source cell naming an existing SCR inventory file (`SCR-NN-*.md`) of the same SCR.
 *
 * Usage: node tools/check-navigation-map.mjs [mapPath]
 * Exit codes: 0 = consistent, 1 = errors.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mapPath = path.resolve(
  process.argv[2] ?? path.join(repoRoot, 'docs', 'design', 'navigation-map.md'),
);
const inventoryDir = path.join(repoRoot, 'docs', 'design', 'screen-inventory');
const SCR_IDS = Array.from({ length: 17 }, (_, i) => `SCR-${String(i + 1).padStart(2, '0')}`);

const errors = [];
const fail = (msg) => errors.push(msg);

// First code span of a Markdown fragment; `\|` inside table cells is an escaped pipe.
const firstCode = (s) => {
  const m = s.match(/`([^`]*)`/);
  return m ? m[1].replace(/\\\|/g, '|') : null;
};
const cells = (line) =>
  line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split(/(?<!\\)\|/)
    .map((c) => c.trim());

// Rows of the first table after a "## <n>." heading.
const tableRows = (lines, sectionNo) => {
  const start = lines.findIndex((l) => new RegExp(`^## ${sectionNo}\\.`).test(l));
  if (start < 0) return null;
  const rows = [];
  let header = null;
  for (let i = start + 1; i < lines.length; i += 1) {
    const l = lines[i];
    if (/^## /.test(l)) break;
    if (!l.trim().startsWith('|')) {
      if (header) break;
      continue;
    }
    if (!header) header = cells(l);
    else if (!/^\|\s*-/.test(l)) rows.push({ line: i + 1, c: cells(l) });
  }
  return header ? { header, rows } : null;
};

let text;
try {
  text = fs.readFileSync(mapPath, 'utf8');
} catch (err) {
  console.error(`Cannot read ${mapPath}: ${err.message}`);
  process.exit(1);
}
const lines = text.split(/\r?\n/);

// Inventory routes.
const inventory = new Map(); // SCR id -> { file, route }
for (const f of fs.readdirSync(inventoryDir)) {
  const m = f.match(/^(SCR-\d{2})-[a-z0-9-]+\.md$/);
  if (!m) continue;
  const routeLine = fs
    .readFileSync(path.join(inventoryDir, f), 'utf8')
    .split(/\r?\n/)
    .find((l) => l.startsWith('- Proposed route:'));
  inventory.set(m[1], { file: f, route: routeLine ? firstCode(routeLine) : null });
}
for (const id of SCR_IDS) {
  if (!inventory.has(id)) fail(`${id}: no inventory file in docs/design/screen-inventory/`);
  else if (!inventory.get(id).route)
    fail(`${id}: ${inventory.get(id).file} has no code span on its "- Proposed route:" line`);
}

// Section 1: route table.
const routes = tableRows(lines, 1);
if (!routes) fail('Section "## 1." with a route table not found');
else {
  const iRoute = routes.header.indexOf('Route');
  const iScr = routes.header.indexOf('SCR');
  if (iRoute < 0 || iScr < 0) fail('Route table needs "Route" and "SCR" columns');
  else {
    for (const id of SCR_IDS) {
      const rows = routes.rows.filter((r) => r.c[iScr] === id);
      if (!rows.length) {
        fail(`${id}: missing from the route table`);
        continue;
      }
      const expected = inventory.get(id)?.route;
      const got = firstCode(rows[0].c[iRoute] ?? '');
      if (expected && got !== expected)
        fail(`${id} (L${rows[0].line}): route "${got}" ≠ inventory first code span "${expected}"`);
    }
  }
}

// Section 3: role × screen matrix.
const matrix = tableRows(lines, 3);
if (!matrix) fail('Section "## 3." with the role × screen matrix not found');
else {
  const iScr = matrix.header.indexOf('SCR');
  const iSource = matrix.header.indexOf('Source');
  if (iScr < 0 || iSource < 0) fail('Role × screen matrix needs "SCR" and "Source" columns');
  else {
    const seen = new Map();
    for (const r of matrix.rows) {
      const id = r.c[iScr];
      const source = firstCode(r.c[iSource] ?? '');
      if (!source) fail(`L${r.line}: matrix row ${id || '(no SCR)'} has no Source`);
      else if (!fs.existsSync(path.join(inventoryDir, source)))
        fail(`L${r.line}: Source ${source} does not exist in docs/design/screen-inventory/`);
      else if (!source.startsWith(`${id}-`))
        fail(`L${r.line}: Source ${source} is not the inventory of ${id}`);
      seen.set(id, (seen.get(id) ?? 0) + 1);
    }
    for (const id of SCR_IDS) {
      if (!seen.has(id)) fail(`${id}: missing from the role × screen matrix`);
      else if (seen.get(id) > 1) fail(`${id}: ${seen.get(id)} rows in the role × screen matrix`);
    }
  }
}

for (const e of errors) console.error(`ERROR ${e}`);
console.log(
  `navigation-map: ${SCR_IDS.length} screens checked; route rows ${routes?.rows.length ?? 0}, matrix rows ${matrix?.rows.length ?? 0}; errors: ${errors.length}`,
);
process.exit(errors.length ? 1 : 0);
