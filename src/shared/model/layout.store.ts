// Layout UI state (brief §5.3, ADR-0005). Persisted because the sidebar "‹ Colapsar" control of the V2 shell is a user
// preference that must survive reloads; only `sidebarCollapsed` is written to localStorage.
import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';

import { storeDevtools } from '@/shared/lib/store';

export interface LayoutState {
  readonly sidebarCollapsed: boolean;
}

export interface LayoutActions {
  readonly toggleSidebar: () => void;
  readonly setSidebarCollapsed: (collapsed: boolean) => void;
}

export type LayoutStore = LayoutState & LayoutActions;

/** localStorage key of the persisted layout preference. */
export const LAYOUT_STORAGE_KEY = 'eco.layout';

export const useLayoutStore = create<LayoutStore>()(
  devtools(
    persist(
      (set) => ({
        sidebarCollapsed: false,
        toggleSidebar: () => {
          set(
            (state) => ({ sidebarCollapsed: !state.sidebarCollapsed }),
            false,
            'layout/toggleSidebar',
          );
        },
        setSidebarCollapsed: (collapsed) => {
          set({ sidebarCollapsed: collapsed }, false, 'layout/setSidebarCollapsed');
        },
      }),
      {
        name: LAYOUT_STORAGE_KEY,
        version: 1,
        storage: createJSONStorage(() => localStorage),
        partialize: (state): LayoutState => ({ sidebarCollapsed: state.sidebarCollapsed }),
      },
    ),
    storeDevtools('layout'),
  ),
);

export const selectSidebarCollapsed = (state: LayoutStore): boolean => state.sidebarCollapsed;
export const selectToggleSidebar = (state: LayoutStore): LayoutActions['toggleSidebar'] =>
  state.toggleSidebar;
export const selectSetSidebarCollapsed = (
  state: LayoutStore,
): LayoutActions['setSidebarCollapsed'] => state.setSidebarCollapsed;
