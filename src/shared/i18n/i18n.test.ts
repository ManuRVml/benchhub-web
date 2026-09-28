import { describe, expect, it } from 'vitest';

import { i18n, t } from './i18n';
import { DEFAULT_LANGUAGE, DEFAULT_NAMESPACE, NAMESPACES, resources } from './resources';

// Every source file of the app as text (Vite glob, so the test needs no Node APIs). Tests are skipped: they may quote
// keys on purpose.
const sources = import.meta.glob<string>(['/src/**/*.{ts,tsx}', '!/src/**/*.test.{ts,tsx}'], {
  query: '?raw',
  import: 'default',
  eager: true,
});

// The screen inventories (SCR-*.md) that the seeded common copy must quote verbatim, joined into one text.
const screenInventory = Object.values(
  import.meta.glob<string>('/docs/design/screen-inventory/SCR-*.md', {
    query: '?raw',
    import: 'default',
    eager: true,
  }),
).join('\n');

/**
 * common keys whose copy has no screen-inventory quote ([inference], docs/architecture/i18n.md): section states of
 * SectionBoundary (P5-07), accessible-only labels (P5-16) and chart primitives (P5-18).
 */
const INFERRED_COMMON_PREFIXES = [
  'common.section.',
  'common.a11y.',
  'common.chart.',
  'common.commentThread.',
  'common.companyProfile.',
  'common.assistantChat.',
  'common.draftWizard.',
  'common.authError.',
];

/** t('…') / t("…") calls with a literal key; template literals with `${…}` cannot be checked statically. */
const KEY_CALL = /\bt\(\s*(['"`])([^'"`$]+?)\1/g;

function resolve(key: string): unknown {
  const [first = '', ...rest] = key.split('.');
  const hasNamespace = (NAMESPACES as string[]).includes(first);
  const namespace = hasNamespace ? first : DEFAULT_NAMESPACE;
  const path = hasNamespace ? rest : [first, ...rest];
  let node: unknown = resources[DEFAULT_LANGUAGE][namespace as keyof (typeof resources)['es-CO']];
  for (const segment of path) {
    if (node === null || typeof node !== 'object') return undefined;
    node = (node as Record<string, unknown>)[segment];
  }
  return node;
}

function leaves(node: unknown, prefix: string): [string, string][] {
  if (typeof node === 'string') return [[prefix, node]];
  if (node === null || typeof node !== 'object') return [];
  return Object.entries(node).flatMap(([k, v]) => leaves(v, prefix ? `${prefix}.${k}` : k));
}

describe('i18n resources', () => {
  it('scans the app sources', () => {
    expect(Object.keys(sources).length).toBeGreaterThan(0);
  });

  it('has every key used with t() in src', () => {
    const missing: string[] = [];
    for (const [file, text] of Object.entries(sources)) {
      text.split('\n').forEach((line, index) => {
        for (const match of line.matchAll(KEY_CALL)) {
          const key = match[2] ?? '';
          if (typeof resolve(key) !== 'string') missing.push(`${file}:${String(index + 1)} ${key}`);
        }
      });
    }
    expect(missing).toEqual([]);
  });

  it('seeds common with copy quoted verbatim from the screen inventory', () => {
    expect(screenInventory.length).toBeGreaterThan(0);
    // i18next placeholders {{name}} are written {name} in the inventory. Keys under INFERRED_COMMON_PREFIXES have no
    // prototype copy ([inference], listed in docs/architecture/i18n.md) and are exempt.
    const notQuoted = leaves(resources[DEFAULT_LANGUAGE].common, 'common')
      .filter(([key]) => !INFERRED_COMMON_PREFIXES.some((prefix) => key.startsWith(prefix)))
      .filter(
        ([, value]) => !screenInventory.includes(`"${value.replace(/\{\{(\w+)\}\}/g, '{$1}')}"`),
      )
      .map(([key, value]) => `${key}: ${value}`);
    expect(notQuoted).toEqual([]);
  });

  it('translates with es-CO as default and fallback', () => {
    expect(i18n.language).toBe('es-CO');
    expect(t('common.nav.home')).toBe('Inicio');
    expect(
      t('common.headerTitle.analysisResults', { analysisName: 'Desempeño comparativo — 4T 2025' }),
    ).toBe('Resultados · Desempeño comparativo — 4T 2025');
  });
});
