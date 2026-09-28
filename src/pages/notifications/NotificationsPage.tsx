import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';

import { useMarkAllNotificationsRead, useNotificationsView } from '@/entities/notifications';
import { useT } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { formatRelativeTime } from '@/shared/lib/format';
import { useTypedSearchParams } from '@/shared/lib/url';
import { EmptyState } from '@/shared/ui/composites/empty-state';
import {
  BotIcon,
  CommentIcon,
  DataIcon,
  MonitorIcon,
  NewsIcon,
  SystemIcon,
  UsersIcon,
} from '@/shared/ui/icons';
import { Badge } from '@/shared/ui/primitives/badge';
import { ChipGroup } from '@/shared/ui/primitives/chip';
import { SearchInput } from '@/shared/ui/primitives/inputs';

import type { NotificationItem } from '@/entities/notifications';
import type { IconProps } from '@/shared/ui/icons';
import type { ComponentType, ReactNode } from 'react';

const SEVERITIES = ['info', 'success', 'warn', 'error'] as const;
type Severity = (typeof SEVERITIES)[number];

const notificationsSearchParamsSchema = z.object({
  q: z.string().optional(),
  severidad: z.array(z.enum(SEVERITIES)).default([]),
});

const TYPE_LABEL_KEY = {
  dato: 'notifications.type.dato',
  comentario: 'notifications.type.comentario',
  publicacion: 'notifications.type.publicacion',
  ia: 'notifications.type.ia',
  noticia: 'notifications.type.noticia',
  colaboracion: 'notifications.type.colaboracion',
  sistema: 'notifications.type.sistema',
} as const satisfies Record<NotificationItem['type'], string>;

/** The prototype's per-type stroke icon (BencHUD.dc.html:2963-2983), all 20x20 icons of shared/ui/icons (ADR-0006). */
const TYPE_ICON = {
  dato: DataIcon,
  comentario: CommentIcon,
  publicacion: MonitorIcon,
  ia: BotIcon,
  noticia: NewsIcon,
  colaboracion: UsersIcon,
  sistema: SystemIcon,
} as const satisfies Record<NotificationItem['type'], ComponentType<IconProps>>;

/** 3px left border in the severity colour (BencHUD.dc.html:2961, `alertItems` colour map). */
const SEVERITY_BORDER = {
  info: 'border-l-severity-info-base',
  success: 'border-l-severity-success-base',
  warn: 'border-l-severity-warn-base',
  error: 'border-l-severity-error-base',
} as const satisfies Record<Severity, string>;

function isSeverity(value: string): value is Severity {
  return SEVERITIES.includes(value as Severity);
}

interface NotificationsSearchInputProps {
  initialValue: string;
  label: string;
  onDebouncedChange: (value: string | undefined) => void;
}

function NotificationsSearchInput({
  initialValue,
  label,
  onDebouncedChange,
}: NotificationsSearchInputProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (value === initialValue) return undefined;
    const timeout = window.setTimeout(() => {
      onDebouncedChange(value === '' ? undefined : value);
    }, 300);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [initialValue, onDebouncedChange, value]);

  return (
    <SearchInput
      label={label}
      hideLabel
      value={value}
      onValueChange={setValue}
      placeholder={label}
      testId="notifications-search"
    />
  );
}

/**
 * SCR-15 Notificaciones (V-44, C-35, C-36): URL filters are forwarded to V-44, so the BFF remains the source of
 * truth for searching a paged list. Opening the page marks every notification read once (optimistic C-36), guarded by
 * a ref so a re-render (e.g. a background refetch) never re-fires it — only a fresh mount (a real page visit) does.
 *
 * ShellLayout's bell badge reads V-01 (`useShellStatusView`), not V-44: C-35/C-36 invalidate the shell-status query on
 * success, so the badge count drops after the page marks everything read.
 */
