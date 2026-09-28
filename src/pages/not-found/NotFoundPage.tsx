import { useNavigate } from 'react-router';

import { routes } from '@/shared/config';
import { useT } from '@/shared/i18n';
import { EmptyState } from '@/shared/ui/composites/empty-state';

export function NotFoundPage() {
  const t = useT();
  const navigate = useNavigate();

  return (
    <section
      data-testid="not-found-page"
      className="mx-auto max-w-(--size-layout-max-width-config) py-48"
    >
      <h1 className="sr-only">{t('not-found.page.title')}</h1>
      <EmptyState
        variant="block"
        title={t('not-found.page.title')}
        description={t('not-found.page.description')}
        action={{
          label: t('not-found.page.action'),
          onClick: () => {
            void navigate(routes.home.build());
          },
        }}
      />
    </section>
  );
}
