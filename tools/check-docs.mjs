#!/usr/bin/env node
// Checks the architecture documents in docs/architecture/*.md (P7-03a):
// - every ```mermaid block is non-empty and starts with a known diagram keyword;
// - every backticked repository path exists, unless its line says "(planned)".
// A backticked token counts as a repository path when it has no spaces, contains a "/", has no placeholder (<name>, *,
// {…}) and its first segment is an entry of the repository root (src/, docs/, tools/, …) or a planned root folder
// (e2e/, .storybook/). URL paths (/api/v1/*), npm package names (react-dom/client), aliases (@/shared) and rule ids
// (boundaries/dependencies) are therefore not paths. Paths resolve from the repository root.
// Usage: node tools/check-docs.mjs [--root <repo root>]   Exit 0 when clean, 1 otherwise. No dependencies.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const MERMAID_KEYWORDS = ['C4Context', 'C4Container', 'flowchart', 'graph', 'sequenceDiagram'];
const PLANNED_ROOTS = ['e2e', '.storybook'];

const args = process.argv.slice(2);
const rootIndex = args.indexOf('--root');
const root =
  rootIndex >= 0 && args[rootIndex + 1]
    ? resolve(args[rootIndex + 1])
    : resolve(dirname(fileURLToPath(import.meta.url)), '..');
const docsDir = join(root, 'docs', 'architecture');
const rootEntries = new Set([
  ...readdirSync(root).filter((name) => name !== 'node_modules' && name !== '.git'),
  ...PLANNED_ROOTS,
]);

/** @param {string} token */
function isRepoPath(token) {
  return (
    !/\s/.test(token) &&
    token.includes('/') &&
    !/[<>*{}|]/.test(token) &&
    rootEntries.has(token.split('/')[0] ?? '')
  );
}

/**
 * @param {string} file
 * @param {string} text
 * @returns {string[]}
 */
function checkMermaid(file, text) {
  const errors = [];
  const lines = text.split('\n');
  let blockStart = -1;
  /** @type {string[]} */
  let body = [];
  lines.forEach((line, i) => {
    if (blockStart < 0 && /^```mermaid\s*$/.test(line.trim())) {
      blockStart = i + 1;
      body = [];
    } else if (blockStart >= 0 && line.trim().startsWith('```')) {
      const first = body.map((l) => l.trim()).find((l) => l !== '' && !l.startsWith('%%'));
      if (first === undefined) {
        errors.push(`${file}:${String(blockStart)} empty mermaid block`);
      } else if (!MERMAID_KEYWORDS.some((k) => first === k || first.startsWith(`${k} `))) {
        errors.push(
          `${file}:${String(blockStart)} mermaid block starts with "${first}", expected one of ${MERMAID_KEYWORDS.join(', ')}`,
        );
      }
      blockStart = -1;
    } else if (blockStart >= 0) {
      body.push(line);
    }
  });
  if (blockStart >= 0) errors.push(`${file}:${String(blockStart)} unterminated mermaid block`);
  return errors;
}

/**
 * @param {string} file
 * @param {string} text
 * @returns {{ errors: string[], checked: number }}
 */
function checkPaths(file, text) {
  const errors = [];
  let checked = 0;
  let inFence = false;
  text.split('\n').forEach((line, i) => {
    if (line.trim().startsWith('```')) {
      inFence = !inFence;
      return;
    }
    if (inFence || line.includes('(planned')) return;
    for (const match of line.matchAll(/`([^`]+)`/g)) {
      const token = match[1] ?? '';
      if (!isRepoPath(token)) continue;
      checked++;
      if (!existsSync(join(root, token.replace(/\/$/, '')))) {
        errors.push(`${file}:${String(i + 1)} path does not exist: ${token}`);
      }
    }
  });
  return { errors, checked };
}

if (!existsSync(docsDir)) {
  console.error(`missing ${docsDir}`);
  process.exit(1);
}
const files = readdirSync(docsDir)
  .filter((f) => f.endsWith('.md'))
  .sort();
const errors = [];
let blocks = 0;
let paths = 0;
for (const name of files) {
  const file = `docs/architecture/${name}`;
  const text = readFileSync(join(docsDir, name), 'utf8');
  blocks += (text.match(/^```mermaid\s*$/gm) ?? []).length;
  errors.push(...checkMermaid(file, text));
  const result = checkPaths(file, text);
  paths += result.checked;
  errors.push(...result.errors);
}
console.log(
  `check-docs: ${String(files.length)} files, ${String(blocks)} mermaid blocks, ${String(paths)} repo paths checked`,
);
for (const error of errors) console.log(`FAIL ${error}`);
process.exit(errors.length ? 1 : 0);
