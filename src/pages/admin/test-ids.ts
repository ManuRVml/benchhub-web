import { testId } from '@/shared/config/test-ids';

/** `admin-{component}-{element}` (SCR-03). The V-02 grid's states use `admin-home-section-{state}` (SectionBoundary). */
export const adminPageTestIds = {
  root: 'admin-page',
  card: (cardId: string) => testId('admin', 'card', cardId),
};
