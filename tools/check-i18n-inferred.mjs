#!/usr/bin/env node
// Usage: node tools/check-i18n-inferred.mjs [repo]
// Every common key under an INFERRED_COMMON_PREFIXES prefix (i18n.test.ts) must be named in docs/architecture/i18n.md.
import { readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const wt = process.argv[2] ?? resolve(dirname(fileURLToPath(import.meta.url)), '..');
const test = readFileSync(join(wt, 'src/shared/i18n/i18n.test.ts'), 'utf8');
const prefixes = [
  ...(test.match(/INFERRED_COMMON_PREFIXES\s*=\s*\[([^\]]*)\]/)?.[1] ?? '').matchAll(/'([^']+)'/g),
].map((m) => m[1]);
const common = JSON.parse(
  readFileSync(join(wt, 'src/shared/i18n/locales/es-CO/common.json'), 'utf8'),
);
const md = readFileSync(join(wt, 'docs/architecture/i18n.md'), 'utf8');
const leaves = [];
const walk = (o, p) => {
  for (const [k, v] of Object.entries(o)) {
    const q = p ? `${p}.${k}` : k;
    if (v && typeof v === 'object') walk(v, q);
    else leaves.push(q);
  }
};
walk(common, 'common');
let bad = 0;
if (!prefixes.length) (console.error('FAIL no INFERRED_COMMON_PREFIXES found'), bad++);
for (const key of leaves.filter((k) => prefixes.some((p) => k.startsWith(p)))) {
  const last = key.split('.').pop();
  if (!md.includes(`\`${last}\``) && !md.includes(key))
    (console.error(`FAIL ${key} not named in docs/architecture/i18n.md`), bad++);
}
console.log(`i18n-inferred-doc: prefixes ${prefixes.join(', ')}; ${bad} failure(s)`);
process.exit(bad ? 1 : 0);
