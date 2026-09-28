#!/usr/bin/env node
// Extracts the distinct stroke icons of the V2 prototype into tools/icons/icons.json (P5-10). No dependencies.
// Usage: node tools/icons/extract-icons.mjs   (PROTOTYPE_HTML overrides the path of BencHUD.dc.html)
// Each entry: { name, context, viewBox, width, height, strokeWidth, strokeLinecap, strokeLinejoin, elements, htmlLines }.
// Identical SVGs (same viewBox and elements, any colour or size) are one entry with all their prototype lines.
import { writeFileSync } from 'node:fs';

import { EXCLUSIONS, ICON_NAMES, ICONS_JSON, extractSvgs, readHtml } from './lib.mjs';

const svgs = extractSvgs(readHtml());
const icons = [];
const unnamed = [];
for (const svg of svgs) {
  if (svg.line in EXCLUSIONS) continue;
  const named = ICON_NAMES[svg.line];
  if (!named) {
    unnamed.push(svg.line);
    continue;
  }
  const [name, context] = named;
  icons.push({
    name,
    context,
    viewBox: svg.viewBox,
    width: svg.width,
    height: svg.height,
    strokeWidth: svg.strokeWidth,
    strokeLinecap: svg.strokeLinecap,
    strokeLinejoin: svg.strokeLinejoin,
    elements: svg.elements,
    htmlLines: svg.lines,
  });
}
if (unnamed.length) {
  console.error(
    `distinct SVGs without a name or exclusion (prototype lines): ${unnamed.join(', ')}`,
  );
  process.exit(1);
}
// Number arrays on one line, as Prettier formats JSON, so the generated file passes `prettier --check`.
const json = JSON.stringify(icons, null, 2).replace(
  /"htmlLines": \[([\d,\s]+)\]/g,
  (_, list) =>
    `"htmlLines": [${String(list)
      .trim()
      .split(/\s*,\s*/)
      .join(', ')}]`,
);
writeFileSync(ICONS_JSON, `${json}\n`);
const svgCount = svgs.reduce((n, s) => n + s.lines.length, 0);
console.log(
  `${String(svgCount)} <svg> elements, ${String(svgs.length)} distinct: ${String(icons.length)} icons written to tools/icons/icons.json, ${String(Object.keys(EXCLUSIONS).length)} excluded`,
);
