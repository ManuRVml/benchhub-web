import type { KnownResultsModuleId, V09Response } from '@/shared/api';
import type { ComponentType, ReactNode } from 'react';

// Module registry of SCR-08 (docs/design/screen-inventory/SCR-08-resultados.md): V-09 `modules[]` says which modules the
// analysis shows, in which order and horizons; this registry maps each module id to what renders it. The content modules
// are placeholder frames until P5-41..P5-46 replace them; `actionRow` and `footerActions` are frame slots the page
// fills. An id the registry does not know (a newer BFF) is skipped and reported once, never thrown.

/** A V-09 module entry; its `id` is any non-empty string (the adapter widens the generated enum, P5-40b). */
export type ResultsModule = V09Response['modules'][number];
/** Module ids the registry knows: the generated V-09 enum. */
export type ResultsModuleId = KnownResultsModuleId;
export type ResultsHorizon = V09Response['horizon'];

/** Modules the page renders itself (action row, footer): the registry places them, the page provides the content. */
export const FRAME_SLOT_IDS = ['actionRow', 'footerActions'] as const;
export type FrameSlotId = (typeof FRAME_SLOT_IDS)[number];

export type ContentModuleId = Exclude<ResultsModuleId, FrameSlotId>;

export interface ModuleViewProps {
  analysisId: string;
  horizon: ResultsHorizon;
  module: ResultsModule;
}

/** A module view: a placeholder frame today, the real module (P5-41..P5-46) later. */
export type ModuleView = ComponentType<ModuleViewProps>;

export type ModuleRegistry = Readonly<Record<ContentModuleId, ModuleView>>;

export type FrameSlots = Partial<Record<FrameSlotId, ReactNode>>;

const warned = new Set<string>();

/**
 * Reports an unknown module id once per id and session (the page must keep working when the BFF adds a module before
 * the front knows it). Exported for tests.
 */
export function reportUnknownModule(id: string): void {
  if (warned.has(id)) return;
  warned.add(id);
  // One diagnostic per unknown id; src has no logger yet. `globalThis.console` instead of an eslint-disable: the
  // architecture ESLint config has no `no-console` and reports such a directive as unused.
  globalThis.console.warn(`[analysis-modules] unknown module id "${id}" from V-09 is not rendered`);
}

/** Test hook: forget the ids already reported. */
export function resetUnknownModuleReports(): void {
  warned.clear();
}

export type ResolvedModule =
  | { kind: 'slot'; module: ResultsModule; slot: FrameSlotId }
  | { kind: 'content'; module: ResultsModule; View: ModuleView };

const isSlot = (id: string): id is FrameSlotId =>
  (FRAME_SLOT_IDS as readonly string[]).includes(id);

/**
 * The modules to render for `horizon`, in V-09 `order`: visible in that horizon, known to the registry. Unknown ids are
 * reported once and dropped.
 */
export function resolveModules(
  modules: readonly ResultsModule[],
  horizon: ResultsHorizon,
  registry: ModuleRegistry,
): ResolvedModule[] {
  return [...modules]
    .filter((module) => module.visibleInHorizons.includes(horizon))
    .sort((a, b) => a.order - b.order)
    .flatMap<ResolvedModule>((module) => {
      const id: string = module.id;
      if (isSlot(id)) return [{ kind: 'slot', module, slot: id }];
      const View = (registry as Readonly<Record<string, ModuleView | undefined>>)[id];
      if (View === undefined) {
        reportUnknownModule(id);
        return [];
      }
      return [{ kind: 'content', module, View }];
    });
}
