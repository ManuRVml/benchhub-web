import { Link } from 'react-router';

import { useAdminHomeView } from '@/entities/admin';
import { useLogout } from '@/entities/session';
import { isApiError } from '@/shared/api';
import { routes } from '@/shared/config';
import { useT } from '@/shared/i18n';
import { Skeleton } from '@/shared/ui/composites/skeleton';
import { SectionBoundary } from '@/shared/ui/layout/section-boundary';
import { Button } from '@/shared/ui/primitives/button';

import { adminPageTestIds } from './test-ids';

import type { AdminHomeView } from '@/entities/admin';
import type { KnownAdminCardId } from '@/shared/api';
import type { SectionResult } from '@/shared/api/section-result';

// V-02 returns only each card's `id` and `isAvailable`; SCR-03 keeps the titles and descriptions in i18n, keyed by id.
const CARD_COPY = {
  'users-roles': {
    title: 'admin.tiles.usersRoles.title',
    description: 'admin.tiles.usersRoles.description',
  },
  'data-sources': {
    title: 'admin.tiles.dataSources.title',
    description: 'admin.tiles.dataSources.description',
  },
  'companies-peers': {
    title: 'admin.tiles.companiesPeers.title',
    description: 'admin.tiles.companiesPeers.description',
  },
  'system-parameters': {
    title: 'admin.tiles.systemParameters.title',
    description: 'admin.tiles.systemParameters.description',
  },
  audit: {
    title: 'admin.tiles.audit.title',
    description: 'admin.tiles.audit.description',
  },
} as const satisfies Record<KnownAdminCardId, { title: string; description: string }>;

const CARD_IDS = Object.keys(CARD_COPY) as KnownAdminCardId[];

function isKnownCard(id: string): id is KnownAdminCardId {
  return Object.hasOwn(CARD_COPY, id);
}

function toSectionResult(
  data: AdminHomeView | undefined,
  error: unknown,
): SectionResult<AdminHomeView> | undefined {
  if (data !== undefined) return { status: 'ok', data };
  if (error === null || error === undefined) return undefined;
  if (isApiError(error) && error.code === 'FORBIDDEN') return { status: 'forbidden' };
  return { status: 'error', errorCode: isApiError(error) ? error.code : 'UNKNOWN' };
}

const GRID_CLASS = 'tablet:grid-cols-2 desktop:grid-cols-3 grid grid-cols-1 gap-16';

/**
 * SCR-03 Administración: a standalone back-office landing page. The top bar is chrome and always renders; the card
 * grid is V-02 (contract order, an id the web has no copy for is skipped). Every card is a non-interactive placeholder
 * in v1 -- the sub-routes of an available module are future scope -- so `isAvailable` is only exposed as
 * `data-available`. "Cerrar sesión" calls A-03 and always ends on /login, like the app shell's logout.
 */
export function AdminPage() {
  const t = useT();
  const logout = useLogout();
  const query = useAdminHomeView();

  return (
    <div className="min-h-screen bg-surface-page" data-testid={adminPageTestIds.root}>
      <header className="flex items-center justify-between border-b border-border-default px-32 py-18">
        <div className="flex items-center gap-12">
          <Link
            to={routes.accessGate.build()}
            className="text-13 font-medium text-brand-primary hover:text-brand-primary-dark"
          >
            {t('admin.topBar.backLink')}
          </Link>
          <h1 className="text-16 font-semibold text-text-heading">{t('admin.topBar.title')}</h1>
        </div>
        <Button
          variant="link"
          onClick={() => {
            void logout();
          }}
        >
          {t('admin.topBar.logout')}
        </Button>
      </header>
      <main className="mx-auto max-w-960 px-32 py-32">
        <SectionBoundary
          scope="admin-home"
          result={toSectionResult(query.data, query.error)}
          isLoading={query.isFetching && query.data === undefined}
          onRetry={() => {
            void query.refetch();
          }}
          skeleton={
            <ul className={GRID_CLASS} aria-busy="true">
              {CARD_IDS.map((id) => (
                <li key={id}>
                  <Skeleton shape="block" size={96} />
                </li>
              ))}
            </ul>
          }
        >
          {(view) => (
            <ul className={GRID_CLASS}>
              {view.cards.map((card) =>
                isKnownCard(card.id) ? (
                  <li
                    key={card.id}
                    data-testid={adminPageTestIds.card(card.id)}
                    data-available={card.isAvailable}
                    className="rounded-card border border-border-default bg-surface-card p-20"
                  >
                    <h2 className="mb-8 text-14 font-semibold text-text-heading">
                      {t(CARD_COPY[card.id].title)}
                    </h2>
                    <p className="text-12 text-text-secondary">
                      {t(CARD_COPY[card.id].description)}
                    </p>
                  </li>
                ) : null,
              )}
            </ul>
          )}
        </SectionBoundary>
      </main>
    </div>
  );
}
