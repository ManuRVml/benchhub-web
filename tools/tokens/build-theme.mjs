#!/usr/bin/env node
// Generates src/app/styles/theme.css (Tailwind CSS v4 `@theme`) from docs/design/design-tokens.json (DTCG).
//
//   node tools/tokens/build-theme.mjs           write the generated files                  (pnpm tokens:build)
//   node tools/tokens/build-theme.mjs --check   regenerate in memory, exit 1 if a file differs (pnpm tokens:check)
//
// Generated files: src/app/styles/theme.css (the @theme block) and src/shared/lib/tailwind-theme.generated.ts (token
// names per Tailwind namespace, so tailwind-merge in cn() knows that `text-eyebrow` is a font size and
// `text-brand-primary` a colour). Options: --tokens <path> (or DESIGN_TOKENS_PATH) reads another token file.
// Exit codes: 0 ok · 1 a generated file is stale or the tokens are invalid · 2 usage / I/O error.
//
// Mapping (CSS names are the token path in kebab-case; every {reference} is resolved to its final value):
//   color                  → --color-<path>               (brand.primary → --color-brand-primary)
//   font.family.*          → --font-<name>                (fontsource-variable family first: "Roboto Variable")
//   font.weight.*          → --font-weight-<name>
//   font.lineHeight.*      → --leading-<name>
//   font.letterSpacing.*   → --tracking-<name>
//   size.font.*            → --text-<n>
//   font.role.*            → --text-<role> + --text-<role>--line-height / --letter-spacing / --font-weight
//   space.*                → --spacing-<path>
//   radius.*               → --radius-<name>
//   shadow.*               → --shadow-<name>
//   breakpoint.*           → --breakpoint-<name>
//   z.*, motion.*, gradient.*, size.* (non-font), focus.*, scrollbar.* (non-color) → plain custom properties on :root
// Tailwind's default colors, shadows, radii and breakpoints are reset (`--color-*: initial` …): tokens are the only
// values of those namespaces (ADR 0002).
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DEFAULT_TOKENS = resolve(REPO_ROOT, 'docs/design/design-tokens.json');
const CSS_OUT = resolve(REPO_ROOT, 'src/app/styles/theme.css');
const TS_OUT = resolve(REPO_ROOT, 'src/shared/lib/tailwind-theme.generated.ts');
const REF = /\{([A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)*)\}/g;

/** Fontsource variable packages register their families under these names (`@fontsource-variable/*`). */
const FONTSOURCE_FAMILY = { Roboto: 'Roboto Variable', 'Roboto Mono': 'Roboto Mono Variable' };
/** Tailwind namespaces whose defaults are dropped so only token values exist. */
const RESET_NAMESPACES = ['color', 'shadow', 'radius', 'breakpoint'];

const kebab = (segment) => segment.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const cssName = (path) => path.map(kebab).join('-');

/** Flattens the DTCG tree into [{ path: string[], token }] in document order. */
export function collectTokens(tree) {
  const out = [];
  (function walk(node, path) {
    for (const [key, value] of Object.entries(node)) {
      if (key.startsWith('$') || value === null || typeof value !== 'object') continue;
      if ('$value' in value) out.push({ path: [...path, key], token: value });
      else walk(value, [...path, key]);
    }
  })(tree, []);
  return out;
}

/** Returns a resolver that replaces every {reference} (recursively) with the referenced token's final value. */
export function createResolver(entries) {
  const byPath = new Map(entries.map((e) => [e.path.join('.'), e.token]));
  const resolveValue = (value, seen) => {
    if (typeof value === 'string') {
      const whole = /^\{([^}]+)\}$/.exec(value);
      if (whole) return resolvePath(whole[1], seen);
      return value.replace(REF, (_, ref) => String(resolvePath(ref, seen)));
    }
    if (Array.isArray(value)) return value.map((v) => resolveValue(v, seen));
    if (value && typeof value === 'object')
      return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, resolveValue(v, seen)]));
    return value;
  };
  const resolvePath = (path, seen = new Set()) => {
    if (seen.has(path)) throw new Error(`Reference cycle through {${path}}`);
    const token = byPath.get(path);
    if (!token) throw new Error(`Unresolved reference {${path}}`);
    return resolveValue(token.$value, new Set([...seen, path]));
  };
  return { resolvePath, resolveValue: (value) => resolveValue(value, new Set()) };
}

const quoteFamily = (name) => (/^[a-z-]+$/i.test(name) ? name : `'${name}'`);

