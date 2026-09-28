#!/usr/bin/env node
// Prototype render harness (P1-03a screens, P1-03b overlays).
//
// Renders every screen and overlay of the V2 prototype (`BencHUD.dc.html`) fully offline into
// docs/design/screenshots/prototype/ and records them in manifest.json.
//
//   node tools/prototype-render/render.mjs                 render SCR-01..16 x 1440/1280/1024/768 (viewport + full)
//                                                          and OVL-01..14 x 1440/1280 (kind "overlay")
//   node tools/prototype-render/render.mjs --only SCR-05@1440[,OVL-12@1280]   render a subset (manifest is merged)
//   node tools/prototype-render/render.mjs --check         validate manifest + PNGs, re-render SCR-05@1440 + OVL-14@1440
//                                                          and compare sha256
//   node tools/prototype-render/render.mjs --check --all   same, re-rendering every viewport and overlay shot
//   node tools/prototype-render/render.mjs --check --only SCR-08@1024
//
// PROTOTYPE_DIR points at the folder that holds BencHUD.dc.html
// (default: ../V2 _CUAN_ECO_Comparador 2, relative to the repo root).
//
// How it stays offline and deterministic:
// - a local HTTP server serves PROTOTYPE_DIR; page.route fulfils the unpkg React/ReactDOM/Babel UMD
//   scripts from tools/prototype-render/vendor/ (vendor/manifest.json records each file's sha384, which must equal the
//   file and the SRI pinned in support.js; PROTOTYPE_VENDOR_MANIFEST overrides the manifest path) and the
//   Google Fonts stylesheet from @fontsource-variable/{roboto,roboto-mono}; any other external
//   request is aborted and counted per shot (a render with aborted requests fails);
// - screen state is injected through the React fiber into the prototype's logic instance
//   (stateNode.logic.setState, support.js StreamableLogic) using states.json; an overlay is its host
//   screen's state plus the overlay patch, and must show its `expectText` inside a position:fixed box;
// - CSS animations and transitions are disabled before capture (the Yarbis FAB pulse is infinite).
//
// Exit codes: 0 ok · 1 failure · 2 --check could not re-render because PROTOTYPE_DIR is missing
// (the manifest was still validated against the committed PNGs).

import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '..', '..');
const OUT_DIR = path.join(REPO_ROOT, 'docs', 'design', 'screenshots', 'prototype');
const MANIFEST = path.join(OUT_DIR, 'manifest.json');
const STATES = JSON.parse(fs.readFileSync(path.join(HERE, 'states.json'), 'utf8'));
const PROTOTYPE_DIR = path.resolve(
  REPO_ROOT,
  process.env.PROTOTYPE_DIR ?? path.join('..', 'V2 _CUAN_ECO_Comparador 2'),
);
const PROTOTYPE_FILE = 'BencHUD.dc.html';
const WIDTHS = [1440, 1280, 1024, 768];
// Overlays are fixed-position modals/drawers over a host screen; two desktop widths are enough.
const OVERLAY_WIDTHS = [1440, 1280];
const VIEWPORT_HEIGHT = 900;
const DEFAULT_CHECK_SAMPLE = ['SCR-05@1440', 'OVL-14@1440'];
const OVERLAYS = STATES.overlays ?? {};

// External URL (as pinned in support.js) -> vendored copy under tools/prototype-render/vendor/ (the app's own react@19
// cannot share the package name with the prototype's react@18 UMD build, which React 19 no longer ships).
const VENDOR_DIR = path.join(HERE, 'vendor');
const VENDOR_MANIFEST = process.env.PROTOTYPE_VENDOR_MANIFEST
  ? path.resolve(process.env.PROTOTYPE_VENDOR_MANIFEST)
  : path.join(VENDOR_DIR, 'manifest.json');
