import { testId } from '@/shared/config/test-ids';

/** `yarbis-recommendations-{element}[-{qualifier}]` (OVL-01, SCR-09). */
export const yarbisRecommendationsTestIds = {
  pill: 'yarbis-recommendations-pill',
  modal: 'yarbis-recommendations-modal',
  item: (dimension: string) => testId('yarbis-recommendations', 'modal', 'item', dimension),
};
