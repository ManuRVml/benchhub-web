#!/usr/bin/env node
// Checks AGENTS.md (P2-W09, brief §6).
//
//   node tools/check-agents-md.mjs                  check AGENTS.md at the repo root
//   node tools/check-agents-md.mjs --file <path>    check another copy (mutation tests); paths still resolve from the repo
//
// Fails (exit 1) when:
// - the "## Rules" section does not number its rules exactly 1..15, in order, once each;
// - the headings "## Where does this file go?" or "## Definition of Done" are missing;
// - a repo path written in backticks outside fenced code blocks does not exist, unless it is followed by "(planned".
//   A backticked token is a repo path when it contains "/" or is a root file name with an extension, has no spaces, and
//   has no placeholder or glob characters (< > * { } $); tokens starting with "@" (npm scopes, Tailwind directives) and
//   URLs are not paths.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REQUIRED_HEADINGS = ['## Where does this file go?', '## Definition of Done'];
const RULE_COUNT = 15;

function parseArgs(argv) {
  const i = argv.indexOf('--file');
  if (i === -1) return path.join(REPO_ROOT, 'AGENTS.md');
  if (!argv[i + 1]) throw new Error('--file needs a path');
  return path.resolve(argv[i + 1]);
}

/** Numbers of the top-level ordered-list items between "## Rules" and the next "## " heading. */
function ruleNumbers(lines) {
  const start = lines.findIndex((l) => l.trim() === '## Rules');
  if (start === -1) return null;
  const numbers = [];
  for (const line of lines.slice(start + 1)) {
    if (line.startsWith('## ')) break;
    const m = line.match(/^(\d{1,2})\. \S/);
    if (m) numbers.push(Number(m[1]));
  }
  return numbers;
}

/** Backticked tokens outside fenced code blocks, with their line numbers and whether "(planned" follows. */
function backtickedTokens(lines) {
  const tokens = [];
  let inFence = false;
  lines.forEach((line, i) => {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      return;
    }
    if (inFence) return;
    for (const m of line.matchAll(/`([^`]+)`(\s*\(planned)?/g)) {
      tokens.push({ token: m[1].trim(), planned: Boolean(m[2]), line: i + 1 });
    }
  });
  return tokens;
}

function isRepoPath(token) {
  if (!token || /\s/.test(token) || /[<>*{}$]/.test(token)) return false;
  if (token.startsWith('@') || /^[a-z]+:\/\//i.test(token)) return false;
  return token.includes('/') || /^\.?[\w.-]+\.[a-z]{2,5}$/i.test(token);
}

function check(file) {
  const problems = [];
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);

  const numbers = ruleNumbers(lines);
  if (numbers === null) problems.push('missing "## Rules" heading');
  else {
    const expected = Array.from({ length: RULE_COUNT }, (_, k) => k + 1);
    if (numbers.join(',') !== expected.join(',')) {
      problems.push(
        `rules must be numbered 1..${RULE_COUNT} in order, found: ${numbers.join(', ') || 'none'}`,
      );
    }
  }

  for (const heading of REQUIRED_HEADINGS) {
    if (!lines.some((l) => l.trim() === heading)) problems.push(`missing heading "${heading}"`);
  }

  let checked = 0;
  for (const { token, planned, line } of backtickedTokens(lines)) {
    if (planned || !isRepoPath(token)) continue;
    checked++;
    if (!fs.existsSync(path.join(REPO_ROOT, token))) {
      problems.push(
        `line ${line}: path \`${token}\` does not exist (mark it "(planned, <task>)" if it is future work)`,
      );
    }
  }
  return { problems, checked };
}

try {
  const file = parseArgs(process.argv.slice(2));
  const { problems, checked } = check(file);
  for (const p of problems) console.error(`FAIL ${path.basename(file)}: ${p}`);
  console.log(
    `AGENTS.md check: ${problems.length} problem(s); ${checked} backticked repo path(s) verified`,
  );
  process.exitCode = problems.length ? 1 : 0;
} catch (error) {
  console.error(`FAIL: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
