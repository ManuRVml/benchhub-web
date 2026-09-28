import { useNavigate } from 'react-router';

import { routes } from '@/shared/config';
import { useT } from '@/shared/i18n';
import { EmptyState } from '@/shared/ui/composites/empty-state';

export function ForbiddenPage() {
  const t = useT();
  const navigate = useNavigate();

  return (
    <section
      data-testid="forbidden-page"
      className="mx-auto max-w-(--size-layout-max-width-config) py-48"
    >
      <h1 className="sr-only">{t('forbidden.page.title')}</h1>
      <EmptyState
        variant="block"
        title={t('forbidden.page.title')}
        description={t('forbidden.page.description')}
        action={{
          label: t('forbidden.page.action'),
          onClick: () => {
            void navigate(routes.home.build());
          },
        }}
      />
    </section>
  );
}