const VENDORED_SCRIPTS = Object.fromEntries(
  JSON.parse(fs.readFileSync(VENDOR_MANIFEST, 'utf8')).scripts.map((script) => [
    script.url,
    { ...script, path: path.join(VENDOR_DIR, script.file) },
  ]),
);
// Google Fonts family -> fontsource variable package (its index.css covers every subset).
const VENDORED_FONTS = {
  Roboto: { pkg: '@fontsource-variable/roboto', family: 'Roboto Variable' },
  'Roboto Mono': { pkg: '@fontsource-variable/roboto-mono', family: 'Roboto Mono Variable' },
};
const KILL_MOTION_CSS =
  '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}';

// Resolves '<package>/<path>' inside the repo's node_modules (package "exports" maps hide the CSS files).
function pkgFile(spec) {
  const parts = spec.split('/');
  const nameLength = spec.startsWith('@') ? 2 : 1;
  const file = path.join(
    REPO_ROOT,
    'node_modules',
    ...parts.slice(0, nameLength),
    ...parts.slice(nameLength),
  );
  if (!fs.existsSync(file)) throw new Error(`Vendored file not found: ${spec} (run pnpm install)`);
  return file;
}

const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
const sha384b64 = (buf) => crypto.createHash('sha384').update(buf).digest('base64');
const rel = (p) => path.relative(REPO_ROOT, p).split(path.sep).join('/');

function parseArgs(argv) {
  const args = { check: false, all: false, only: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--check') args.check = true;
    else if (a === '--all') args.all = true;
    else if (a === '--only')
      args.only.push(
        ...String(argv[++i] ?? '')
          .split(',')
          .filter(Boolean),
      );
    else if (a.startsWith('--only=')) args.only.push(...a.slice(7).split(',').filter(Boolean));
    else throw new Error(`Unknown argument: ${a}`);
  }
  for (const target of args.only) {
    const [id, w] = target.split('@');
    const ok = STATES.screens[id]
      ? WIDTHS.includes(Number(w))
      : OVERLAYS[id]
        ? OVERLAY_WIDTHS.includes(Number(w))
        : false;
    if (!ok) {
      throw new Error(
        `--only expects <SCR-xx>@<${WIDTHS.join('|')}> or <OVL-xx>@<${OVERLAY_WIDTHS.join('|')}> from states.json, got "${target}"`,
      );
    }
  }
  return args;
}

function allTargets() {
  return [
    ...Object.keys(STATES.screens).flatMap((id) => WIDTHS.map((width) => ({ id, width }))),
    ...Object.keys(OVERLAYS).flatMap((id) => OVERLAY_WIDTHS.map((width) => ({ id, width }))),
  ];
}

function toTargets(ids) {
  return ids.map((target) => {
    const [id, w] = target.split('@');
    return { id, width: Number(w) };
  });
}

// Stable identity of a manifest shot: screens carry `scr`, overlays carry `ovl`.
const shotId = (s) => s.scr ?? s.ovl;
const shotKey = (s) => `${shotId(s)}@${s.width}:${s.kind}`;

function prototypeAvailable() {
  return fs.existsSync(path.join(PROTOTYPE_DIR, PROTOTYPE_FILE));
}

// Checks that every vendored file matches its recorded sha384 and that the recorded value equals the SRI pinned in the
// prototype's support.js.
function verifyVendoredScripts() {
  const support = fs.readFileSync(path.join(PROTOTYPE_DIR, 'support.js'), 'utf8');
  const pinned = new Map();
  for (const m of support.matchAll(/var (\w+)_URL = "([^"]+)";\s*var \1_SRI = "([^"]+)";/g))
    pinned.set(m[2], m[3]);
  const results = [];
  for (const [url, script] of Object.entries(VENDORED_SCRIPTS)) {
    const sri = pinned.get(url);
    if (!sri) throw new Error(`support.js no longer pins ${url}; update ${rel(VENDOR_MANIFEST)}`);
    if (!fs.existsSync(script.path))
      throw new Error(`Vendored file not found: ${rel(script.path)}`);
    const actual = `sha384-${sha384b64(fs.readFileSync(script.path))}`;
    if (actual !== script.sha384)
      throw new Error(
        `Vendored file ${rel(script.path)} is ${actual}, but ${rel(VENDOR_MANIFEST)} records ${script.sha384}`,
      );
    if (script.sha384 !== sri)
      throw new Error(
        `SRI mismatch for ${url}: support.js pins ${sri}, ${rel(VENDOR_MANIFEST)} records ${script.sha384}`,
      );
    results.push({ url, file: rel(script.path), sri });
  }
  for (const url of pinned.keys()) {
    if (!VENDORED_SCRIPTS[url]) throw new Error(`support.js pins ${url}, which is not vendored`);
  }
  return results;
}

