// `pnpm check:http-bundle`: a production build with VITE_API_MODE=http must not ship mock data. The BFF serves the
// mocks; the SPA loads its mock adapters and contract fixtures only through a dynamic import() behind a
// `import.meta.env.VITE_API_MODE` branch that Vite folds away in an http build. The check builds into a temp folder
// and fails when any emitted file name looks like a fixture or mock (`*.response-*`, `*.request-*`, `mock`), or when a
// JS chunk contains an id that only exists in the contract fixtures (src/test/fixtures/contracts/).
//
// Usage: node tools/check-http-bundle.mjs            (runs `vite build --mode production` with VITE_API_MODE=http)
//        node tools/check-http-bundle.mjs --dir <out> (scans an existing build instead; used by the selftest)
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const VITE_BIN = join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js');

/** Emitted file names that betray a fixture chunk (`V-43.response-*.js`) or mock code (`mock-*.js`, the MSW worker). */
export const FORBIDDEN_NAME = /\.response-|\.request-|mock/i;
/**
 * Ids that exist only in the contract fixtures (V-40/V-43 presentations, V-44 notifications), never in app code: a JS
 * chunk that contains one carries fixture data, whatever its name.
 */
export const FIXTURE_MARKERS = ['prs_directorio_t4', 'ntf_chevron_t4'];

function listFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? listFiles(join(dir, entry.name)) : [join(dir, entry.name)],
  );
}

/** Problems of a build folder: forbidden file names and JS chunks with fixture markers (paths relative to `dir`). */
export function scanBundle(dir) {
  const problems = [];
  for (const file of listFiles(dir)) {
    const name = relative(dir, file).replaceAll('\\', '/');
    if (FORBIDDEN_NAME.test(name))
      problems.push(`${name}: file name matches ${String(FORBIDDEN_NAME)}`);
    if (!/\.m?js$/.test(name)) continue;
    const code = readFileSync(file, 'utf8');
    for (const marker of FIXTURE_MARKERS) {
      if (code.includes(marker)) problems.push(`${name}: contains the fixture id "${marker}"`);
    }
  }
  return problems;
}

function build(outDir) {
  const result = spawnSync(
    process.execPath,
    [
      VITE_BIN,
      'build',
      '--mode',
      'production',
      '--outDir',
      outDir,
      '--emptyOutDir',
      '--logLevel',
      'warn',
    ],
    { cwd: ROOT, encoding: 'utf8', env: { ...process.env, VITE_API_MODE: 'http' } },
  );
  if (result.status !== 0) {
    console.error(result.stdout, result.stderr);
    console.error(`check:http-bundle FAIL: vite build exited ${String(result.status)}`);
    process.exit(1);
  }
}

function main() {
  const index = process.argv.indexOf('--dir');
  const given = index === -1 ? undefined : resolve(process.argv[index + 1] ?? '');
  if (given !== undefined && !existsSync(given)) {
    console.error(`check:http-bundle FAIL: ${given} does not exist`);
    process.exit(1);
  }
  const outDir = given ?? mkdtempSync(join(tmpdir(), 'check-http-bundle-'));
  try {
    if (given === undefined) build(outDir);
    const files = listFiles(outDir).length;
    const problems = scanBundle(outDir);
    if (problems.length > 0) {
      console.error(`check:http-bundle FAIL (${String(problems.length)} problem(s)):`);
      for (const problem of problems) console.error(`  - ${problem}`);
      process.exit(1);
    }
    console.log(
      `check:http-bundle OK: ${String(files)} file(s) of the http build, no mock chunk and no fixture id`,
    );
  } finally {
    if (given === undefined) rmSync(outDir, { recursive: true, force: true });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
