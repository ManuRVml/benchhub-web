import { describe, expect, it } from 'vitest';

import { flattenBuilderOrder, moveOrderItem, reorderModules } from './reorder-modules';

import type { BuilderModule } from './use-presentation-builder-view';

const chart = (id: string, isSelected: boolean) => ({ id, label: id, isSelected });

const MODULES: readonly BuilderModule[] = [
  {
    id: 'hom',
    label: 'Detalle y edición de datos por compañía',
    charts: [chart('cards', false), chart('faltantes', false)],
  },
  {
    id: 'comp',
    label: 'Comparativo GE vs. Promedio Pares',
    charts: [chart('barras', true), chart('tabla', false), chart('cat_rentabilidad', false)],
  },
  {
    id: 'hallazgos',
    label: 'Hallazgos de IA',
    charts: [chart('lista', true)],
  },
];

describe('reorderModules', () => {
  it('reorders selected charts within a module to match the flat order', () => {
    // Only one selected chart per module in the fixture, so add a second one to `comp` to see an in-module swap.
    const withTwoSelected = MODULES.map((module_) =>
      module_.id === 'comp'
        ? {
            ...module_,
            charts: module_.charts.map((c) => (c.id === 'tabla' ? { ...c, isSelected: true } : c)),
          }
        : module_,
    );
    const result = reorderModules(withTwoSelected, [
      'title',
      'comp|tabla',
      'comp|barras',
      'appendix',
    ]);
    const comp = result.find((module_) => module_.id === 'comp');
    expect(comp?.charts.map((c) => c.id)).toEqual(['tabla', 'barras', 'cat_rentabilidad']);
  });

  it('reorders modules by the first appearance of one of their charts in the flat order', () => {
    const result = reorderModules(MODULES, ['title', 'hallazgos|lista', 'comp|barras', 'appendix']);
    expect(result.map((module_) => module_.id)).toEqual(['hallazgos', 'comp', 'hom']);
  });

  it('ignores the cover and closing pseudo-keys', () => {
    const result = reorderModules(MODULES, ['title', 'comp|barras', 'hallazgos|lista', 'appendix']);
    expect(result.map((module_) => module_.id)).toEqual(['comp', 'hallazgos', 'hom']);
  });

  it('keeps unselected charts, in their original order, after the reordered selected ones', () => {
    const result = reorderModules(MODULES, ['comp|barras']);
    const comp = result.find((module_) => module_.id === 'comp');
    expect(comp?.charts.map((c) => c.id)).toEqual(['barras', 'tabla', 'cat_rentabilidad']);
  });

  it('appends a module with no chart in the order last, unchanged, keeping its own charts as they were', () => {
    const result = reorderModules(MODULES, ['comp|barras']);
    expect(result.map((module_) => module_.id)).toEqual(['comp', 'hom', 'hallazgos']);
    const hallazgos = result.find((module_) => module_.id === 'hallazgos');
    expect(hallazgos?.charts).toEqual(MODULES[2]?.charts);
  });

  it('throws when the order names a chart the modules do not have', () => {
    expect(() => reorderModules(MODULES, ['comp|nope'])).toThrow(/unknown chart/);
  });

  it('throws when the order names a module the modules do not have', () => {
    expect(() => reorderModules(MODULES, ['ghost|chart'])).toThrow(/unknown module/);
  });

  it('is a pure function: it never mutates its input', () => {
    const before = JSON.parse(JSON.stringify(MODULES)) as unknown;
    reorderModules(MODULES, ['title', 'hallazgos|lista', 'comp|barras', 'appendix']);
    expect(JSON.parse(JSON.stringify(MODULES))).toEqual(before);
  });
});

describe('flattenBuilderOrder', () => {
  const withTwoSelected = MODULES.map((module_) =>
    module_.id === 'comp'
      ? {
          ...module_,
          charts: module_.charts.map((c) => (c.id === 'tabla' ? { ...c, isSelected: true } : c)),
        }
      : module_,
  );

  it('lists cover, every selected chart in modules[] order, then closing', () => {
    expect(flattenBuilderOrder(withTwoSelected, true, true)).toEqual([
      'title',
      'comp|barras',
      'comp|tabla',
      'hallazgos|lista',
      'appendix',
    ]);
  });

  it('omits cover / closing when not included, and skips unselected charts', () => {
    expect(flattenBuilderOrder(MODULES, false, false)).toEqual(['comp|barras', 'hallazgos|lista']);
  });

  it('is the inverse of reorderModules for a round trip', () => {
    const order = flattenBuilderOrder(withTwoSelected, true, true);
    const reordered = reorderModules(withTwoSelected, order);
    expect(flattenBuilderOrder(reordered, true, true)).toEqual(order);
  });
});

describe('moveOrderItem', () => {
  const ORDER = ['title', 'comp|barras', 'hallazgos|lista', 'appendix'];

  it('swaps the item at index with its neighbour up', () => {
    expect(moveOrderItem(ORDER, 2, -1)).toEqual([
      'title',
      'hallazgos|lista',
      'comp|barras',
      'appendix',
    ]);
  });

  it('swaps the item at index with its neighbour down', () => {
    expect(moveOrderItem(ORDER, 1, 1)).toEqual([
      'title',
      'hallazgos|lista',
      'comp|barras',
      'appendix',
    ]);
  });

  it('is a no-op copy past either end', () => {
    expect(moveOrderItem(ORDER, 0, -1)).toEqual(ORDER);
    expect(moveOrderItem(ORDER, ORDER.length - 1, 1)).toEqual(ORDER);
  });

  it('does not mutate its input', () => {
    const before = [...ORDER];
    moveOrderItem(ORDER, 1, 1);
    expect(ORDER).toEqual(before);
  });
});
