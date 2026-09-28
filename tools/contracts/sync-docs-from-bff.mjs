// Keeps docs/design/view-data-contracts/ (the source `pnpm contract:fixtures` extracts from) in step with the BFF's
// docs/requirements/view-data-contracts/. The BFF copies carry a leading `<!-- origin: ... -->` line that web's
// files (web is the origin) never have, so it is stripped on write and ignored on compare.
// Usage: pnpm contract:docs-sync --bff <bff view-data-contracts dir>    (writes web's mirror)
//        pnpm contract:docs-check --bff <bff view-data-contracts dir>   (fails listing files that differ)
// The BFF path comes from --bff or the BFF_DOCS env var; without either the script does nothing and exits 0, so CI
// (where the BFF repo is absent) is unaffected. A path that is given but missing is an error.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB_DIR = path.join(__dirname, '../../docs/design/view-data-contracts');

const args = process.argv.slice(2);
const check = args.includes('--check');
const bffIndex = args.indexOf('--bff');
const bffArg = bffIndex >= 0 ? args[bffIndex + 1] : process.env.BFF_DOCS;

if (!bffArg) {
  console.log('contract:docs — no BFF path (--bff <dir> or BFF_DOCS); skipped.');
  process.exit(0);
}

const bffDir = path.resolve(bffArg);
if (!fs.existsSync(bffDir) || !fs.statSync(bffDir).isDirectory()) {
  console.error(`contract:docs — BFF docs directory not found: ${bffDir}`);
  process.exit(1);
}

const ORIGIN_HEADER = /^<!-- origin: [^\n]*-->\n\n?/;

/** Normalised BFF content: LF line endings, origin header removed. */
function readBff(file) {
  return fs
    .readFileSync(path.join(bffDir, file), 'utf8')
    .replace(/\r\n/g, '\n')
    .replace(ORIGIN_HEADER, '');
}

function readWeb(file) {
  return fs.readFileSync(path.join(WEB_DIR, file), 'utf8').replace(/\r\n/g, '\n');
}

const listMd = (dir) =>
  fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .sort();
const bffFiles = listMd(bffDir);
const webFiles = new Set(listMd(WEB_DIR));

const differing = [];
const onlyInBff = [];
for (const file of bffFiles) {
  if (!webFiles.has(file)) {
    onlyInBff.push(file);
    continue;
  }
  if (readWeb(file) !== readBff(file)) differing.push(file);
}
const onlyInWeb = [...webFiles].filter((f) => !bffFiles.includes(f));

if (check) {
  const problems = [
    ...differing.map((f) => `${f}: content differs from the BFF copy`),
    ...onlyInBff.map((f) => `${f}: exists in the BFF only`),
    ...onlyInWeb.map((f) => `${f}: exists in web only`),
  ];
  if (problems.length > 0) {
    console.error(
      `contract:docs-check FAILED — ${problems.length} file(s) out of sync with ${bffDir}:`,
    );
    for (const p of problems) console.error(`  ${p}`);
    console.error('Run pnpm contract:docs-sync --bff <dir>, then pnpm contract:fixtures.');
    process.exit(1);
  }
  console.log(`contract:docs-check OK: 0 differing files (${bffFiles.length} docs compared)`);
  process.exit(0);
}

for (const file of [...differing, ...onlyInBff]) {
  fs.writeFileSync(path.join(WEB_DIR, file), readBff(file));
  console.log(`synced ${file}`);
}
for (const f of onlyInWeb) console.log(`web-only (left untouched): ${f}`);
console.log(`contract:docs-sync: ${differing.length + onlyInBff.length} file(s) written.`);
console.log('Now run pnpm contract:fixtures to regenerate the fixtures.');
