import { testId } from '@/shared/config/test-ids';

import type { DataState } from '@/shared/lib/data-state';

/**
 * Test ids of SectionBoundary. `scope` names the section's owner (`{page|widget}`, e.g. `home-peer-news`); the root of
 * each state is `{scope}-section-{state}`, the retry button `{scope}-section-retry`.
 */
export const sectionBoundaryTestIds = {
  root: (scope: string, state: DataState) => testId(scope, 'section', state),
  retry: (scope: string) => testId(scope, 'section', 'retry'),
};
