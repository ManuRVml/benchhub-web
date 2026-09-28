#!/usr/bin/env node
// Checks the view, session and operation contracts (A-, O-, V- files) under docs/design/view-data-contracts/.
// Command contracts (C- files) use another template and are checked by tools/check-command-contracts.mjs.
//
//   node tools/check-view-contracts.mjs               check the repo folder
//   node tools/check-view-contracts.mjs --dir <path>  check another folder (negative controls)
//
// A file fails when:
// - its name is not `<Id>-<kebab-name>.md` with Id = A-nn | O-nn | V-nn (optional letter suffix);
// - the first line is not `# <Id> — <name>` with the same Id as the file name;
// - any required top-level bullet is missing or repeated (Endpoint, Screens, Params, Response, Raw vs derived,
//   Sections, Permissions, budgetBytes);
// - the Endpoint bullet does not start with an HTTP method and an `/api/v1/` path on its first line;
// - the Response bullet has no fenced ```json block, or the block does not parse;
// - budgetBytes is not a positive integer (an optional "(note)" may follow it; units like "2 KB" fail).
// Exit codes: 0 all files pass · 1 at least one problem (or no contract files found).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REQUIRED = [
  'Endpoint',
  'Screens',
  'Params',
  'Response',
  'Raw vs derived',
  'Sections',
  'Permissions',
  'budgetBytes',
];
const ID = '[AOV]-\\d{2}[a-z]?';

function parseArgs(argv) {
  const i = argv.indexOf('--dir');
  if (i === -1) return path.join(HERE, '..', 'docs', 'design', 'view-data-contracts');
  if (!argv[i + 1]) throw new Error('--dir needs a path');
  return path.resolve(argv[i + 1]);
}

// Top-level bullets: "- <Name>:" or "- <Name> (<qualifier>):" at column 0.
function topLevelBullets(lines) {
  const bullets = [];
  lines.forEach((line, index) => {
    const m = line.match(/^- ([A-Za-z][A-Za-z ]*?)(?: \([^)]*\))?:(.*)$/);
    if (m) bullets.push({ name: m[1].trim(), rest: m[2].trim(), index });
  });
  return bullets;
}

function checkFile(dir, file) {
  const problems = [];
  const fileMatch = file.match(new RegExp(`^(${ID})-[a-z0-9]+(?:-[a-z0-9]+)*\\.md$`));
  if (!fileMatch) problems.push('file name must be <Id>-<kebab-name>.md (Id = A-nn | O-nn | V-nn)');

  const lines = fs.readFileSync(path.join(dir, file), 'utf8').split(/\r?\n/);
  const heading = lines[0]?.match(new RegExp(`^# (${ID}) — \\S.*$`));
  if (!heading) problems.push('first line must be "# <Id> — <View/widget name>"');
  else if (fileMatch && heading[1] !== fileMatch[1])
    problems.push(`heading id ${heading[1]} differs from file id ${fileMatch[1]}`);

  const bullets = topLevelBullets(lines);
  for (const name of REQUIRED) {
    const found = bullets.filter((b) => b.name === name);
    if (found.length === 0) problems.push(`missing bullet "- ${name}:"`);
    if (found.length > 1) problems.push(`bullet "- ${name}:" appears ${found.length} times`);
  }

  const endpoint = bullets.find((b) => b.name === 'Endpoint');
  if (endpoint && !/^`?(GET|POST|PUT|PATCH|DELETE)\s+\/api\/v1\/\S+/.test(endpoint.rest)) {
    problems.push('Endpoint must start with "<METHOD> /api/v1/<path>" on its first line');
  }

  const response = bullets.find((b) => b.name === 'Response');
  if (response) {
    const next = bullets.find((b) => b.index > response.index);
    const body = lines.slice(response.index + 1, next ? next.index : lines.length).join('\n');
    const block = body.match(/```json\s*\n([\s\S]*?)\n\s*```/);
    if (!block) problems.push('Response has no fenced ```json block');
    else {
      try {
        JSON.parse(block[1]);
      } catch (error) {
        problems.push(`Response json does not parse: ${error.message}`);
      }
    }
  }

  const budget = bullets.find((b) => b.name === 'budgetBytes');
  if (budget) {
    // A plain integer, optionally followed by a parenthesised note: "512" or "512 (JSON error body only)".
    const value = budget.rest.match(/^`?(\d+)`?(?:\s+\(.*\))?$/);
    if (!value || !Number.isSafeInteger(Number(value[1])) || Number(value[1]) <= 0) {
      problems.push(`budgetBytes must be a positive integer, got "${budget.rest}"`);
    }
  }
  return problems;
}

try {
  const dir = parseArgs(process.argv.slice(2));
  if (!fs.existsSync(dir)) throw new Error(`folder not found: ${dir}`);
  const all = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .sort();
  const commands = all.filter((f) => /^C-\d{2}/.test(f));
  const files = all.filter((f) => !commands.includes(f));
  if (files.length === 0) throw new Error(`no contract files in ${dir}`);
  let failed = 0;
  for (const file of files) {
    const problems = checkFile(dir, file);
    if (problems.length) {
      failed++;
      for (const p of problems) console.error(`FAIL ${file}: ${p}`);
    }
  }
  console.log(
    `${files.length} contract file(s) checked, ${failed} failing ` +
      `(${commands.length} C- file(s) left to check-command-contracts.mjs)`,
  );
  process.exitCode = failed ? 1 : 0;
} catch (error) {
  console.error(`FAIL: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
