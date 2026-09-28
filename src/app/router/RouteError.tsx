import { isRouteErrorResponse, useRouteError } from 'react-router';

import { useT } from '@/shared/i18n';

// errorElement of every route: a thrown loader / render error stays inside the route that failed.
export function RouteError() {
  const t = useT();
  const error = useRouteError();
  const detail = isRouteErrorResponse(error)
    ? `${String(error.status)} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : t('not-found.routeError.unexpected');
  return (
    <section data-testid="route-error" role="alert">
      <h1>{t('not-found.routeError.title')}</h1>
      <p>{detail}</p>
    </section>
  );
}
