import { routes } from '@/shared/config';

// Prototype photo of the mock analyst "Camila Bravo" (assets/user-avatar.png, 72×72 WebP for the 36px @2x avatar).
import mockUserAvatar from './assets/user-avatar.webp';

// Typed session (A-04 `GET /api/v1/session` shape, reduced to what the route guards need, plus the raw
// `navigation[]` that SCR-04 renders). `useSessionQuery`/`fetchSession` (use-session-query.ts) map the real BFF
// response into this shape in http mode; `mockSession` below is the dev/e2e/mock-mode identity.

/** The five functional roles of synthesis §1.19. */
export const ROLES = [
  'analyst_creator',
  'explorer_viewer',
  'explorer_integral',
  'executive_viewer',
  'executive_integral',
] as const;

export type Role = (typeof ROLES)[number];

/** One row of A-04 `navigation[]`, as the BFF sends it (raw `labelKey`/`to`, role-resolved). */
export interface SessionNavigationItem {
  readonly id: string;
  readonly labelKey: string;
  readonly to: string;
  readonly isLocked: boolean;
}

export interface Session {
  readonly userId: string;
  readonly displayName: string;
  /** Photo URL of the user (A-04 `avatarFileId` resolved by O-03); absent → the shell shows the initials. */
  readonly avatarUrl?: string;
  readonly role: Role;
  /** "Administración funcional" flag, orthogonal to the role (§1.19): opens SCR-02 / SCR-03 only. */
  readonly hasAdminAccess: boolean;
  /** A-04 `permissions.canUseAssistant` (CF-40): the Yarbis FAB and panel. */
  readonly canUseAssistant: boolean;
  /** A-04 `navigation[]`, role-resolved by the BFF (targets and locks); SCR-04 renders exactly this list. */
  readonly navigation: readonly SessionNavigationItem[];
}

/** Source the router guards read on every navigation; `null` = no session (unauthenticated). */
export type SessionSource = () => Session | null;

const DISPLAY_NAMES: Readonly<Record<Role, string>> = {
  analyst_creator: 'Camila Bravo',
  explorer_viewer: 'Explorador visualizador',
  explorer_integral: 'Explorador integral',
  executive_viewer: 'Jorge Salas',
  executive_integral: 'Alejandra Ríos',
};

/** Roles that may use the Yarbis assistant (CF-40: analyst_creator and executive_integral). */
const ASSISTANT_ROLES: readonly Role[] = ['analyst_creator', 'executive_integral'];

/** Default competitive analysis of the mock session (A-04 `analysisContext.defaultAnalysisId`). */
export const MOCK_DEFAULT_ANALYSIS_ID = 'ana_01J9Y8D4T2';

/** Rows the role table (synthesis §1.19) locks in the mock identity's `navigation[]`. */
const MOCK_LOCKED: Readonly<Record<Role, readonly string[]>> = {
  analyst_creator: [],
  explorer_viewer: ['presentaciones'],
  explorer_integral: [],
  executive_viewer: ['ref-tbg-ilp', 'ref-competitivo'],
  executive_integral: [],
};

/**
 * The A-04 `navigation[]` of a mock role, as the BFF computes it (navigation-map §4): "Ref. Competitivo" opens
 * Resultados for analyst_creator and Visualización for the other roles; locks follow the role table.
 */
function mockNavigation(role: Role): readonly SessionNavigationItem[] {
  const competitive =
    role === 'analyst_creator'
      ? routes.analysisResults.build({ analysisId: MOCK_DEFAULT_ANALYSIS_ID })
      : routes.analysisReport.build({ analysisId: MOCK_DEFAULT_ANALYSIS_ID });
  const rows: readonly (readonly [id: string, labelKey: string, to: string])[] = [
    ['inicio', 'nav.inicio', routes.home.build()],
    ['ref-tbg-ilp', 'nav.refTbgIlp', routes.analyses.build({}, { ref: 'tbg-ilp' })],
    ['ref-competitivo', 'nav.refCompetitivo', competitive],
    ['monitor-valor', 'nav.monitorValor', routes.valueMonitor.build()],
    ['presentaciones', 'nav.presentaciones', routes.presentations.build()],
    ['notificaciones', 'nav.notificaciones', routes.notifications.build()],
  ];
  return rows.map(([id, labelKey, to]) => ({
    id,
    labelKey,
    to,
    isLocked: MOCK_LOCKED[role].includes(id),
  }));
}

export const isRole = (value: unknown): value is Role =>
  typeof value === 'string' && (ROLES as readonly string[]).includes(value);

/** Mock identity for development and tests (dev/test only, like the BFF mock identity header). */
export function mockSession(role: Role = 'analyst_creator', hasAdminAccess = false): Session {
  return {
    userId: `usr_mock_${role}`,
    displayName: DISPLAY_NAMES[role],
    ...(role === 'analyst_creator' ? { avatarUrl: mockUserAvatar } : {}),
    role,
    hasAdminAccess,
    canUseAssistant: ASSISTANT_ROLES.includes(role),
    navigation: mockNavigation(role),
  };
}
