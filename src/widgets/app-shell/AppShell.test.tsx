import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, Outlet, RouterProvider } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { mockSession } from '@/entities/session';
import { routes } from '@/shared/config';
import { LAYOUT_STORAGE_KEY, useLayoutStore } from '@/shared/model';

import { AppShell } from './AppShell';
import { shellNavigationFromSession } from './navigation';

import type { Role, SessionNavigationItem } from '@/entities/session';
import type { RouteKey } from '@/shared/config';

const PAGE_KEYS: readonly RouteKey[] = [
  'home',
  'analyses',
  'analysisDefinition',
  'analysisResults',
  'analysisReport',
  'indicatorDetail',
  'valueMonitor',
  'sensitivities',
  'presentations',
  'presentationDetail',
  'presentationEdit',
  'notifications',
  'settings',
  'forbidden',
];

interface Options {
  role?: Role;
  /** Overrides the session navigation the shell renders (default: the mock session of `role`). */
  sessionNavigation?: readonly SessionNavigationItem[];
  url?: string;
  unread?: number;
  analysisName?: string;
  avatarUrl?: string;
  withHelp?: boolean;
}

function renderShell({
  role = 'analyst_creator',
  sessionNavigation,
  url = routes.home.build(),
  unread,
  analysisName,
  avatarUrl,
  withHelp = false,
}: Options = {}) {
  const onLogout = vi.fn();
  const onHelp = vi.fn();
  const router = createMemoryRouter(
    [
      {
        id: 'app-shell',
        element: (
          <AppShell
            user={{ displayName: 'Camila Bravo', ...(avatarUrl ? { avatarUrl } : {}) }}
            navigation={shellNavigationFromSession({
              navigation: sessionNavigation ?? mockSession(role).navigation,
            })}
            unreadNotifications={unread}
            analysisName={analysisName}
            onLogout={onLogout}
            {...(withHelp ? { onHelp } : {})}
          >
            <Outlet />
          </AppShell>
        ),
        children: PAGE_KEYS.map((key) => ({
          id: key,
          path: routes[key].path,
          element: <p>{key}</p>,
        })),
      },
    ],
    { initialEntries: [url] },
  );
  render(<RouterProvider router={router} />);
  return { router, onLogout, onHelp };
}

const nav = () => screen.getByRole('navigation', { name: 'Navegación principal' });
const row = (id: string) => screen.getByTestId(`app-shell-nav-${id}`);

beforeEach(() => {
  localStorage.clear();
  useLayoutStore.setState(useLayoutStore.getInitialState(), true);
});

