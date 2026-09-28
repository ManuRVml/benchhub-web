import { Link, useNavigate } from 'react-router';

import { routes } from '@/shared/config';
import { useT } from '@/shared/i18n';
import { Avatar } from '@/shared/ui/composites/avatar';
import { BellIcon, HelpIcon } from '@/shared/ui/icons';
import { IconButton } from '@/shared/ui/primitives/icon-button';

import type { ShellUser } from './navigation';

export interface AppHeaderProps {
  title: string;
  user: ShellUser;
  unreadNotifications?: number | undefined;
  onHelp?: (() => void) | undefined;
}

/**
 * SCR-04 header (`Cmp:AppHeader`): 4px `gradient.headerStrip` over a 64px white bar with the screen title (the page's
 * h1), the bell (to Notificaciones, red dot when unread > 0), the help button (OVL-12) and the user chip, which opens
 * Configuración (CF-88).
 */
export function AppHeader({ title, user, unreadNotifications, onHelp }: AppHeaderProps) {
  const t = useT();
  const navigate = useNavigate();
  const unread = unreadNotifications ?? 0;
  return (
    <header className="shrink-0">
      <div
        aria-hidden="true"
        className="h-(--size-layout-header-strip) bg-(image:--gradient-header-strip)"
      />
      <div className="flex h-(--size-layout-header) items-center justify-between gap-16 border-b border-border-default bg-surface-header px-24">
        <h1 className="truncate text-title-header text-text-heading" data-testid="app-shell-title">
          {title}
        </h1>
        <div className="flex shrink-0 items-center gap-10">
          <span className="relative inline-flex">
            <IconButton
              icon={BellIcon}
              testId="app-shell-bell"
              aria-label={
                unread > 0
                  ? t('common.a11y.notificationsUnread', { count: unread })
                  : t('common.nav.notifications')
              }
              onClick={() => {
                void navigate(routes.notifications.build());
              }}
            />
            {unread > 0 ? (
              <span
                aria-hidden="true"
                data-testid="app-shell-bell-dot"
                className="absolute top-6 right-8 size-8 rounded-pill bg-status-danger-base"
              />
            ) : null}
          </span>
          {onHelp ? (
            <IconButton
              icon={HelpIcon}
              testId="app-shell-help"
              aria-label={t('common.help.title')}
              onClick={onHelp}
            />
          ) : null}
          <Link
            to={routes.settings.build()}
            data-testid="app-shell-user"
            className="flex items-center gap-8 rounded-pill pr-8 text-13 font-medium text-text-body hover:text-text-heading"
          >
            <Avatar
              name={user.displayName}
              decorative
              {...(user.avatarUrl ? { src: user.avatarUrl } : {})}
            />
            <span>{user.displayName}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
