import { useEffect, useId } from 'react';
import { useLocation } from 'react-router';

import { useT } from '@/shared/i18n';
import { selectSidebarCollapsed, selectToggleSidebar, useLayoutStore } from '@/shared/model';

import { AppHeader } from './AppHeader';
import { useHeaderTitle } from './header-title';
import { Sidebar } from './Sidebar';

import type { ShellNavItem, ShellUser } from './navigation';
import type { ReactNode } from 'react';

export interface AppShellProps {
  readonly user: ShellUser;
  /** A-04 `navigation[]` (role-resolved targets and locks); `shellNavigationFromSession(session)`. */
  readonly navigation: readonly ShellNavItem[];
  /** V-01 unread count; `undefined` while unknown hides the badge and dots (SCR-04 States). */
  readonly unreadNotifications?: number | undefined;
  /** Name of the open analysis, for the "Resultados · {analysisName}" title. */
  readonly analysisName?: string | undefined;
  /** "Salir" (A-03 logout, then `/login`). */
  readonly onLogout: () => void;
  /** Header "?" (OVL-12 Ayuda y documentación); the button is shown only when given. */
  readonly onHelp?: (() => void) | undefined;
  /** Floating layer slot for the Yarbis FAB + panel (P5-31); rendered only when the session may use it. */
  readonly assistant?: ReactNode;
  readonly children: ReactNode;
}

const MAIN_ID = 'app-main';

/**
 * SCR-04 app shell (`Cmp:AppShell`), the layout of every in-app screen: skip link, sidebar (collapse state persisted
 * in `useLayoutStore`), header with the route title as the page h1, the scrolling content area where each screen fades
 * up on entry (no motion under `prefers-reduced-motion`), and the floating assistant slot. Presentational: session,
 * navigation and counts come in through props, so the session query (P5-04b) can replace the mock without changes here.
 */
export function AppShell({
  user,
  navigation,
  unreadNotifications,
  analysisName,
  onLogout,
  onHelp,
  assistant,
  children,
}: AppShellProps) {
  const t = useT();
  const sidebarId = useId();
  const { pathname } = useLocation();
  const collapsed = useLayoutStore(selectSidebarCollapsed);
  const toggleSidebar = useLayoutStore(selectToggleSidebar);
  const title = useHeaderTitle(analysisName);
  const brand = t('common.brand.name');

  useEffect(() => {
    document.title = title === brand ? brand : `${title} · ${brand}`;
  }, [title, brand]);

  return (
    <div data-testid="app-shell" className="flex min-h-screen bg-surface-page">
      <a
        href={`#${MAIN_ID}`}
        className="sr-only focus:not-sr-only focus:fixed focus:top-8 focus:left-8 focus:z-(--z-toast) focus:rounded-control focus:bg-surface-card focus:px-12 focus:py-8 focus:text-13 focus:text-text-link"
      >
        {t('common.a11y.skipToContent')}
      </a>
      <Sidebar
        id={sidebarId}
        navigation={navigation}
        collapsed={collapsed}
        onToggleCollapsed={toggleSidebar}
        unreadNotifications={unreadNotifications}
        onLogout={onLogout}
      />
      <div className="flex h-screen min-w-0 flex-1 flex-col">
        <AppHeader
          title={title}
          user={user}
          unreadNotifications={unreadNotifications}
          onHelp={onHelp}
        />
        <main
          id={MAIN_ID}
          tabIndex={-1}
          className="flex-1 overflow-auto px-content-x pt-content-top pb-content-bottom focus:outline-none"
        >
          {/* Keyed by path: each screen is a new element, so @starting-style replays the fade-up (motion-safe only). */}
          <div
            key={pathname}
            className="motion-safe:transition-[opacity,translate] motion-safe:duration-(--motion-duration-screen-enter) motion-safe:starting:translate-y-(--motion-distance-fade-up) motion-safe:starting:opacity-0"
          >
            {children}
          </div>
        </main>
      </div>
      {assistant}
    </div>
  );
}
