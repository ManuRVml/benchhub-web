import { Link, useLocation } from 'react-router';

import { useT } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import {
  BellIcon,
  HomeIcon,
  LogoutIcon,
  MonitorIcon,
  ReportIcon,
  ValueTreeIcon,
} from '@/shared/ui/icons';
import { Badge } from '@/shared/ui/primitives/badge';

import benchudLogoCompact from './assets/benchud-logo-compact.png';
import benchudLogo from './assets/benchud-logo.png';
import { isNavItemActive } from './navigation';

import type { ShellNavId, ShellNavItem } from './navigation';
import type { IconProps } from '@/shared/ui/icons';
import type { ComponentType } from 'react';

const ICONS: Readonly<Record<ShellNavId, ComponentType<IconProps>>> = {
  home: HomeIcon,
  refTbgIlp: ReportIcon,
  refCompetitive: ReportIcon,
  valueMonitor: ValueTreeIcon,
  presentations: MonitorIcon,
  notifications: BellIcon,
};

const LABEL_KEYS = {
  home: 'common.nav.home',
  refTbgIlp: 'common.nav.refTbgIlp',
  refCompetitive: 'common.nav.refCompetitive',
  valueMonitor: 'common.nav.valueMonitor',
  presentations: 'common.nav.presentations',
  notifications: 'common.nav.notifications',
} as const satisfies Record<ShellNavId, string>;

const ROW = 'relative flex items-center gap-12 rounded-nav px-12 py-10 text-small-medium';

export interface SidebarProps {
  /** Id of the sidebar element, controlled by the collapse button (`aria-controls`). */
  id: string;
  navigation: readonly ShellNavItem[];
  collapsed: boolean;
  onToggleCollapsed: () => void;
  /** Unread count for the Notificaciones row: a pill when expanded, a dot when collapsed; hidden when 0 / unknown. */
  unreadNotifications?: number | undefined;
  onLogout: () => void;
}

/** Unread count as shown in a badge: the integer, or "99+" above 99. */
export const formatUnread = (count: number): string => (count > 99 ? '99+' : String(count));

/**
 * SCR-04 sidebar (`Cmp:Sidebar`): dark 220 / 68 px rail with the brand, the six navigation rows plus "Salir", and the
 * "‹ Colapsar" toggle. The current row carries `aria-current="page"`; locked rows are shown with 🔒, `aria-disabled` and
 * no link. Collapsed rows keep their label for assistive technology only.
 */
export function Sidebar({
  id,
  navigation,
  collapsed,
  onToggleCollapsed,
  unreadNotifications,
  onLogout,
}: SidebarProps) {
  const t = useT();
  const { pathname, search } = useLocation();
  const unread = unreadNotifications ?? 0;
  const label = (text: string) => (
    <span className={cn('truncate', collapsed && 'sr-only')}>{text}</span>
  );

  return (
    <aside
      id={id}
      data-testid="app-shell-sidebar"
      data-collapsed={collapsed}
      className={cn(
        'sticky top-0 flex h-screen shrink-0 flex-col overflow-hidden bg-dark-surface transition-[width] duration-(--motion-duration-nav)',
        collapsed ? 'w-(--size-layout-sidebar-collapsed)' : 'w-(--size-layout-sidebar-expanded)',
      )}
    >
      <div className="flex h-(--size-layout-header) items-center gap-10 border-b border-dark-divider px-16">
        {/* HTML L164-165: the "BenchHub" artwork, 22px high; the "BH" compact mark when collapsed. */}
        <img
          src={collapsed ? benchudLogoCompact : benchudLogo}
          alt={t('common.brand.logoAlt')}
          data-testid="app-shell-logo"
          data-variant={collapsed ? 'compact' : 'full'}
          className="h-22 w-auto shrink-0"
        />
      </div>

      <nav aria-label={t('common.a11y.mainNav')} className="flex-1 px-8 py-14">
        <ul className="flex flex-col gap-4">
          {navigation.map((item) => {
            const Icon = ICONS[item.id];
            const text = t(LABEL_KEYS[item.id]);
            const badge =
              item.id === 'notifications' && unread > 0 ? (
                collapsed ? (
                  <span
                    aria-hidden="true"
                    className="absolute top-6 left-28 size-8 rounded-pill border-2 border-dark-surface bg-status-danger-base"
                  />
                ) : (
                  <Badge kind="count" className="ml-auto" aria-hidden="true">
                    {formatUnread(unread)}
                  </Badge>
                )
              ) : null;

            if (item.isLocked) {
              return (
                <li key={item.id}>
                  <span
                    aria-disabled="true"
                    data-testid={`app-shell-nav-${item.id}`}
                    className={cn(ROW, 'cursor-not-allowed text-text-on-dark-locked opacity-50')}
                  >
                    <Icon size={20} />
                    {label(text)}
                    {collapsed ? null : (
                      <span className="ml-auto text-11">
                        <span aria-hidden="true">{'🔒'}</span>
                        <span className="sr-only">{t('common.a11y.locked')}</span>
                      </span>
                    )}
                  </span>
                </li>
              );
            }

            const active = isNavItemActive(item, pathname, search);
            return (
              <li key={item.id}>
                <Link
                  to={item.to}
                  data-testid={`app-shell-nav-${item.id}`}
                  {...(active ? { 'aria-current': 'page' as const } : {})}
                  className={cn(
                    ROW,
                    active
                      ? 'bg-brand-nav-active text-text-inverse'
                      : 'text-text-on-dark-nav-text hover:bg-dark-hover [&_svg]:text-text-on-dark-nav-icon',
                  )}
                >
                  <Icon size={20} />
                  {label(text)}
                  {badge}
                </Link>
                {item.id === 'notifications' && unread > 0 ? (
                  <span className="sr-only">
                    {t('common.a11y.notificationsUnread', { count: unread })}
                  </span>
                ) : null}
              </li>
            );
          })}
          <li>
            <button
              type="button"
              data-testid="app-shell-nav-logout"
              className={cn(ROW, 'w-full text-text-on-dark-note hover:bg-dark-hover')}
              onClick={onLogout}
            >
              <LogoutIcon size={20} />
              {label(t('common.nav.logout'))}
            </button>
          </li>
        </ul>
      </nav>

      <div className="border-t border-dark-divider px-16 py-14">
        <button
          type="button"
          data-testid="app-shell-collapse"
          aria-expanded={!collapsed}
          aria-controls={id}
          {...(collapsed ? { 'aria-label': t('common.a11y.expandSidebar') } : {})}
          className="text-small text-text-on-dark-nav-toggle hover:text-text-inverse"
          onClick={onToggleCollapsed}
        >
          {collapsed ? '›' : t('common.nav.collapse')}
        </button>
      </div>
    </aside>
  );
}