describe('AppShell sidebar', () => {
  it('renders the 7 SCR-04 rows for analyst_creator, none locked', () => {
    renderShell();
    const items = within(nav()).getAllByRole('listitem');
    expect(items).toHaveLength(7);
    expect(items.map((item) => item.textContent)).toEqual([
      'Inicio',
      'Ref. TBG I ILP',
      'Ref. Competitivo',
      'Monitor de Valor',
      'Presentaciones',
      'Notificaciones',
      'Salir',
    ]);
    expect(within(nav()).getAllByRole('link')).toHaveLength(6);
    expect(within(nav()).getByRole('button', { name: 'Salir' })).toBeInTheDocument();
    expect(within(nav()).queryByText('Configuración')).toBeNull();
    expect(row('refCompetitive')).toHaveAttribute(
      'href',
      routes.analysisResults.build({ analysisId: 'ana_01J9Y8D4T2' }),
    );
  });

  it.each([
    ['explorer_viewer', ['presentations']],
    ['executive_viewer', ['refTbgIlp', 'refCompetitive']],
    ['explorer_integral', []],
    ['executive_integral', []],
  ] as const)('locks the rows of %s per the role table', (role, locked) => {
    renderShell({ role });
    const ids = [
      'home',
      'refTbgIlp',
      'refCompetitive',
      'valueMonitor',
      'presentations',
      'notifications',
    ];
    const lockedRows = ids.filter((id) => row(id).getAttribute('aria-disabled') === 'true');
    expect(lockedRows).toEqual(locked);
    expect(lockedRows.map((id) => row(id).tagName)).not.toContain('A');
    expect(lockedRows.every((id) => row(id).textContent.includes('No disponible'))).toBe(true);
    expect(ids.filter((id) => row(id).tagName === 'A')).toEqual(
      ids.filter((id) => !lockedRows.includes(id)),
    );
    expect(within(nav()).getAllByRole('listitem')).toHaveLength(7);
  });

  it('renders exactly the items the session lists, in that order, with its targets and locks', () => {
    const [home, tbg, competitive, monitor, presentations, notifications] =
      mockSession().navigation;
    if (!home || !tbg || !competitive || !monitor || !presentations || !notifications) {
      throw new Error('the mock session lists six items');
    }
    renderShell({
      sessionNavigation: [
        notifications,
        { ...presentations, isLocked: true },
        { ...monitor, to: routes.notifications.build() },
        home,
      ],
    });
    const items = within(nav()).getAllByRole('listitem');
    expect(items.map((item) => item.textContent)).toEqual([
      'Notificaciones',
      'Presentaciones🔒No disponible',
      'Monitor de Valor',
      'Inicio',
      'Salir',
    ]);
    expect(row('presentations')).toHaveAttribute('aria-disabled', 'true');
    expect(row('valueMonitor')).toHaveAttribute('href', routes.notifications.build());
    expect(screen.queryByTestId('app-shell-nav-refTbgIlp')).toBeNull();
    expect(screen.queryByTestId('app-shell-nav-refCompetitive')).toBeNull();
  });

  it('ignores a navigation id the web does not know, without crashing', () => {
    const [home, tbg] = mockSession().navigation;
    if (!home || !tbg) throw new Error('the mock session lists six items');
    renderShell({
      sessionNavigation: [
        home,
        {
          id: 'reportes-futuros',
          labelKey: 'nav.reportesFuturos',
          to: '/reportes',
          isLocked: false,
        },
        { id: 'toString', labelKey: 'nav.toString', to: '/x', isLocked: false },
        tbg,
      ],
    });
    expect(
      within(nav())
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual(['Inicio', 'Ref. TBG I ILP', 'Salir']);
  });

  it('sends non-analyst roles to Visualización from "Ref. Competitivo"', () => {
    renderShell({ role: 'executive_integral' });
    expect(row('refCompetitive')).toHaveAttribute(
      'href',
      routes.analysisReport.build({ analysisId: 'ana_01J9Y8D4T2' }),
    );
  });

  it('marks the current route with aria-current="page" and follows navigation', async () => {
    const user = userEvent.setup();
    renderShell({ url: routes.valueMonitor.build() });
    expect(row('valueMonitor')).toHaveAttribute('aria-current', 'page');
    expect(
      within(nav())
        .getAllByRole('link')
        .filter((link) => link.hasAttribute('aria-current')),
    ).toHaveLength(1);
    await user.click(row('presentations'));
    expect(row('presentations')).toHaveAttribute('aria-current', 'page');
    expect(row('valueMonitor')).not.toHaveAttribute('aria-current');
  });

  it('activates "Ref. TBG I ILP" only on the list opened with ref=tbg-ilp', () => {
    renderShell({ url: routes.analyses.build({}, { ref: 'tbg-ilp' }) });
    expect(row('refTbgIlp')).toHaveAttribute('aria-current', 'page');
  });

  it.each([
    [routes.analyses.build(), 'refTbgIlp'],
    [routes.analysisResults.build({ analysisId: 'ana_1' }, { horizonte: 'ilp' }), 'refCompetitive'],
    [routes.analysisReport.build({ analysisId: 'ana_1' }), 'refCompetitive'],
    [routes.sensitivities.build(), 'valueMonitor'],
    [routes.presentationDetail.build({ presentationId: 'prs_1' }), 'presentations'],
    [routes.presentationEdit.build({ presentationId: 'prs_1' }), 'presentations'],
  ])('keeps the section row current on the sub-route %s', (url, id) => {
    renderShell({ url });
    const current = within(nav())
      .getAllByRole('link')
      .filter((link) => link.hasAttribute('aria-current'));
    expect(current).toEqual([row(id)]);
    expect(row(id)).toHaveClass('bg-brand-nav-active');
  });

  it('keeps no row current on /configuracion (CF-88)', () => {
    renderShell({ url: routes.settings.build() });
    expect(
      within(nav())
        .getAllByRole('link')
        .some((link) => link.hasAttribute('aria-current')),
    ).toBe(false);
  });

  it('collapses with aria-expanded / aria-controls, switches width and persists the preference', async () => {
    const user = userEvent.setup();
    renderShell();
    const toggle = screen.getByRole('button', { name: '‹ Colapsar' });
    const sidebar = screen.getByTestId('app-shell-sidebar');
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(toggle).toHaveAttribute('aria-controls', sidebar.id);
    expect(sidebar).toHaveClass('w-(--size-layout-sidebar-expanded)');
    await user.click(toggle);
    const collapsed = screen.getByRole('button', { name: 'Expandir menú' });
    expect(collapsed).toHaveAttribute('aria-expanded', 'false');
    expect(sidebar).toHaveClass('w-(--size-layout-sidebar-collapsed)');
    expect(JSON.parse(localStorage.getItem(LAYOUT_STORAGE_KEY) ?? '{}')).toMatchObject({
      state: { sidebarCollapsed: true },
    });
    expect(within(nav()).getByRole('link', { name: 'Inicio' })).toBeInTheDocument();
    await user.click(collapsed);
    expect(sidebar).toHaveClass('w-(--size-layout-sidebar-expanded)');
  });

  it('calls onLogout from "Salir"', async () => {
    const user = userEvent.setup();
    const { onLogout } = renderShell();
    await user.click(screen.getByRole('button', { name: 'Salir' }));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});

describe('AppShell header', () => {
  it('shows the unread count on the bell and the Notificaciones row', () => {
    renderShell({ unread: 11 });
    expect(
      screen.getByRole('button', { name: 'Notificaciones (11 sin leer)' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('app-shell-bell-dot')).toBeInTheDocument();
    expect(within(row('notifications')).getByText('11')).toBeInTheDocument();
  });

  it('caps the count at 99+ and hides badge and dot when there is nothing unread', () => {
    renderShell({ unread: 120 });
    expect(within(row('notifications')).getByText('99+')).toBeInTheDocument();
  });

  it('hides badge and dot when the count is 0 or unknown', () => {
    renderShell({ unread: 0 });
    expect(screen.getByRole('button', { name: 'Notificaciones' })).toBeInTheDocument();
    expect(screen.queryByTestId('app-shell-bell-dot')).toBeNull();
  });

  it.each([
    [routes.home.build(), 'Dashboard'],
    [routes.analyses.build(), 'Análisis'],
    [routes.analysisDefinition.build({ analysisId: 'ana_1' }), 'Definición del análisis'],
    [routes.analysisResults.build({ analysisId: 'ana_1' }), 'Resultados'],
    [routes.analysisReport.build({ analysisId: 'ana_1' }), 'Visualización · Dashboard'],
    [
      routes.indicatorDetail.build({ analysisId: 'ana_1', indicatorId: 'ind_roace' }),
      'Detalle de indicador',
    ],
    [routes.valueMonitor.build(), 'Monitor de Valor'],
    [routes.sensitivities.build(), 'Sensibilidades'],
    [routes.presentations.build(), 'Presentaciones'],
    [routes.presentationDetail.build({ presentationId: 'prs_1' }), 'Presentaciones'],
    [routes.notifications.build(), 'Notificaciones'],
    [routes.settings.build(), 'Configuración'],
    [routes.forbidden.build(), 'BencHUD'],
  ])('titles %s as "%s" in the page h1 and document.title', (url, title) => {
    renderShell({ url });
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(title);
    expect(document.title).toBe(title === 'BencHUD' ? 'BencHUD' : `${title} · BencHUD`);
  });

  it('titles Resultados with the analysis name', () => {
    renderShell({
      url: routes.analysisResults.build({ analysisId: 'ana_1' }),
      analysisName: 'Desempeño comparativo — 4T 2025',
    });
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Resultados · Desempeño comparativo — 4T 2025',
    );
  });

  it('opens Configuración from the avatar and name', async () => {
    const user = userEvent.setup();
    const { router } = renderShell();
    await user.click(screen.getByRole('link', { name: 'Camila Bravo' }));
    expect(router.state.location.pathname).toBe(routes.settings.build());
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Configuración');
  });

  it('shows the BencHUD logo image, and the compact mark when collapsed', async () => {
    const user = userEvent.setup();
    renderShell();
    const logo = screen.getByRole('img', { name: 'BencHUD' });
    expect(logo).toHaveAttribute('data-testid', 'app-shell-logo');
    expect(logo.getAttribute('src')).toMatch(/benchud-logo\.png$/);
    expect(logo).toHaveClass('h-22');
    await user.click(screen.getByRole('button', { name: '‹ Colapsar' }));
    expect(screen.getByRole('img', { name: 'BencHUD' }).getAttribute('src')).toMatch(
      /benchud-logo-compact\.png$/,
    );
  });

  it('shows the "?" help button between the bell and the user and calls onHelp', async () => {
    const user = userEvent.setup();
    const { onHelp } = renderShell({ withHelp: true });
    const help = screen.getByRole('button', { name: 'Ayuda y documentación' });
    expect(help).toHaveAttribute('data-testid', 'app-shell-help');
    const bell = screen.getByTestId('app-shell-bell');
    const userChip = screen.getByTestId('app-shell-user');
    expect(bell.compareDocumentPosition(help) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(help.compareDocumentPosition(userChip) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    await user.click(help);
    expect(onHelp).toHaveBeenCalledTimes(1);
  });

  it('shows the user photo, or the initials without one', () => {
    renderShell({ avatarUrl: '/assets/user-avatar.webp' });
    const avatar = within(screen.getByTestId('app-shell-user')).getByTestId('avatar');
    expect(avatar.tagName).toBe('IMG');
    expect(avatar).toHaveAttribute('src', '/assets/user-avatar.webp');
    expect(avatar).toHaveAttribute('alt', '');
    expect(screen.getByRole('link', { name: 'Camila Bravo' })).toBeInTheDocument();
  });

  it('falls back to the initials when the user has no photo', () => {
    renderShell();
    const avatar = within(screen.getByTestId('app-shell-user')).getByTestId('avatar');
    expect(avatar.tagName).toBe('SPAN');
    expect(avatar).toHaveTextContent('CB');
  });

  it('opens Notificaciones from the bell', async () => {
    const user = userEvent.setup();
    const { router } = renderShell();
    await user.click(screen.getByTestId('app-shell-bell'));
    expect(router.state.location.pathname).toBe(routes.notifications.build());
  });
});

describe('AppShell landmarks', () => {
  it('offers a skip link to the main content', async () => {
    const user = userEvent.setup();
    renderShell();
    const skip = screen.getByRole('link', { name: 'Saltar al contenido principal' });
    const main = screen.getByRole('main');
    expect(skip).toHaveAttribute('href', `#${main.id}`);
    await user.tab();
    expect(skip).toHaveFocus();
    expect(main).toHaveTextContent('home');
  });
});
