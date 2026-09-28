import { testId } from '@/shared/config/test-ids';

import type { TestIdPart } from '@/shared/config/test-ids';

/** `category-tiers-{element}[-{qualifier}]` (brief §5.6). */
export const categoryTiersTestIds = {
  root: 'category-tiers',
  card: (categoryId: TestIdPart) => testId('category-tiers', 'card', categoryId),
};
