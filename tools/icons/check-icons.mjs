#!/usr/bin/env node
// Verifies the icon set against the prototype (P5-10). No dependencies. Exit 0 when consistent, 1 otherwise.
// Usage: node tools/icons/check-icons.mjs   (PROTOTYPE_HTML / PROTOTYPE_DIR locate BencHUD.dc.html, see lib.mjs)
// Checks:
//  1. distinct SVGs in the prototype = icons.json entries + EXCLUSIONS (every distinct SVG is either an icon or an
//     excluded logo / illustration with a reason);
//  2. icons.json matches a fresh extraction (same elements, viewBox and prototype lines per icon);
//  3. every icons.json entry has src/shared/ui/icons/<Name>Icon.tsx, exported from index.ts;
//  4. every component draws exactly the elements of its icons.json entry (no placeholder or hand-edited paths).
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { EXCLUSIONS, ICONS_DIR, ICONS_JSON, extractSvgs, pascalCase, readHtml } from './lib.mjs';

/** @typedef {{ tag: string, attrs: Record<string, string> }} Element */
/** @type {Array<{ name: string, viewBox: string, elements: Element[], htmlLines: number[] }>} */
const icons = JSON.parse(readFileSync(ICONS_JSON, 'utf8'));
const errors = [];

/** Canonical string of an element list (attribute order does not matter). @param {Element[]} elements */
function canonical(elements) {
  return JSON.stringify(
    elements.map(({ tag, attrs }) => [
      tag,
      Object.entries(attrs).sort(([a], [b]) => a.localeCompare(b)),
    ]),
  );
}

/** Drawing elements of a generated component, with SVG attribute names. @param {string} source */
function componentElements(source) {
  const tags = 'path|circle|rect|line|polyline|polygon|ellipse';
  return [...source.matchAll(new RegExp(`<(${tags})\\b([^>]*?)\\/>`, 'g'))].map((m) => {
    /** @type {Record<string, string>} */
    const attrs = {};
    for (const a of (m[2] ?? '').matchAll(/([a-zA-Z][a-zA-Z0-9]*)="([^"]*)"/g)) {
      const name = (a[1] ?? '').replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
      attrs[name] = a[2] ?? '';
    }
    return { tag: m[1] ?? '', attrs };
  });
}

// 1 + 2: the prototype.
const svgs = extractSvgs(readHtml());
const excluded = svgs.filter((s) => s.line in EXCLUSIONS);
const expectedIcons = svgs.length - excluded.length;
if (excluded.length !== Object.keys(EXCLUSIONS).length) {
  errors.push(
    `EXCLUSIONS lists lines that are not distinct SVGs of the prototype: ${Object.keys(EXCLUSIONS).join(', ')}`,
  );
}
if (icons.length !== expectedIcons) {
  errors.push(
    `prototype has ${String(svgs.length)} distinct SVGs (${String(excluded.length)} excluded), so ${String(expectedIcons)} icons are expected; icons.json has ${String(icons.length)}`,
  );
}
for (const svg of svgs) {
  if (svg.line in EXCLUSIONS) continue;
  const icon = icons.find((i) => i.htmlLines[0] === svg.line);
  if (!icon) {
    errors.push(`prototype SVG at L${String(svg.line)} is neither in icons.json nor excluded`);
    continue;
  }
  if (icon.viewBox !== svg.viewBox || canonical(icon.elements) !== canonical(svg.elements)) {
    errors.push(`icons.json "${icon.name}" differs from the prototype SVG at L${String(svg.line)}`);
  }
  if (icon.htmlLines.join(',') !== svg.lines.join(',')) {
    errors.push(
      `icons.json "${icon.name}" lines ${icon.htmlLines.join(',')} != prototype ${svg.lines.join(',')}`,
    );
  }
}

// 3 + 4: the components.
const indexPath = join(ICONS_DIR, 'index.ts');
const index = existsSync(indexPath) ? readFileSync(indexPath, 'utf8') : '';
if (!index) errors.push('src/shared/ui/icons/index.ts is missing');
for (const icon of icons) {
  const component = `${pascalCase(icon.name)}Icon`;
  const file = join(ICONS_DIR, `${component}.tsx`);
  if (!existsSync(file)) {
    errors.push(
      `icons.json "${icon.name}" has no component file src/shared/ui/icons/${component}.tsx`,
    );
    continue;
  }
  if (!index.includes(`export { ${component} } from './${component}';`)) {
    errors.push(`${component} is not exported from src/shared/ui/icons/index.ts`);
  }
  const source = readFileSync(file, 'utf8');
  if (!source.includes(`viewBox="${icon.viewBox}"`)) {
    errors.push(`${component}.tsx does not use viewBox "${icon.viewBox}"`);
  }
  if (canonical(componentElements(source)) !== canonical(icon.elements)) {
    errors.push(
      `${component}.tsx does not draw the elements recorded in icons.json for "${icon.name}"`,
    );
  }
}

console.log(
  `check-icons: ${String(svgs.reduce((n, s) => n + s.lines.length, 0))} <svg> in the prototype, ${String(svgs.length)} distinct, ${String(excluded.length)} excluded, ${String(icons.length)} icons in icons.json`,
);
for (const error of errors) console.log(`FAIL ${error}`);
process.exit(errors.length ? 1 : 0);
