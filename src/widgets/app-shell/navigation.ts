import { matchPath } from 'react-router';

import { routes } from '@/shared/config';

import type { Session } from '@/entities/session';

export { MOCK_DEFAULT_ANALYSIS_ID } from '@/entities/session';

// Sidebar navigation of SCR-04 (navigation-map §4): exactly the six link rows below plus "Salir". The BFF sends them as
// A-04 `navigation[]` (role-resolved targets, `isLocked`) and `shellNavigationFromSession` is the one place that maps
// that list into these rows. Configuración is not a row (CF-88): it is reached from the header avatar. `hasAdminAccess`
// changes nothing here (CF-93).

/** The signed-in user as the shell shows it (A-04 `user`). */
export interface ShellUser {
  readonly displayName: string;
  /** Photo URL (A-04 `avatarFileId` resolved by O-03); initials when absent. */
  readonly avatarUrl?: string;
}

export type ShellNavId =
  'home' | 'refTbgIlp' | 'refCompetitive' | 'valueMonitor' | 'presentations' | 'notifications';

export interface ShellNavItem {
  readonly id: ShellNavId;
  /** Target URL, built with `routes.<key>.build()`. */
  readonly to: string;
  /** Shown with 🔒 at half opacity, not clickable (`navigation[].isLocked`). */
  readonly isLocked: boolean;
}

/** A-04 `navigation[].id` → the row it renders; ids the web doesn't know are ignored. */
const NAV_ID_BY_SESSION_ID: Readonly<Record<string, ShellNavId>> = {
  inicio: 'home',
  'ref-tbg-ilp': 'refTbgIlp',
  'ref-competitivo': 'refCompetitive',
  'monitor-valor': 'valueMonitor',
  presentaciones: 'presentations',
  notificaciones: 'notifications',
};

/**
 * The sidebar rows of a session: exactly the items its A-04 `navigation[]` lists, in that order, with the BFF's own
 * targets and locks (the front never derives them). Items with an id the web has no row for are dropped.
 */
export function shellNavigationFromSession(
  session: Pick<Session, 'navigation'>,
): readonly ShellNavItem[] {
  return session.navigation.flatMap(({ id, to, isLocked }) => {
    const navId = Object.hasOwn(NAV_ID_BY_SESSION_ID, id) ? NAV_ID_BY_SESSION_ID[id] : undefined;
    return navId ? [{ id: navId, to, isLocked }] : [];
  });
}

/**
 * The routes of each row's section (navigation-map §1): a row stays active on every screen below it, whatever its
 * params or query. "Ref. TBG I ILP" owns the analyses list (its target adds `?ref=tbg-ilp`, OQ-03); "Ref. Competitivo"
 * owns the open analysis (definition, results, report and indicator detail, whichever of them the BFF targets);
 * "Presentaciones" also owns the analysis presentations screen (SCR-13).
 */
const SECTION_PATHS: Readonly<Record<ShellNavId, readonly string[]>> = {
  home: [routes.home.path],
  refTbgIlp: [routes.analyses.path],
  refCompetitive: [
    routes.analysisDefinition.path,
    routes.analysisResults.path,
    routes.analysisReport.path,
    routes.indicatorDetail.path,
  ],
  valueMonitor: [routes.valueMonitor.path, routes.sensitivities.path],
  presentations: [
    routes.presentations.path,
    routes.presentationNew.path,
    routes.presentationEdit.path,
    routes.presentationDetail.path,
    routes.analysisPresentations.path,
  ],
  notifications: [routes.notifications.path],
};

/**
 * Whether a row is the current page: the URL is the row's own target (path and every query param of the target), or
 * the path is one of the screens of the row's section (`SECTION_PATHS`), so sub-routes and links that carry a query
 * keep their row highlighted.
 */
export function isNavItemActive(item: ShellNavItem, pathname: string, search: string): boolean {
  const target = new URL(item.to, 'http://local');
  const current = new URLSearchParams(search);
  const isTarget =
    pathname === target.pathname &&
    [...target.searchParams].every(([key, value]) => current.get(key) === value);
  return isTarget || SECTION_PATHS[item.id].some((path) => matchPath(path, pathname) !== null);
}
