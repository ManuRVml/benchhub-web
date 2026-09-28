// Route access policies, one per route key. Values restate docs/design/navigation-map.md §3 (role × screen matrix,
// each row sourced from its screen inventory's "Role visibility" bullet) and the redirects of §2; open questions use
// their defaults from docs/design/open-questions.md (OQ-40: error pages render inside the shell only when there is a
// session; OQ-42: a non-analyst opening Resultados is sent to Visualización when the role may open it there).
import { routes } from '@/shared/config';

import type { Role, Session } from '@/entities/session';
import type { RouteKey } from '@/shared/config';

export type AccessDecision =
  { readonly kind: 'allow' } | { readonly kind: 'redirect'; readonly to: string };

export type AccessPolicy = (session: Session | null, url: URL) => AccessDecision;

const allow: AccessDecision = { kind: 'allow' };
const to = (url: string): AccessDecision => ({ kind: 'redirect', to: url });

/** Where the current URL should be restored after login (`/login?returnTo=`). */
const returnTo = (url: URL): string => `${url.pathname}${url.search}`;

const forbidden = (): AccessDecision => to(routes.forbidden.build());

/** Authenticated users only; unauthenticated → `/login?returnTo=<current>` (navigation-map §2). */
const authenticated =
  (inner: (session: Session, url: URL) => AccessDecision): AccessPolicy =>
  (session, url) =>
    session ? inner(session, url) : to(routes.login.build({}, { returnTo: returnTo(url) }));

/** Authenticated users whose role is listed; other roles → `/403`. */
const roles = (allowed: readonly Role[]): AccessPolicy =>
  authenticated((session) => (allowed.includes(session.role) ? allow : forbidden()));

const everyRole = authenticated(() => allow);
const analystOnly = roles(['analyst_creator']);
const exceptExecutiveViewer = roles([
  'analyst_creator',
  'explorer_viewer',
  'explorer_integral',
  'executive_integral',
]);
const exceptExplorerViewer = roles([
  'analyst_creator',
  'explorer_integral',
  'executive_viewer',
  'executive_integral',
]);
const isRelativeInAppPath = (value: string | null): value is string =>
  value !== null && value.startsWith('/') && !value.startsWith('//');

export const ACCESS: Readonly<Record<RouteKey, AccessPolicy>> = {
  // `/` → `/inicio` (SCR-05, navigation-map §2).
  root: () => to(routes.home.build()),
  // SCR-01: public; an authenticated session goes to the gate (admin) or `returnTo` / `/inicio`.
  login: (session, url) => {
    if (!session) return allow;
    if (session.hasAdminAccess) return to(routes.accessGate.build());
    const target = url.searchParams.get('returnTo');
    return to(isRelativeInAppPath(target) ? target : routes.home.build());
  },
  // SCR-02: only `hasAdminAccess`; everyone else → `/inicio`.
  accessGate: authenticated((session) =>
    session.hasAdminAccess ? allow : to(routes.home.build()),
  ),
  // SCR-03: admin only; everyone else → `/403`.
  admin: authenticated((session) => (session.hasAdminAccess ? allow : forbidden())),
  home: everyRole,
  analyses: exceptExecutiveViewer,
  analysisDefinition: analystOnly,
  // SCR-08: analyst only; OQ-42 default for the others.
  analysisResults: authenticated((session, url) => {
    if (session.role === 'analyst_creator') return allow;
    if (session.role === 'executive_viewer') return forbidden();
    const [, , analysisId] = url.pathname.split('/');
    return analysisId
      ? to(routes.analysisReport.build({ analysisId: decodeURIComponent(analysisId) }))
      : forbidden();
  }),
  analysisReport: exceptExecutiveViewer,
  // SCR-10: every role reads; executive_viewer only when opened from a presentation.
  indicatorDetail: authenticated((session, url) =>
    session.role !== 'executive_viewer' || url.searchParams.get('origen') === 'presentacion'
      ? allow
      : forbidden(),
  ),
  valueMonitor: everyRole,
  sensitivities: roles(['analyst_creator', 'executive_integral']),
  presentations: exceptExplorerViewer,
  presentationNew: analystOnly,
  presentationEdit: analystOnly,
  analysisPresentations: exceptExplorerViewer,
  presentationDetail: exceptExplorerViewer,
  notifications: everyRole,
  settings: everyRole,
  // SCR-17: public (OQ-40 decides only whether the shell is drawn around it).
  forbidden: () => allow,
};
