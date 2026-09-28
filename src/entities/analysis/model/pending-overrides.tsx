import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import type { ValueOverride } from '../api/optimistic-patches';
import type { ReactNode } from 'react';

// Unsaved value edits of the SCR-08 modules. The modules (P5-41 "Detalle y edición", P5-42 comparisons) stage edits
// here; the footer's "Guardar" persists them with C-06 and clears them. One edit per company × indicator (last wins).
// Lives in `entities/analysis` (not a widget) because two sibling widgets (analysis-modules, company-coverage) both
// need it: a widget slice may only import a lower layer, never another widget (FSD boundary,
// `tools/architecture/fsd-rules.js`).

interface PendingOverrides {
  overrides: readonly ValueOverride[];
  stage: (override: ValueOverride) => void;
  clear: () => void;
}

const PendingOverridesContext = createContext<PendingOverrides | null>(null);

const keyOf = (override: ValueOverride) => `${override.companyId}|${override.indicatorId}`;

export function PendingOverridesProvider({
  initial = [],
  children,
}: {
  /** Seed (stories, tests). */
  initial?: readonly ValueOverride[];
  children: ReactNode;
}) {
  const [byKey, setByKey] = useState(() => new Map(initial.map((o) => [keyOf(o), o])));
  const stage = useCallback((override: ValueOverride) => {
    setByKey((current) => new Map(current).set(keyOf(override), override));
  }, []);
  const clear = useCallback(() => {
    setByKey(new Map());
  }, []);
  const value = useMemo(
    () => ({ overrides: [...byKey.values()], stage, clear }),
    [byKey, stage, clear],
  );
  return (
    <PendingOverridesContext.Provider value={value}>{children}</PendingOverridesContext.Provider>
  );
}

/** Pending edits of the current analysis; throws outside `PendingOverridesProvider`. */
export function usePendingOverrides(): PendingOverrides {
  const context = useContext(PendingOverridesContext);
  if (!context) throw new Error('usePendingOverrides must be used inside PendingOverridesProvider');
  return context;
}