function fontStylesheet(base) {
  return Object.entries(VENDORED_FONTS)
    .map(([family, { pkg, family: vendorFamily }]) =>
      fs
        .readFileSync(pkgFile(`${pkg}/index.css`), 'utf8')
        .replaceAll(`'${vendorFamily}'`, `'${family}'`)
        .replaceAll('url(./files/', `url(${base}/__vendor/${pkg}/files/`),
    )
    .join('\n');
}

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
};

function startServer() {
  const nodeModules = path.join(REPO_ROOT, 'node_modules');
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const file = url.startsWith('/__vendor/')
      ? path.join(nodeModules, url.slice('/__vendor/'.length))
      : path.join(PROTOTYPE_DIR, url === '/' ? PROTOTYPE_FILE : url);
    const root = url.startsWith('/__vendor/') ? nodeModules : PROTOTYPE_DIR;
    if (!path.resolve(file).startsWith(path.resolve(root))) {
      res.writeHead(403).end();
      return;
    }
    fs.readFile(file, (err, buf) => {
      if (err) {
        res.writeHead(404).end();
        return;
      }
      res.writeHead(200, {
        'content-type':
          CONTENT_TYPES[path.extname(file).toLowerCase()] ?? 'application/octet-stream',
        // Font loads are CORS-checked: the stylesheet is served from the fonts.googleapis.com origin.
        'access-control-allow-origin': '*',
      });
      res.end(buf);
    });
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

async function injectState(page, entry) {
  const result = await page.evaluate(
    ({ state, vals }) => {
      for (const el of document.querySelectorAll('body *')) {
        const key = Object.keys(el).find((k) => k.startsWith('__reactFiber$'));
        for (let fiber = key ? el[key] : null; fiber; fiber = fiber.return) {
          const logic = fiber.stateNode && fiber.stateNode.logic;
          if (
            logic &&
            typeof logic.setState === 'function' &&
            logic.state &&
            'screen' in logic.state
          ) {
            if (vals) {
              const original = logic.renderVals.bind(logic);
              logic.renderVals = () => ({ ...original(), ...vals });
            }
            logic.setState({ ...state });
            return { ok: true };
          }
        }
      }
      return { ok: false };
    },
    { state: entry.state ?? {}, vals: entry.vals ?? null },
  );
  if (!result.ok)
    throw new Error('Prototype logic instance not found (support.js runtime changed?)');
}

async function settle(page) {
  const nextFrames = () =>
    page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
    );
  await nextFrames();
  await page.waitForLoadState('networkidle');
  await page.evaluate(async () => {
    await document.fonts.ready;
    // `complete` only means fetched; decode() guarantees the bitmap is ready to paint.
    await Promise.all(
      [...document.images].map((img) =>
        img.complete
          ? img.decode().catch(() => {})
          : new Promise((r) => {
              img.onload = img.onerror = r;
            }).then(() => img.decode().catch(() => {})),
      ),
    );
  });
  await nextFrames();
}

// An overlay is rendered over its host screen: the host entry is injected first, then the overlay patch.
function resolveEntry(id) {
  if (STATES.screens[id]) return { entry: STATES.screens[id], overlay: null };
  const overlay = OVERLAYS[id];
  const host = STATES.screens[overlay.host];
  if (!host) throw new Error(`${id}: host ${overlay.host} is not a screen in states.json`);
  return { entry: { ...host, name: overlay.name }, overlay };
}

