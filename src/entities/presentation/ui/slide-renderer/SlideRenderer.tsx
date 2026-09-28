import { useId } from 'react';

import { useT } from '@/shared/i18n';

import { BarsSlideView, PvcSlideView, RadarSlideView } from './kinds/bar-slides';
import { AppendixSlideView, EmptySlideView, TitleSlideView } from './kinds/cover-slides';
import {
  HallazgosSlideView,
  HomMissingSlideView,
  HomSlideView,
  SummarySlideView,
  TableSlideView,
} from './kinds/data-slides';
import { CategoriesSlideView, FindingsSlideView, RankingSlideView } from './kinds/weight-slides';
import { SlideStage } from './SlideStage';

import type { Slide, SlideDeckTemplate } from './types';
import type { ReactNode } from 'react';

export interface SlideRendererProps {
  /** One slide of V-42 (discriminated on `kind`). */
  slide: Slide;
  /** Deck template: accent (`templateId`) and the name shown on cover, footer and closing. */
  template: SlideDeckTemplate;
  /** 0-based position in the deck; with `total`, the page label when the slide has no `pageLabel`. */
  index: number;
  total: number;
  /** Fixed canvas scale (thumbnails); omit to fill the container width at 16:9. */
  scale?: number;
  /** `stage` (SCR-14) or `preview` (OVL-06) frame shadow. */
  variant?: 'stage' | 'preview';
  /** `data-testid` of the slide figure; defaults to `slide`. */
  testId?: string;
  className?: string;
}

/** Kind → view. A kind the renderer does not know (a newer contract) renders the safe fallback instead of crashing. */
function renderKind(
  slide: Slide,
  template: SlideDeckTemplate,
  titleId: string,
  pageLabel: string,
): ReactNode {
  const chrome = { template: template.templateId, templateName: template.templateName, titleId };
  switch (slide.kind) {
    case 'title':
      return (
        <TitleSlideView slide={slide} templateName={template.templateName} titleId={titleId} />
      );
    case 'appendix':
      return (
        <AppendixSlideView slide={slide} templateName={template.templateName} titleId={titleId} />
      );
    case 'empty':
      return <EmptySlideView titleId={titleId} />;
    case 'bars':
      return <BarsSlideView slide={{ ...slide, pageLabel }} {...chrome} />;
    case 'table':
      return <TableSlideView slide={{ ...slide, pageLabel }} {...chrome} />;
    case 'pvc':
      return <PvcSlideView slide={{ ...slide, pageLabel }} {...chrome} />;
    case 'hom':
      return <HomSlideView slide={{ ...slide, pageLabel }} {...chrome} />;
    case 'homMissing':
      return <HomMissingSlideView slide={{ ...slide, pageLabel }} {...chrome} />;
    case 'radar':
      return <RadarSlideView slide={{ ...slide, pageLabel }} {...chrome} />;
    case 'hallazgos':
      return <HallazgosSlideView slide={{ ...slide, pageLabel }} {...chrome} />;
    case 'summary':
      return <SummarySlideView slide={{ ...slide, pageLabel }} {...chrome} />;
    case 'ranking':
      return <RankingSlideView slide={{ ...slide, pageLabel }} {...chrome} />;
    case 'categories':
      return <CategoriesSlideView slide={{ ...slide, pageLabel }} {...chrome} />;
    case 'findings':
      return <FindingsSlideView slide={{ ...slide, pageLabel }} {...chrome} />;
    default:
      return null;
  }
}

function FallbackSlide({ titleId }: { titleId: string }) {
  const t = useT();
  return (
    <div className="flex size-full items-center justify-center bg-surface-card p-48">
      <p id={titleId} className="m-0 text-15 font-medium text-text-secondary">
        {t('common.section.empty')}
      </p>
    </div>
  );
}

/**
 * Renders one V-42 slide on the 960 × 540 canvas inside a 16:9 stage (shared by the SCR-14 viewer and the OVL-06
 * preview). The slide is a `<figure>` named by its title; the page label "{n} / {total}" comes from the BFF.
 */
export function SlideRenderer({
  slide,
  template,
  index,
  total,
  scale,
  variant = 'stage',
  testId = 'slide',
  className,
}: SlideRendererProps) {
  const titleId = useId();
  const pageLabel =
    'pageLabel' in slide ? slide.pageLabel : `${String(index + 1)} / ${String(total)}`;
  const content = renderKind(slide, template, titleId, pageLabel) ?? (
    <FallbackSlide titleId={titleId} />
  );
  return (
    <figure
      aria-labelledby={titleId}
      data-testid={testId}
      data-kind={slide.kind}
      data-template={template.templateId}
      className="m-0"
    >
      <SlideStage
        variant={variant}
        testId={`${testId}-stage`}
        {...(scale === undefined ? {} : { scale })}
        {...(className === undefined ? {} : { className })}
      >
        {content}
      </SlideStage>
    </figure>
  );
}
