import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import type { ReactNode } from 'react';

/** Open info panels of one `InfoGroup`, by card info id. */
export interface InfoGroupState {
  readonly openIds: ReadonlySet<string>;
  /** Opens `id` and closes every other panel of the group (CF-61). */
  readonly open: (id: string) => void;
  readonly close: (id: string) => void;
}

const InfoGroupContext = createContext<InfoGroupState | null>(null);

/** The nearest group, or `null` for a card outside any `InfoGroup`. */
export function useInfoGroup(): InfoGroupState | null {
  return useContext(InfoGroupContext);
}

export interface InfoGroupProps {
  /** Controlled open panel (a card `infoId`, or `null` when all are closed). */
  openId?: string | null;
  /** Uncontrolled initial open panel. */
  defaultOpenId?: string | null;
  /** Called with the newly open panel id, or `null` when the open one closes. */
  onOpenIdChange?: (openId: string | null) => void;
  children?: ReactNode;
}

/**
 * Single-open group for the "(i)" info panels of the cards inside it (prototype `chartInfoOpen`, CF-61): opening one
 * panel closes the one that was open. Cards outside the group, or in another group, are independent.
 */
export function InfoGroup({
  openId,
  defaultOpenId = null,
  onOpenIdChange,
  children,
}: InfoGroupProps) {
  const [inner, setInner] = useState<ReadonlySet<string>>(
    () => new Set(defaultOpenId === null ? [] : [defaultOpenId]),
  );
  const openIds = useMemo<ReadonlySet<string>>(
    () => (openId === undefined ? inner : new Set(openId === null ? [] : [openId])),
    [inner, openId],
  );

  const open = useCallback(
    (id: string) => {
      setInner(() => new Set([id]));
      onOpenIdChange?.(id);
    },
    [onOpenIdChange],
  );
  const close = useCallback(
    (id: string) => {
      setInner((current) => {
        if (!current.has(id)) return current;
        const next = new Set(current);
        next.delete(id);
        return next;
      });
      if (openIds.has(id)) onOpenIdChange?.(null);
    },
    [onOpenIdChange, openIds],
  );

  const value = useMemo<InfoGroupState>(() => ({ openIds, open, close }), [openIds, open, close]);
  return <InfoGroupContext.Provider value={value}>{children}</InfoGroupContext.Provider>;
}
