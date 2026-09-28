import { useT } from '@/shared/i18n';

import coverBackground from '../assets/ppt-cover-bg.webp';

import type { AppendixSlide, TitleSlide } from '../types';

// Full-bleed kinds without chrome, footer or page number (slide-renderer.md "title", "appendix", "empty").

/**
 * Portada (HTML L2218–2228): the cover photo (`assets/ppt-cover-bg.png`, bundled as a 1600px WebP) at 90 % over
 * `dark.surface`, `gradient.slideCover` on top, text block bottom-left.
 */
export function TitleSlideView({
  slide,
  templateName,
  titleId,
}: {
  slide: TitleSlide;
  templateName: string;
  titleId: string;
}) {
  const t = useT();
  return (
    <div className="relative flex size-full flex-col justify-end overflow-hidden bg-dark-surface text-text-inverse">
      <img
        src={coverBackground}
        alt=""
        data-testid="slide-cover-background"
        className="absolute inset-0 size-full object-cover opacity-90"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-(image:--gradient-slide-cover)" />
      <div className="relative px-48 py-[40px]">
        <p className="m-0 text-12 font-semibold tracking-[.08em] opacity-85">
          {t('presentation-detail.slides.brand')}
        </p>
        <h3
          id={titleId}
          className="m-0 text-display-cover text-text-inverse [text-shadow:0_2px_12px_rgb(0_0_0/.4)]"
        >
          {templateName}
        </h3>
        <p className="m-0 text-15 opacity-90">{slide.subtitle}</p>
      </div>
    </div>
  );
}

/**
 * Cierre (HTML L2309–2316): centred column on `dark.surface`. The BencHUD logo image is not in the web repo yet; the
 * brand name stands in for it.
 */
export function AppendixSlideView({
  slide,
  templateName,
  titleId,
}: {
  slide: AppendixSlide;
  templateName: string;
  titleId: string;
}) {
  const t = useT();
  return (
    <div className="flex size-full flex-col items-center justify-center gap-12 bg-dark-surface p-[44px] text-center">
      <p className="m-0 text-17 font-bold text-text-inverse">{t('common.brand.name')}</p>
      <h3 id={titleId} className="m-0 text-[30px] font-bold text-text-inverse">
        {t('presentation-detail.slides.closing.title')}
      </h3>
      <p className="m-0 max-w-[440px] text-15 leading-[1.6] text-text-on-dark-lead">
        {t('presentation-detail.slides.closing.line', { templateName })}
      </p>
      <p className="m-0 text-13 font-medium text-chart-ecopetrol">
        {t('presentation-detail.slides.closing.contact', { email: slide.supportEmail })}
      </p>
    </div>
  );
}

/** Sin diapositivas (HTML L2123–2125): centred message, no chrome. */
export function EmptySlideView({ titleId }: { titleId: string }) {
  const t = useT();
  return (
    <div className="flex size-full items-center justify-center bg-surface-card p-48">
      <p id={titleId} className="m-0 text-15 font-medium text-text-secondary">
        {t('presentation-detail.emptyState.message')}
      </p>
    </div>
  );
}