export function NotificationsPage() {
  const t = useT();
  const [filters, setFilters] = useTypedSearchParams(notificationsSearchParamsSchema);

  const query = useNotificationsView({
    ...(filters.q === undefined ? {} : { q: filters.q }),
    severity: filters.severidad,
  });
  const markAllRead = useMarkAllNotificationsRead();

  const markedRef = useRef(false);
  useEffect(() => {
    if (query.data && query.data.unreadCount > 0 && !markedRef.current) {
      markedRef.current = true;
      markAllRead.mutate();
    }
  }, [query.data, markAllRead]);

  const header = (
    <>
      <NotificationsSearchInput
        key={filters.q ?? ''}
        initialValue={filters.q ?? ''}
        label={t('notifications.search.placeholder')}
        onDebouncedChange={(q) => {
          setFilters({ q }, { replace: true });
        }}
      />
      {/* "Severidad" label + on/off toggles; none on by default = every severity shown (BencHUD.dc.html:2946-2955). */}
      <div
        className="flex flex-wrap items-center gap-6"
        data-testid="notifications-severity-filter"
      >
        <span aria-hidden="true" className="mr-4 text-eyebrow text-text-muted uppercase">
          {t('notifications.filters.severity.label')}
        </span>
        <ChipGroup
          items={SEVERITIES.map((severity) => ({
            id: severity,
            label: t(`notifications.filters.severity.${severity}`),
          }))}
          mode="multi"
          multiVariant="segment"
          size="toggle"
          className="gap-6"
          value={filters.severidad}
          onChange={(severidad) => {
            const selected = severidad.filter(isSeverity);
            setFilters(
              { severidad: selected.length === 0 ? undefined : selected },
              { replace: true },
            );
          }}
          aria-label={t('notifications.filters.severity.label')}
          testIds={{ scope: 'notifications', component: 'severity-chip' }}
        />
      </div>
    </>
  );

  const shell = (children: ReactNode) => (
    // The app shell header already shows "Notificaciones" as the page h1: no in-content title (F0-3).
    // SCR-15 column (BencHUD.dc.html:2944): max-width 760px, left-aligned, gap 14.
    <section
      data-testid="notifications-page"
      className="flex max-w-(--size-layout-max-width-notificaciones) flex-col gap-14"
    >
      {header}
      {children}
    </section>
  );

  if (query.isLoading) {
    return shell(
      <div className="flex flex-col gap-12">
        {[1, 2, 3].map((i) => (
          <article
            key={i}
            data-testid="notification-skeleton"
            className="h-64 animate-pulse rounded-card bg-surface-page motion-reduce:animate-none"
          />
        ))}
      </div>,
    );
  }

  if (query.error) {
    return shell(
      <EmptyState
        title={t('notifications.error.title')}
        description={t('notifications.error.description')}
        variant="inline"
        action={{
          label: t('notifications.error.retry'),
          onClick: () => {
            void query.refetch();
          },
        }}
        testId="notifications-error"
      />,
    );
  }

  const items = query.data?.items ?? [];

  return shell(
    items.length === 0 ? (
      <EmptyState
        title={t('notifications.empty.title')}
        variant="inline"
        testId="notifications-empty"
      />
    ) : (
      <div className="flex flex-col gap-14">
        {items.map((item) => (
          <NotificationCard key={item.id} item={item} />
        ))}
      </div>
    ),
  );
}

/** One SCR-15 card (BencHUD.dc.html:2961-2986): type icon circle, type / text / time, severity tag on the right. */
function NotificationCard({ item }: { item: NotificationItem }) {
  const t = useT();
  const Icon = TYPE_ICON[item.type];
  return (
    <article
      data-testid="notification-card"
      data-severity={item.severity}
      className={cn(
        'flex items-center gap-14 rounded-control border border-l-3 border-border-default bg-surface-card px-18 py-14',
        SEVERITY_BORDER[item.severity],
      )}
    >
      <span
        data-testid="notification-card-icon"
        data-type={item.type}
        className="flex size-(--size-notification-type-icon) shrink-0 items-center justify-center rounded-pill bg-surface-page text-text-secondary"
      >
        <Icon size={17} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="mb-2 text-10 tracking-wide text-text-muted uppercase">
          {t(TYPE_LABEL_KEY[item.type])}
        </p>
        <p className="mb-3 text-13 font-medium text-text-heading">{item.text}</p>
        <p data-testid="notification-card-time" className="text-11 text-text-muted">
          {formatRelativeTime(item.createdAt, undefined, { capitalize: true })}
        </p>
      </div>
      {!item.isRead ? (
        <span
          role="img"
          className="size-6 shrink-0 rounded-full bg-brand-primary"
          aria-label={t('notifications.item.unread')}
        />
      ) : null}
      <Badge
        kind="severity"
        severity={item.severity}
        size="sm"
        className="shrink-0"
        data-testid="notification-card-tag"
      >
        {t(`notifications.tag.${item.severity}`)}
      </Badge>
    </article>
  );
}
