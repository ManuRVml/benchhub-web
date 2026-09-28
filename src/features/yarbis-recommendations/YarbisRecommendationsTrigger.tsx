import { useState } from 'react';

import { useRecommendationsView } from '@/entities/analysis';
import { isApiError } from '@/shared/api';
import { useT } from '@/shared/i18n';
import { Modal } from '@/shared/ui/composites/modal';
import { Skeleton } from '@/shared/ui/composites/skeleton';
import { SectionBoundary } from '@/shared/ui/layout/section-boundary';
import { AiPill } from '@/shared/ui/primitives/ai-pill';

import { yarbisRecommendationsTestIds } from './test-ids';

import type {
  RecommendationDimension,
  RecommendationItem,
  RecommendationsView,
} from '@/entities/analysis';
import type { SectionResult } from '@/shared/api/section-result';

const DIMENSION_LABEL_KEY = {
  fin: 'analysis-report.dimensionTabs.financial',
  op: 'analysis-report.dimensionTabs.operational',
  trans: 'analysis-report.dimensionTabs.transversal',
} as const satisfies Record<RecommendationDimension, string>;

function toSectionResult(
  data: RecommendationsView | undefined,
  error: unknown,
): SectionResult<RecommendationsView> | undefined {
  if (data !== undefined) return { status: 'ok', data };
  if (error === null || error === undefined) return undefined;
  if (isApiError(error) && error.code === 'FORBIDDEN') return { status: 'forbidden' };
  return { status: 'error', errorCode: isApiError(error) ? error.code : 'UNKNOWN' };
}

/**
 * Composes the OVL-01 card text (spec L1318, tone rules L4703-4705): ok is verbatim, watch/action are this
 * feature's own wording (the spec elides their exact copy) — flagged for BFF/design confirmation.
 *
 * V-23's real response gives a server-composed `text: {key, params}` instead of flat ecopetrolPct/sectorAvgPct/
 * diffPct/leaderName/leaderPct fields (P7-SWAP-VIS): every tone shares the same `params` shape
 * (`{dimension, ecopetrolPct, peerAvgPct, leaderName?, leaderPct?}`, no `diffPct`), so it's derived here instead of
 * read off the item directly.
 */
function recommendationText(t: ReturnType<typeof useT>, item: RecommendationItem) {
  const dim = t(DIMENSION_LABEL_KEY[item.dimension]);
  const { ecopetrolPct: value, peerAvgPct: avg, leaderName, leaderPct } = item.text.params;
  if (item.tone === 'ok') {
    return t('analysis-report.recommendationsModal.tones.ok', { dim, value, avg });
  }
  const diff = Math.abs(value - avg);
  if (item.tone === 'watch') {
    return t('analysis-report.recommendationsModal.tones.watch', { dim, value, avg, diff });
  }
  return t('analysis-report.recommendationsModal.tones.action', {
    dim,
    value,
    avg,
    diff,
    leaderName: leaderName ?? '',
    leaderPct: leaderPct ?? 0,
  });
}

export interface YarbisRecommendationsTriggerProps {
  analysisId: string;
  /** `data-testid` of the AiPill trigger (defaults to this feature's own id). */
  testId?: string;
}

/**
 * SCR-09 "Recomendaciones de Yarbis ({{n}})" AI pill (report-panorama's `recommendationsSlot`) and its OVL-01 modal:
 * one card per dimension from V-23 (typed VisualizationViewPort, P7-HOOKS-B), tone-coded
 * ok / watch / action. The pill's count is V-23's `countActionable`.
 */
export function YarbisRecommendationsTrigger({
  analysisId,
  testId = yarbisRecommendationsTestIds.pill,
}: YarbisRecommendationsTriggerProps) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const query = useRecommendationsView(analysisId);
  const count = query.data?.countActionable ?? 0;

  return (
    <>
      <AiPill
        testId={testId}
        onClick={() => {
          setOpen(true);
        }}
      >
        {t('analysis-report.panorama.aiPill', { recoActionCount: count })}
      </AiPill>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title={
          <>
            <span aria-hidden="true">{'✦ '}</span>
            {t('analysis-report.recommendationsModal.title')}
          </>
        }
        description={t('analysis-report.recommendationsModal.subtitle')}
        width={520}
        testId={yarbisRecommendationsTestIds.modal}
      >
        <SectionBoundary
          scope="yarbis-recommendations"
          result={toSectionResult(query.data, query.error)}
          isLoading={query.isFetching && query.data === undefined}
          onRetry={() => {
            void query.refetch();
          }}
          skeleton={<Skeleton shape="block" size={120} />}
        >
          {(data) => (
            <div className="grid gap-12">
              {data.items.map((item) => (
                <p
                  key={item.dimension}
                  data-testid={yarbisRecommendationsTestIds.item(item.dimension)}
                  className="text-small text-text-body"
                >
                  <span className="font-semibold text-text-heading">
                    {t(DIMENSION_LABEL_KEY[item.dimension])}
                    {'.'}
                  </span>{' '}
                  {recommendationText(t, item)}
                </p>
              ))}
            </div>
          )}
        </SectionBoundary>
      </Modal>
    </>
  );
}
