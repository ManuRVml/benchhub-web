import { Outlet, createBrowserRouter } from 'react-router';

import { NOT_FOUND_PATH, routes } from '@/shared/config';
import { useT } from '@/shared/i18n';
import { Skeleton } from '@/shared/ui/composites/skeleton';

import { guardLoader } from './guards';
import { RouteError } from './RouteError';
import { ShellLayout } from './ShellLayout';

import type { ShellLayoutData } from './ShellLayout';
import type { SessionSource } from '@/entities/session';
import type { RouteKey } from '@/shared/config';
import type { ComponentType } from 'react';
import type { RouteObject } from 'react-router';

type LazyPage = () => Promise<ComponentType>;

// One lazy module per page (brief §5.4): the page chunk loads only when its route matches.
const PAGES: Readonly<Record<Exclude<RouteKey, 'root'>, LazyPage>> = {
  login: async () => (await import('@/pages/login')).LoginPage,
  accessGate: async () => (await import('@/pages/access-gate')).AccessGatePage,
  admin: async () => (await import('@/pages/admin')).AdminPage,
  home: async () => (await import('@/pages/home')).HomePage,
  analyses: async () => (await import('@/pages/analyses')).AnalysesPage,
  analysisDefinition: async () =>
    (await import('@/pages/analysis-definition')).AnalysisDefinitionPage,
  analysisResults: async () => (await import('@/pages/analysis-results')).AnalysisResultsPage,
  analysisReport: async () => (await import('@/pages/analysis-report')).AnalysisReportPage,
  indicatorDetail: async () => (await import('@/pages/indicator-detail')).IndicatorDetailPage,
  valueMonitor: async () => (await import('@/pages/value-monitor')).ValueMonitorPage,
  sensitivities: async () => (await import('@/pages/sensitivities')).SensitivitiesPage,
  presentations: async () => (await import('@/pages/presentations')).PresentationsPage,
  presentationNew: async () => (await import('@/pages/presentations')).PresentationsPage,
  presentationEdit: async () => (await import('@/pages/presentations')).PresentationsPage,
  analysisPresentations: async () => (await import('@/pages/presentations')).PresentationsPage,
  presentationDetail: async () =>
    (await import('@/pages/presentation-detail')).PresentationDetailPage,
  notifications: async () => (await import('@/pages/notifications')).NotificationsPage,
  settings: async () => (await import('@/pages/settings')).SettingsPage,
  forbidden: async () => (await import('@/pages/forbidden')).ForbiddenPage,
};

const loadNotFound: LazyPage = async () => (await import('@/pages/not-found')).NotFoundPage;

/** Screens drawn without the app shell (SCR-01 / SCR-02 / SCR-03 have no app header). */
const STANDALONE: readonly RouteKey[] = ['login', 'accessGate', 'admin'];

/** Route id of the SCR-04 pathless layout route. */
export const APP_SHELL_ROUTE_ID = 'app-shell';

export function createAppRoutes(getSession: SessionSource): RouteObject[] {
  const pageRoute = (key: Exclude<RouteKey, 'root'>): RouteObject => ({
    id: key,
    path: routes[key].path,
    loader: guardLoader(key, getSession),
    errorElement: <RouteError />,
    lazy: async () => ({ Component: await PAGES[key]() }),
  });
  const pageKeys = Object.keys(PAGES) as Exclude<RouteKey, 'root'>[];

  return [
    {
      id: 'root',
      path: routes.root.path,
      loader: guardLoader('root', getSession),
      Component: Outlet,
      HydrateFallback,
    },
    ...STANDALONE.map((key) => pageRoute(key as Exclude<RouteKey, 'root'>)),
    {
      id: APP_SHELL_ROUTE_ID,
      loader: (): ShellLayoutData => ({ session: getSession() }),
      Component: ShellLayout,
      errorElement: <RouteError />,
      children: [
        ...pageKeys.filter((key) => !STANDALONE.includes(key)).map(pageRoute),
        {
          id: 'notFound',
          path: NOT_FOUND_PATH,
          errorElement: <RouteError />,
          lazy: async () => ({ Component: await loadNotFound() }),
        },
      ],
    },
  ];
}

export const createAppRouter = (getSession: SessionSource) =>
  createBrowserRouter(createAppRoutes(getSession));

/**
 * A full-page loading state rendered by React Router while the root loader hydrates.
 * Uses the app's existing skeleton component with tokens only, aria-busy and visually hidden i18n.
 */
function HydrateFallback() {
  const t = useT();

  return (
    <div
      aria-busy="true"
      data-testid="hydrate-fallback"
      role="status"
      className="flex min-h-screen flex-col items-center justify-center bg-surface-page"
    >
      <Skeleton shape="block" size={120} label={t('common.section.loading')} />
    </div>
  );
}