function fontFamily(value) {
  const names = Array.isArray(value) ? value : [value];
  return names
    .flatMap((n) => (FONTSOURCE_FAMILY[n] ? [FONTSOURCE_FAMILY[n], n] : [n]))
    .map(quoteFamily)
    .join(', ');
}

function shadow(v) {
  return `${v.inset ? 'inset ' : ''}${v.offsetX} ${v.offsetY} ${v.blur} ${v.spread} ${v.color}`;
}

function gradient(stops, eco) {
  const list = stops.map((s, i) => {
    const color =
      i === 0 && eco.accentAlpha && /^#[0-9A-F]{6}$/i.test(s.color)
        ? `${s.color}${eco.accentAlpha}`
        : s.color;
    return `${color} ${Math.round(s.position * 100)}%`;
  });
  if (eco.shape?.startsWith('radial'))
    return `radial-gradient(${eco.shape.replace(/^radial\s+/, '')}, ${list.join(', ')})`;
  return `linear-gradient(${eco.angle ?? '180deg'}, ${list.join(', ')})`;
}

/** CSS text of a resolved token value. */
function cssValue(type, value, eco = {}) {
  switch (type) {
    case 'color':
    case 'dimension':
    case 'duration':
      return String(value);
    case 'number':
    case 'fontWeight':
      return String(value);
    case 'fontFamily':
      return fontFamily(value);
    case 'cubicBezier':
      return `cubic-bezier(${value.join(', ')})`;
    case 'shadow':
      return shadow(value);
    case 'gradient':
      return gradient(value, eco);
    case 'transition':
      return `${value.duration} ${Array.isArray(value.timingFunction) ? cssValue('cubicBezier', value.timingFunction) : value.timingFunction} ${value.delay}`;
    default:
      throw new Error(`Unsupported token type ${type}`);
  }
}

/** Maps one token to its CSS declarations: [{ scope: 'theme' | 'root', name, value }]. */
function declarations(path, token, resolver) {
  const [group, sub] = path;
  const type = token.$type;
  const value = resolver.resolveValue(token.$value);
  const eco = token.$extensions?.eco ?? {};
  const decl = (scope, name, v) => ({ scope, name: `--${name}`, value: v });

  if (type === 'color') return [decl('theme', `color-${cssName(path)}`, cssValue(type, value))];
  if (group === 'font' && sub === 'family')
    return [decl('theme', `font-${cssName(path.slice(2))}`, fontFamily(value))];
  if (group === 'font' && sub === 'weight')
    return [decl('theme', `font-weight-${cssName(path.slice(2))}`, String(value))];
  if (group === 'font' && sub === 'lineHeight')
    return [decl('theme', `leading-${cssName(path.slice(2))}`, String(value))];
  if (group === 'font' && sub === 'letterSpacing')
    return [decl('theme', `tracking-${cssName(path.slice(2))}`, String(value))];
  if (group === 'size' && sub === 'font')
    return [decl('theme', `text-${cssName(path.slice(2))}`, String(value))];
  if (group === 'font' && sub === 'role') {
    const name = `text-${cssName(path.slice(2))}`;
    const out = [decl('theme', name, value.fontSize)];
    if (value.lineHeight !== undefined)
      out.push(decl('theme', `${name}--line-height`, String(value.lineHeight)));
    if (value.letterSpacing !== undefined)
      out.push(decl('theme', `${name}--letter-spacing`, value.letterSpacing));
    out.push(decl('theme', `${name}--font-weight`, String(value.fontWeight)));
    return out;
  }
  if (group === 'space')
    return [decl('theme', `spacing-${cssName(path.slice(1))}`, cssValue(type, value))];
  if (group === 'radius')
    return [decl('theme', `radius-${cssName(path.slice(1))}`, cssValue(type, value))];
  if (group === 'shadow')
    return [decl('theme', `shadow-${cssName(path.slice(1))}`, cssValue(type, value))];
  if (group === 'breakpoint')
    return [decl('theme', `breakpoint-${cssName(path.slice(1))}`, cssValue(type, value))];
  return [decl('root', cssName(path), cssValue(type, value, eco))];
}

/** Tailwind namespace of a `@theme` variable name (longest prefix first), used for the tailwind-merge scales. */
const NAMESPACES = [
  'font-weight',
  'breakpoint',
  'tracking',
  'leading',
  'spacing',
  'radius',
  'shadow',
  'color',
  'text',
  'font',
];

