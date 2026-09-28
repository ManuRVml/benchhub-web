import { TIER_BORDER_CLASS, TIER_CARD_BG_CLASS, TIER_NAME_KEY } from '@/entities/analysis';
import { useT } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { SectionCard } from '@/shared/ui/composites/section-card';
import { Badge } from '@/shared/ui/primitives/badge';

import { categoryTiersTestIds } from './test-ids';

import type { VisualizationCategory, VisualizationTierId } from '@/entities/analysis';

export interface CategoryTiersProps {
  categories: readonly VisualizationCategory[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

const TIER_IDS: readonly VisualizationTierId[] = [1, 2, 3, 4];

/**
 * SCR-09 "Categorías" (V-20 `categories[]`): six tier-coloured cards; the selected one filters the indicator panel
 * ({@link CategoryTiers} owns no data — the page reads/writes `categoria` in the URL and passes the selection down).
 */
export function CategoryTiers({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryTiersProps) {
  const t = useT();

  return (
    <SectionCard
      padding="prototype"
      testId={categoryTiersTestIds.root}
      title={t('analysis-report.categories.title')}
      info={
        <span>
          {t('analysis-report.categories.info')}{' '}
          <strong>{TIER_IDS.map((tierId) => t(TIER_NAME_KEY[tierId])).join(', ')}</strong>
          {'. '}
          {t('analysis-report.categories.infoSuffix')}
        </span>
      }
    >
      <div className="grid grid-cols-2 gap-10 tablet:grid-cols-3 desktop:grid-cols-6">
        {categories.map((category) => {
          const selected = category.id === selectedCategory;
          return (
            <button
              key={category.id}
              type="button"
              aria-pressed={selected}
              data-testid={categoryTiersTestIds.card(category.id)}
              onClick={() => {
                onSelectCategory(category.id);
              }}
              className={cn(
                'grid gap-6 rounded-md border-2 p-14 text-start',
                selected
                  ? cn(TIER_CARD_BG_CLASS[category.tierId], TIER_BORDER_CLASS[category.tierId])
                  : 'border-border-default bg-surface-card',
              )}
            >
              <Badge kind="tier" tier={category.tierId}>
                {t(TIER_NAME_KEY[category.tierId])}
              </Badge>
              <span className="text-small-strong text-text-heading">{category.label}</span>
            </button>
          );
        })}
      </div>
    </SectionCard>
  );
}
