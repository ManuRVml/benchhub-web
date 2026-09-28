#!/usr/bin/env node
// Verifies docs/design/component-catalog.md against the screen inventories (P1-17).
// - Every `Cmp:Name` tag in the inventories must have a row in the "Tag mapping" table.
// - Every mapped canonical name must have a `### <Name>` section in the catalogue.
// - A row whose canonical cell starts with "—" is a documented placeholder (not a component).
// Usage: node tools/check-component-catalog.mjs [--inventory <dir>] [--catalog <file>]
// Exit 0 when consistent, 1 otherwise. No dependencies.
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? resolve(args[i + 1]) : fallback;
};
const inventoryDir = arg('--inventory', join(root, 'docs/design/screen-inventory'));
const catalogFile = arg('--catalog', join(root, 'docs/design/component-catalog.md'));

const tags = new Map(); // tag -> Set(files)
for (const file of readdirSync(inventoryDir)
  .filter((f) => f.endsWith('.md'))
  .sort()) {
  for (const m of readFileSync(join(inventoryDir, file), 'utf8').matchAll(/Cmp:([A-Za-z0-9]+)/g)) {
    if (!tags.has(m[1])) tags.set(m[1], new Set());
    tags.get(m[1]).add(file);
  }
}

const catalog = readFileSync(catalogFile, 'utf8');
const sections = new Set([...catalog.matchAll(/^### (.+?)\s*$/gm)].map((m) => m[1]));
const mapping = new Map(); // tag -> canonical cell
const errors = [];
for (const m of catalog.matchAll(/^\| `Cmp:([A-Za-z0-9]+)` \| (.+?) \|\s*$/gm)) {
  if (mapping.has(m[1])) errors.push(`duplicate mapping row for Cmp:${m[1]}`);
  mapping.set(m[1], m[2].trim());
}

for (const [tag, files] of tags) {
  if (!mapping.has(tag))
    errors.push(`Cmp:${tag} (${[...files].join(', ')}) has no row in the mapping table`);
}
let placeholders = 0;
for (const [tag, canonical] of mapping) {
  if (canonical.startsWith('—')) {
    placeholders++;
    continue;
  }
  if (!sections.has(canonical))
    errors.push(`Cmp:${tag} maps to "${canonical}", which has no "### ${canonical}" section`);
}
const canonicalUsed = new Set([...mapping.values()].filter((c) => !c.startsWith('—')));
const orphanRows = [...mapping.keys()].filter((t) => !tags.has(t));

console.log(
  `inventory tags: ${tags.size}; mapped: ${[...tags.keys()].filter((t) => mapping.has(t)).length}; ` +
    `placeholders: ${placeholders}; canonical components referenced: ${canonicalUsed.size}; ### sections: ${sections.size}`,
);
if (orphanRows.length)
  console.log(
    `note: ${orphanRows.length} mapping row(s) without an inventory tag: ${orphanRows.join(', ')}`,
  );
for (const e of errors) console.log(`FAIL ${e}`);
process.exit(errors.length ? 1 : 0);