/** Builds tailwind-theme.generated.ts: every token name per Tailwind namespace (sub-properties like `--x--y` skipped). */
export function buildScales(tree) {
  const entries = collectTokens(tree);
  const resolver = createResolver(entries);
  const scales = Object.fromEntries(NAMESPACES.map((ns) => [ns, []]));
  for (const { path, token } of entries) {
    for (const d of declarations(path, token, resolver)) {
      if (d.scope !== 'theme' || d.name.includes('--', 2)) continue;
      const ns = NAMESPACES.find((n) => d.name.startsWith(`--${n}-`));
      scales[ns].push(d.name.slice(ns.length + 3));
    }
  }
  return [
    '// GENERATED by tools/tokens/build-theme.mjs from docs/design/design-tokens.json — do not edit by hand.',
    '// Token names per Tailwind v4 theme namespace, consumed by cn() (tailwind-merge).',
    '// Regenerate with `pnpm tokens:build`.',
    'export const tokenThemeScales = {',
    ...NAMESPACES.map((ns) => `  '${ns}': ${JSON.stringify(scales[ns]).replaceAll('"', "'")},`),
    '} as const;',
    '',
  ].join('\n');
}

/** Builds the full theme.css text from the parsed token tree. */
export function buildTheme(tree, tokensLabel = 'docs/design/design-tokens.json') {
  const entries = collectTokens(tree);
  const resolver = createResolver(entries);
  const theme = [];
  const root = [];
  for (const { path, token } of entries) {
    for (const d of declarations(path, token, resolver)) {
      const line = `  ${d.name}: ${d.value};${token.$deprecated ? ' /* deprecated */' : ''}`;
      (d.scope === 'theme' ? theme : root).push(line);
    }
  }
  return [
    `/* GENERATED by tools/tokens/build-theme.mjs from ${tokensLabel} — do not edit by hand.`,
    ' * Regenerate with `pnpm tokens:build`; `pnpm tokens:check` fails when this file is stale. */',
    '',
    '@theme {',
    ...RESET_NAMESPACES.map((ns) => `  --${ns}-*: initial;`),
    '',
    ...theme,
    '}',
    '',
    ':root {',
    ...root,
    '}',
    '',
  ].join('\n');
}

function parseArgs(argv) {
  const opts = {
    check: false,
    tokens: process.env.DESIGN_TOKENS_PATH
      ? resolve(process.env.DESIGN_TOKENS_PATH)
      : DEFAULT_TOKENS,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--check') opts.check = true;
    else if (arg === '--tokens' && argv[i + 1]) opts.tokens = resolve(argv[++i]);
    else throw Object.assign(new Error(`Unknown argument ${arg}`), { exitCode: 2 });
  }
  return opts;
}

const repoPath = (p) => relative(REPO_ROOT, p).split(sep).join('/');

function firstDifferences(want, have) {
  const a = want.split('\n');
  const b = have.split('\n');
  const diffs = [];
  for (let i = 0; i < Math.max(a.length, b.length) && diffs.length < 10; i++) {
    if (a[i] !== b[i])
      diffs.push(
        `  line ${i + 1}: expected ${JSON.stringify(a[i] ?? '')}, found ${JSON.stringify(b[i] ?? '')}`,
      );
  }
  return diffs;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const label = repoPath(opts.tokens);
  const tree = JSON.parse(readFileSync(opts.tokens, 'utf8'));
  const outputs = [
    [CSS_OUT, buildTheme(tree)],
    [TS_OUT, buildScales(tree)],
  ];
  if (!opts.check) {
    for (const [file, text] of outputs) {
      writeFileSync(file, text);
      console.log(`wrote ${repoPath(file)} (${text.split('\n').length} lines)`);
    }
    return 0;
  }
  let stale = 0;
  for (const [file, text] of outputs) {
    let current;
    try {
      current = readFileSync(file, 'utf8');
    } catch {
      current = null;
    }
    if (current === text) {
      console.log(`${repoPath(file)} is up to date with ${label}`);
      continue;
    }
    stale++;
    console.error(
      `FAIL: ${repoPath(file)} is stale (regenerated from ${label}); run pnpm tokens:build`,
    );
    if (current !== null) for (const d of firstDifferences(text, current)) console.error(d);
  }
  return stale ? 1 : 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    process.exitCode = main();
  } catch (error) {
    console.error(`FAIL: ${error.message}`);
    process.exitCode = error.exitCode ?? 1;
  }
}