// True when `text` is contained in the innermost element holding it that sits inside a position:fixed container.
async function overlayVisible(page, text) {
  return page.evaluate((expected) => {
    for (const el of document.querySelectorAll('body *')) {
      const own = el.textContent.trim();
      if (!own.includes(expected)) continue;
      if ([...el.children].some((c) => c.textContent.includes(expected))) continue;
      const box = el.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) continue;
      for (let a = el; a && a !== document.body; a = a.parentElement) {
        if (getComputedStyle(a).position === 'fixed') return true;
      }
    }
    return false;
  }, text);
}

async function renderShot(browser, base, fontsCss, { id, width }, outDir) {
  const { entry, overlay } = resolveEntry(id);
  const context = await browser.newContext({
    viewport: { width, height: VIEWPORT_HEIGHT },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
    locale: 'es-CO',
    timezoneId: 'America/Bogota',
  });
  const page = await context.newPage();
  const aborted = [];
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  await page.route('**/*', (route) => {
    const url = route.request().url();
    if (url.startsWith(base)) return route.continue();
    const script = VENDORED_SCRIPTS[url];
    if (script) {
      return route.fulfill({
        path: script.path,
        contentType: 'text/javascript; charset=utf-8',
        headers: { 'access-control-allow-origin': '*' },
      });
    }
    if (url.startsWith('https://fonts.googleapis.com/css')) {
      return route.fulfill({ body: fontsCss, contentType: 'text/css; charset=utf-8' });
    }
    aborted.push(url);
    return route.abort();
  });

  await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: KILL_MOTION_CSS });
  // componentDidMount flips `mounted` after 60 ms; inject only after that so it cannot overwrite us.
  await page.waitForFunction(() => {
    for (const el of document.querySelectorAll('body *')) {
      const key = Object.keys(el).find((k) => k.startsWith('__reactFiber$'));
      for (let f = key ? el[key] : null; f; f = f.return) {
        if (
          f.stateNode &&
          f.stateNode.logic &&
          f.stateNode.logic.state &&
          f.stateNode.logic.state.mounted
        )
          return true;
      }
    }
    return false;
  });
  await injectState(page, entry);
  await settle(page);
  if (overlay) {
    // Negative control first: the host alone must not show expectText, so the check below is discriminating.
    if (await overlayVisible(page, overlay.expectText)) {
      await context.close();
      throw new Error(
        `${id}@${width}: "${overlay.expectText}" is already visible on host ${overlay.host}; pick a text unique to the overlay`,
      );
    }
    await injectState(page, { state: overlay.state });
    await settle(page);
    if (!(await overlayVisible(page, overlay.expectText))) {
      await context.close();
      throw new Error(
        `${id}@${width}: "${overlay.expectText}" is not visible inside a fixed overlay; the state patch did not open it`,
      );
    }
  }

  const shots = [];
  const viewportFile = path.join(outDir, `${id}@${width}.png`);
  await page.screenshot({ path: viewportFile, animations: 'disabled', caret: 'hide' });
  shots.push({
    kind: overlay ? 'overlay' : 'viewport',
    file: viewportFile,
    height: VIEWPORT_HEIGHT,
  });

  if (!overlay) {
    // fullPage would keep 100vh elements (the sidebar) at the viewport height, so grow the viewport instead.
    const fullHeight = await page.evaluate(() =>
      Math.max(
        document.documentElement.scrollHeight,
        document.body ? document.body.scrollHeight : 0,
      ),
    );
    await page.setViewportSize({ width, height: fullHeight });
    await settle(page);
    const fullFile = path.join(outDir, `${id}@${width}-full.png`);
    await page.screenshot({ path: fullFile, animations: 'disabled', caret: 'hide' });
    shots.push({ kind: 'full', file: fullFile, height: fullHeight });
  }

  await context.close();
  return shots.map((s) => {
    const buf = fs.readFileSync(s.file);
    return {
      ...(overlay ? { ovl: id, host: overlay.host } : { scr: id }),
      name: entry.name,
      width,
      kind: s.kind,
      height: s.height,
      file: path.basename(s.file),
      sha256: sha256(buf),
      bytes: buf.length,
      abortedRequests: aborted.length,
      errors: errors.length,
    };
  });
}

