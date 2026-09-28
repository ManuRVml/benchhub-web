#!/usr/bin/env node
// Checks that every hex colour of the synthesis design-token section exists in design-tokens.json.
//
// Usage: node tools/tokens/check-synthesis-hex.mjs <synthesis.md> [--tokens <path>] [--from <line>] [--to <line>]
// Defaults: --tokens docs/design/design-tokens.json (relative to the repo root), --from 559, --to 689.
// Exit codes: 0 all hex values found, 1 missing hex values or unresolved {references}, 2 usage or I/O error.
//
// A hex counts as present when it appears in a token $value (including composite values such as shadow or
// gradient stops), in $extensions.eco.css or in $extensions.eco.prototypeValue (a prototype colour replaced by a
// documented decision, e.g. CF-138). #RGB is expanded to #RRGGBB and the comparison is case-insensitive.
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HEX = /(?<![0-9A-Za-z&])#([0-9A-Fa-f]{8}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})(?![0-9A-Za-z])/g;
const REF = /\{([A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)*)\}/g;
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

function fail(message) {
  console.error(message);
  process.exit(2);
}

function parseArgs(argv) {
  const opts = {
    tokens: resolve(repoRoot, 'docs/design/design-tokens.json'),
    from: 559,
    to: 689,
    md: null,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--tokens') opts.tokens = resolve(argv[++i] ?? fail('--tokens needs a path'));
    else if (arg === '--from') opts.from = Number(argv[++i]);
    else if (arg === '--to') opts.to = Number(argv[++i]);
    else if (arg.startsWith('--')) fail(`Unknown option ${arg}`);
    else if (!opts.md) opts.md = resolve(arg);
    else fail(`Unexpected argument ${arg}`);
  }
  if (!opts.md)
    fail(
      'Usage: node tools/tokens/check-synthesis-hex.mjs <synthesis.md> [--tokens <path>] [--from <line>] [--to <line>]',
    );
  if (
    !Number.isInteger(opts.from) ||
    !Number.isInteger(opts.to) ||
    opts.from < 1 ||
    opts.to < opts.from
  ) {
    fail(`Invalid line range ${opts.from}-${opts.to}`);
  }
  return opts;
}

function normalize(hex) {
  const h = hex.replace('#', '').toUpperCase();
  return '#' + (h.length === 3 ? [...h].map((ch) => ch + ch).join('') : h);
}

function read(path) {
  try {
    return readFileSync(path, 'utf8');
  } catch (err) {
    return fail(`Cannot read ${path}: ${err.message}`);
  }
}

function collectTokens(node, path, out) {
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith('$') || value === null || typeof value !== 'object') continue;
    const tokenPath = path ? `${path}.${key}` : key;
    if ('$value' in value) out.set(tokenPath, value);
    else collectTokens(value, tokenPath, out);
  }
  return out;
}

const opts = parseArgs(process.argv.slice(2));
const lines = read(opts.md).split(/\r?\n/);
if (lines.length < opts.to)
  fail(`${opts.md} has ${lines.length} lines, expected at least ${opts.to}`);

let tokensJson;
try {
  tokensJson = JSON.parse(read(opts.tokens));
} catch (err) {
  fail(`Invalid JSON in ${opts.tokens}: ${err.message}`);
}

const tokens = collectTokens(tokensJson, '', new Map());
const available = new Set();
const unresolved = [];
for (const [path, token] of tokens) {
  const valueText = JSON.stringify(token.$value);
  const cssText = token.$extensions?.eco?.css ?? '';
  // A prototype colour replaced by a documented decision (e.g. CF-138 contrast) is kept in prototypeValue.
  const prototypeText = token.$extensions?.eco?.prototypeValue ?? '';
  for (const m of `${valueText} ${cssText} ${prototypeText}`.matchAll(HEX))
    available.add(normalize(m[0]));
  for (const m of valueText.matchAll(REF))
    if (!tokens.has(m[1])) unresolved.push(`${path} -> {${m[1]}}`);
}

const wanted = new Map();
for (let n = opts.from; n <= opts.to; n++) {
  for (const m of lines[n - 1].matchAll(HEX)) {
    const hex = normalize(m[0]);
    if (!wanted.has(hex)) wanted.set(hex, []);
    wanted.get(hex).push(n);
  }
}

const missing = [...wanted].filter(([hex]) => !available.has(hex));
for (const [hex, at] of missing)
  console.log(`MISSING ${hex} (lines ${[...new Set(at)].join(', ')})`);
for (const entry of unresolved) console.log(`UNRESOLVED ${entry}`);
console.log(
  `${wanted.size} distinct hex in ${opts.md} lines ${opts.from}-${opts.to}; ${wanted.size - missing.length} found in ` +
    `${tokens.size} tokens; ${missing.length} missing; ${unresolved.length} unresolved references`,
);
process.exit(missing.length || unresolved.length ? 1 : 0);
