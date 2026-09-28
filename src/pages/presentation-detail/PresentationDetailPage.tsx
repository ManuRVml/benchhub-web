import { useId } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { z } from 'zod';

import {
  SlideRenderer,
  slideLabel,
  usePresentationDetail,
  usePresentationSlides,
} from '@/entities/presentation';
import { PresentationComments } from '@/features/presentation-comments';
import { PresentationDownloadModal } from '@/features/presentation-download';
import { routes } from '@/shared/config';
import { useT } from '@/shared/i18n';
import { useTypedSearchParams } from '@/shared/lib/url';
import { Button } from '@/shared/ui/primitives/button';

import { SlidePager } from './SlidePager';

/** `?slide=n`, 1-based (SCR-14 Filters & controls); anything else falls back to the first slide. */
const searchSchema = z.object({ slide: z.coerce.number().int().min(1).default(1) });

/**
 * SCR-14 presentation viewer: back link, title, one slide at a time on the stage (the shared SlideRenderer with the
 * presentation's template accent), the pager and "Comentarios de otros usuarios". The current slide lives in the URL
 * (`?slide=n`, clamped to the deck) so a reload or a shared link opens the same slide. V-43 gives the frame and where
 * the slides are; V-42 gives the slides; the comment list is the presentation's V-26 thread (`PresentationComments`).
 * "Compartir" (HTML L2109) is not rendered: no share command exists in the contract.
 */
export function PresentationDetailPage() {
  const t = useT();
  const { presentationId = '' } = useParams();
  const [search, setSearch] = useTypedSearchParams(searchSchema);
  const detail = usePresentationDetail(presentationId);
  const slides = usePresentationSlides(presentationId, detail.data?.slideRef.path);
  const navigate = useNavigate();
  const panelId = useId();
  const dotPrefix = useId();

  if (detail.isError) {
    return (
      <section data-testid="presentation-detail-page" className="grid gap-12" data-state="error">
        <p className="text-body text-text-body">{t('common.section.error.title')}</p>
        <Button
          variant="outline"
          size="sm"
          className="justify-self-start"
          onClick={() => void detail.refetch()}
        >
          {t('common.section.error.retry')}
        </Button>
      </section>
    );
  }
  if (!detail.data) {
    return (
      <section data-testid="presentation-detail-page" data-state="loading" aria-busy="true">
        <p className="text-body text-text-secondary">{t('common.section.loading')}</p>
      </section>
    );
  }

  const { meta, slideRef, comments, permissions } = detail.data;
  const deck = slides.data?.slides ?? [];
  const total = slides.data ? deck.length : slideRef.slideCount;
  const index = Math.min(search.slide, Math.max(total, 1)) - 1;
  const slide = deck[index];
  // Until V-42 resolves, V-43's slideCount draws the dots (unnamed placeholders).
  const labels: readonly string[] = slides.data
    ? deck.map((item) => slideLabel(item) ?? '')
    : Array.from({ length: total }, () => '');
  const select = (next: number) => {
    setSearch({ slide: Math.min(Math.max(next, 0), total - 1) + 1 }, { replace: true });
  };

  return (
    <section data-testid="presentation-detail-page" className="grid max-w-225 gap-16">
      <Link
        to={routes.presentations.build()}
        className="justify-self-start text-13 font-medium text-brand-primary hover:underline"
      >
        {t('presentation-detail.header.backLink')}
      </Link>
      {/* Title row (HTML L2104-2111): the name left, "Editar · Descargar" right on the same line. */}
      <div
        data-testid="presentation-detail-title-row"
        className="flex flex-wrap items-center justify-between gap-16"
      >
        <h2 className="text-title-detail text-text-heading">{meta.name}</h2>
        <div className="flex flex-wrap justify-end gap-8">
          {permissions.canEdit === true ? (
            <Button
              variant="outline"
              size="sm"
              testId="presentation-detail-edit"
              onClick={() => {
                void navigate(routes.presentationEdit.build({ presentationId: meta.id }));
              }}
            >
              {t('presentation-detail.header.actions.edit')}
            </Button>
          ) : null}
          {permissions.canDownload === true ? (
            <PresentationDownloadModal
              presentationId={meta.id}
              trigger={
                <Button variant="outline" size="sm" testId="presentation-detail-download">
                  {t('presentation-detail.header.actions.download')}
                </Button>
              }
            />
          ) : null}
        </div>
      </div>

      <div
        id={panelId}
        role="tabpanel"
        {...(total > 0 ? { 'aria-labelledby': `${dotPrefix}-${String(index)}` } : {})}
        data-testid="presentation-detail-stage"
      >
        {slide ? (
          <SlideRenderer
            slide={slide}
            template={{ templateId: meta.templateId, templateName: meta.templateName }}
            index={index}
            total={total}
          />
        ) : (
          <p className="text-body text-text-secondary" aria-busy={slides.isPending}>
            {slides.isError ? t('common.section.error.title') : t('common.section.loading')}
          </p>
        )}
      </div>

      {total > 1 ? (
        <SlidePager
          labels={labels}
          current={index}
          onSelect={select}
          templateId={meta.templateId}
          panelId={panelId}
          idPrefix={dotPrefix}
        />
      ) : null}

      <PresentationComments
        presentationId={meta.id}
        canComment={permissions.canComment === true}
        count={comments.count}
        variant="detail"
        testId="presentation-detail-comments"
      />
    </section>
  );
}