async function renderAll(targets, outDir) {
  const server = await startServer();
  const base = `http://127.0.0.1:${server.address().port}`;
  const fontsCss = fontStylesheet(base);
  // Multi-threaded/partial raster can antialias composited layers (e.g. horizontal scrollers) differently
  // between runs; these flags make repeated renders byte-identical.
  const browser = await chromium.launch({
    args: [
      '--num-raster-threads=1',
      '--disable-partial-raster',
      '--disable-gpu-rasterization',
      '--disable-lcd-text',
      '--force-color-profile=srgb',
      '--font-render-hinting=none',
    ],
  });
  const shots = [];
  try {
    for (const target of targets) {
      const started = Date.now();
      const result = await renderShot(browser, base, fontsCss, target, outDir);
      shots.push(...result);
      const [first, full] = result;
      console.log(
        `${target.id}@${target.width}  ${full ? `full h=${full.height}` : 'overlay'}  aborted=${first.abortedRequests} errors=${first.errors}  ${Date.now() - started} ms`,
      );
    }
  } finally {
    await browser.close();
    server.close();
  }
  return shots;
}

function readManifest() {
  if (!fs.existsSync(MANIFEST)) return null;
  return JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
}

function writeManifest(shots, vendored) {
  const previous = readManifest();
  const byKey = new Map((previous?.shots ?? []).map((s) => [shotKey(s), s]));
  for (const s of shots) byKey.set(shotKey(s), s);
  const order = [...Object.keys(STATES.screens), ...Object.keys(OVERLAYS)];
  const merged = [...byKey.values()].sort(
    (a, b) =>
      order.indexOf(shotId(a)) - order.indexOf(shotId(b)) ||
      b.width - a.width ||
      a.kind.localeCompare(b.kind),
  );
  const manifest = {
    generator: 'tools/prototype-render/render.mjs',
    prototype: {
      file: PROTOTYPE_FILE,
      sha256: sha256(fs.readFileSync(path.join(PROTOTYPE_DIR, PROTOTYPE_FILE))),
    },
    vendored: vendored.map(({ url, file, sri }) => ({ url, file, sri })),
    fonts: Object.values(VENDORED_FONTS).map(({ pkg }) => ({
      package: pkg,
      version: JSON.parse(fs.readFileSync(pkgFile(`${pkg}/package.json`), 'utf8')).version,
    })),
    browser: {
      name: 'chromium',
      playwright: JSON.parse(fs.readFileSync(pkgFile('playwright/package.json'), 'utf8')).version,
    },
    viewportHeight: VIEWPORT_HEIGHT,
    widths: WIDTHS,
    overlayWidths: OVERLAY_WIDTHS,
    states: 'tools/prototype-render/states.json',
    notRendered: STATES.notRendered,
    shots: merged,
  };
  fs.writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

// Validates the manifest against states.json and the committed PNGs; returns a list of problems.
function validateManifest(manifest) {
  const expected = [
    ...Object.keys(STATES.screens).flatMap((id) =>
      WIDTHS.flatMap((width) => ['viewport', 'full'].map((kind) => ({ id, width, kind }))),
    ),
    ...Object.keys(OVERLAYS).flatMap((id) =>
      OVERLAY_WIDTHS.map((width) => ({ id, width, kind: 'overlay' })),
    ),
  ];
  const problems = [];
  for (const { id, width, kind } of expected) {
    const shot = manifest.shots.find(
      (s) => shotId(s) === id && s.width === width && s.kind === kind,
    );
    if (!shot) {
      problems.push(`missing ${kind} shot ${id}@${width}`);
      continue;
    }
    const file = path.join(OUT_DIR, shot.file);
    if (!fs.existsSync(file))
      problems.push(`${shot.file} is listed in the manifest but not on disk`);
    else if (sha256(fs.readFileSync(file)) !== shot.sha256)
      problems.push(`${shot.file} sha256 differs from manifest`);
    if (shot.abortedRequests !== 0)
      problems.push(`${shot.file} was rendered with ${shot.abortedRequests} aborted requests`);
  }
  for (const id of Object.keys(OVERLAYS)) {
    if (STATES.notRendered?.[id])
      problems.push(`${id} is both rendered and listed under notRendered in states.json`);
  }
  return problems;
}

async function check(args) {
  const manifest = readManifest();
  if (!manifest) {
    console.error(
      `FAIL: ${rel(MANIFEST)} not found; run node tools/prototype-render/render.mjs first`,
    );
    return 1;
  }
  const problems = validateManifest(manifest);
  const count = (kind) => manifest.shots.filter((s) => s.kind === kind).length;
  console.log(
    `manifest: ${count('viewport')} viewport shots (expected ${Object.keys(STATES.screens).length * WIDTHS.length}), ` +
      `${count('full')} full shots, ${count('overlay')} overlay shots (expected ${Object.keys(OVERLAYS).length * OVERLAY_WIDTHS.length}); ` +
      `not rendered: ${Object.keys(STATES.notRendered ?? {}).join(', ')}`,
  );
  if (problems.length) {
    for (const p of problems) console.error(`FAIL: ${p}`);
    return 1;
  }
  console.log(`manifest OK: every PNG matches its sha256 and was rendered with 0 aborted requests`);

  if (!prototypeAvailable()) {
    console.error(
      `PROTOTYPE_DIR not found: ${PROTOTYPE_DIR} (no ${PROTOTYPE_FILE}). ` +
        'Validated the manifest against the committed PNGs only; set PROTOTYPE_DIR to re-render and check stability.',
    );
    return 2;
  }
  const protoSha = sha256(fs.readFileSync(path.join(PROTOTYPE_DIR, PROTOTYPE_FILE)));
  if (protoSha !== manifest.prototype.sha256) {
    console.error(
      `FAIL: ${PROTOTYPE_FILE} changed since the manifest was written (${protoSha}); re-render`,
    );
    return 1;
  }
  verifyVendoredScripts();
  console.log('vendored scripts OK: sha384 equals the SRI pinned in support.js');

  const sample = args.all
    ? allTargets()
    : toTargets(args.only.length ? args.only : DEFAULT_CHECK_SAMPLE);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'prototype-render-check-'));
  let unstable = 0;
  try {
    const shots = await renderAll(sample, tmp);
    for (const shot of shots.filter((s) => s.kind !== 'full')) {
      const committed = manifest.shots.find((s) => shotKey(s) === shotKey(shot));
      const same = committed.sha256 === shot.sha256;
      if (!same) unstable++;
      console.log(
        `${same ? 'stable ' : 'CHANGED'} ${shot.file}  committed=${committed.sha256}  rerender=${shot.sha256}`,
      );
    }
  } finally {
    if (!unstable) fs.rmSync(tmp, { recursive: true, force: true });
  }
  if (unstable) {
    console.error(
      `FAIL: ${unstable} re-rendered shot(s) differ from the committed PNGs; re-renders kept in ${tmp}`,
    );
    return 1;
  }
  console.log('check OK');
  return 0;
}

async function render(args) {
  if (!prototypeAvailable()) {
    console.error(
      `FAIL: PROTOTYPE_DIR not found: ${PROTOTYPE_DIR} (no ${PROTOTYPE_FILE}). Set PROTOTYPE_DIR to the prototype folder.`,
    );
    return 1;
  }
  const vendored = verifyVendoredScripts();
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const targets = args.only.length ? toTargets(args.only) : allTargets();
  const shots = await renderAll(targets, OUT_DIR);
  const manifest = writeManifest(shots, vendored);
  const bad = shots.filter((s) => s.abortedRequests > 0 || s.errors > 0);
  console.log(
    `wrote ${shots.length} PNGs and ${rel(MANIFEST)} (${manifest.shots.length} shots total)`,
  );
  if (bad.length) {
    for (const s of bad)
      console.error(`FAIL: ${s.file} aborted=${s.abortedRequests} errors=${s.errors}`);
    return 1;
  }
  return 0;
}

try {
  const args = parseArgs(process.argv.slice(2));
  process.exitCode = args.check ? await check(args) : await render(args);
} catch (error) {
  console.error(`FAIL: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
