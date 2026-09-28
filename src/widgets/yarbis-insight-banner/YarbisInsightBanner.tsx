import { useT } from '@/shared/i18n';

import type { ReactElement } from 'react';

export interface YarbisInsightBannerProps {
  text: string;
}

/** SCR-05 Yarbis banner (prototype L249-L252): dark surface, radius 12, 14/18 padding, cyan star, banner text. */
export function YarbisInsightBanner({ text }: YarbisInsightBannerProps): ReactElement {
  const t = useT();

  return (
    <section
      data-testid="yarbis-insight-banner"
      className="flex items-start gap-12 rounded-card bg-dark-surface px-18 py-14"
    >
      <span aria-hidden="true" className="text-16 text-ai-accent">
        ✦
      </span>
      <p className="text-13 text-text-on-dark-banner">
        <strong className="text-text-inverse">{t('home.yarbisInsightBanner.prefix')} </strong>
        {text}
      </p>
    </section>
  );
}
