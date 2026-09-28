// Shared SVG extraction for tools/icons/extract-icons.mjs and tools/icons/check-icons.mjs (P5-10). No dependencies.
//
// Every <svg> of the prototype is reduced to its drawing elements; the stroke colour of the root is dropped (components
// use currentColor) and filled dots become fill="currentColor". Two SVGs with the same elements and viewBox are the same
// icon, whatever their size or colour.

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const PROTOTYPE_FOLDER = 'V2 _CUAN_ECO_Comparador 2';
export const ICONS_JSON = join(REPO_ROOT, 'tools', 'icons', 'icons.json');
export const ICONS_DIR = join(REPO_ROOT, 'src', 'shared', 'ui', 'icons');

const DRAWING_TAGS = ['path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse'];
/** Attributes kept on drawing elements; colour attributes are normalised below. */
const ELEMENT_ATTRS = [
  'd',
  'cx',
  'cy',
  'r',
  'rx',
  'ry',
  'x',
  'y',
  'width',
  'height',
  'x1',
  'y1',
  'x2',
  'y2',
  'points',
  'fill',
  'stroke',
  'stroke-dasharray',
];

/**
 * Names of the icons, from the label or control each first occurrence sits in (prototype line → name). Identical icons
 * elsewhere take the name of their first occurrence.
 */
export const ICON_NAMES = {
  54: ['trend-up', 'login feature "Desempeño comparativo"'],
  60: ['bar-chart', 'login feature "Referentes estratégicos"'],
  66: ['clock', 'login feature "Generación de valor"'],
  76: ['user', 'login card "Iniciar sesión"'],
  86: ['info', 'login note "Directorio Activo"'],
  108: ['app-window', 'gate card "Ingresar a la herramienta"'],
  115: ['settings', 'gate card "Administración"'],
  170: ['home', 'sidebar "Inicio"'],
  175: ['report', 'sidebar "Ref. TBG I ILP" / "Ref. Competitivo"'],
  185: ['value-tree', 'sidebar "Monitor de Valor"'],
  190: ['presentation', 'sidebar "Presentaciones"'],
  195: ['bell', 'sidebar "Notificaciones" / header bell'],
  208: ['logout', 'sidebar "Salir"'],
  227: ['help', 'header help "?"'],
  348: ['arrow-up', 'peer news impact up'],
  351: ['arrow-down', 'peer news impact down'],
  1021: ['spreadsheet', 'Resumen del informe "Excel" button'],
  1095: ['monitor', 'Visualización "Crear presentación" / notification type "Publicación"'],
  2964: ['data', 'notification type "Dato"'],
  2967: ['comment', 'notification type "Comentario"'],
  2973: ['bot', 'notification type "Yarbis"'],
  2976: ['news', 'notification type "Noticia"'],
  2979: ['users', 'notification type "Colaboración"'],
  2982: ['system', 'notification type "Sistema"'],
  3023: ['check-circle', 'modal "Análisis publicado"'],
  3034: ['check', 'toast "Cambios guardados automáticamente"'],
  3177: ['assistant', 'Yarbis floating button'],
};

/** SVGs of the prototype that are not UI icons (line → reason). */
export const EXCLUSIONS = {
  15: 'bundler thumbnail illustration (template __bundler_thumbnail, 1200x800 artwork with text), not UI',
  2019: 'Monitor de Valor donut chart (data-driven circles, 180x180); rendered by the DonutChart component, not an icon',
};

/** @param {string} tagSource */
function readAttrs(tagSource) {
  /** @type {Record<string, string>} */
  const attrs = {};
  for (const m of tagSource.matchAll(/([a-zA-Z][a-zA-Z0-9:-]*)="([^"]*)"/g)) {
    const name = m[1] ?? '';
    attrs[name] = m[2] ?? '';
  }
  return attrs;
}

/** @param {Record<string, string>} attrs */
function normaliseElementAttrs(attrs) {
  /** @type {Record<string, string>} */
  const out = {};
  for (const name of ELEMENT_ATTRS) {
    const value = attrs[name];
    if (value === undefined) continue;
    if ((name === 'fill' || name === 'stroke') && value !== 'none') out[name] = 'currentColor';
    else out[name] = value;
  }
  return out;
}

/** @param {string} text @param {number} index */
function lineOf(text, index) {
  return text.slice(0, index).split('\n').length;
}

/**
 * @param {string} html
 * @returns {Array<{ key: string, line: number, lines: number[], viewBox: string, width: number | null, height: number | null,
 *   strokeWidth: number | null, strokeLinecap: string | null, strokeLinejoin: string | null,
 *   elements: Array<{ tag: string, attrs: Record<string, string> }> }>}
 */
export function extractSvgs(html) {
  /** @type {Map<string, any>} */
  const byKey = new Map();
  for (const m of html.matchAll(/<svg\b([^>]*)>([\s\S]*?)<\/svg>/g)) {
    const root = readAttrs(m[1] ?? '');
    const elements = [
      ...(m[2] ?? '').matchAll(new RegExp(`<(${DRAWING_TAGS.join('|')})\\b([^>]*?)\\/?>`, 'g')),
    ].map((e) => ({ tag: e[1] ?? '', attrs: normaliseElementAttrs(readAttrs(e[2] ?? '')) }));
    const viewBox = root.viewBox ?? '';
    const key = JSON.stringify({ viewBox, elements });
    const line = lineOf(html, m.index);
    const existing = byKey.get(key);
    if (existing) {
      existing.lines.push(line);
      continue;
    }
    const num = (/** @type {string | undefined} */ v) =>
      v === undefined || v === '' ? null : Number(v);
    byKey.set(key, {
      key,
      line,
      lines: [line],
      viewBox,
      width: num(root.width),
      height: num(root.height),
      strokeWidth: num(root['stroke-width']),
      strokeLinecap: root['stroke-linecap'] ?? null,
      strokeLinejoin: root['stroke-linejoin'] ?? null,
      elements,
    });
  }
  return [...byKey.values()];
}

/**
 * Path of BencHUD.dc.html: PROTOTYPE_HTML, else PROTOTYPE_DIR (as in tools/prototype-render), else the prototype folder
 * found next to the repository or next to any parent folder (so a git worktree under .wt/ also finds it).
 */
export function prototypeHtmlPath() {
  if (process.env.PROTOTYPE_HTML) return resolve(process.env.PROTOTYPE_HTML);
  if (process.env.PROTOTYPE_DIR) return resolve(process.env.PROTOTYPE_DIR, 'BencHUD.dc.html');
  let dir = REPO_ROOT;
  for (let i = 0; i < 5; i++) {
    const candidate = join(dir, '..', PROTOTYPE_FOLDER, 'BencHUD.dc.html');
    if (existsSync(candidate)) return resolve(candidate);
    dir = resolve(dir, '..');
  }
  throw new Error(`BencHUD.dc.html not found; set PROTOTYPE_HTML or PROTOTYPE_DIR`);
}

export function readHtml(htmlPath = prototypeHtmlPath()) {
  return readFileSync(htmlPath, 'utf8');
}

/** `value-tree` → `ValueTree` */
export function pascalCase(name) {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

/** JSX attribute name of an SVG attribute (`stroke-dasharray` → `strokeDasharray`). */
export function jsxAttr(name) {
  return name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}
