import { useId, useState } from 'react';

import { useAiFindingsView } from '@/entities/analysis';
import { isApiError } from '@/shared/api';
import { useT } from '@/shared/i18n';
import { Eyebrow, InfoToggle, InlineInfoPanel } from '@/shared/ui/composites/section-card';
import { Skeleton } from '@/shared/ui/composites/skeleton';
import { SectionBoundary } from '@/shared/ui/layout/section-boundary';

import type { ResultsHorizon, V14Response } from '@/shared/api';
import type { SectionResult } from '@/shared/api/section-result';

/** Test-id scope of the rail (`ai-findings-rail-section-{state}`). */
export const AI_FINDINGS_RAIL_SCOPE = 'ai-findings-rail';

/** The V-14 query as one SectionResult: the whole rail fails, is forbidden or loads together (V-14 has no sections). */
function toSectionResult(
  data: V14Response | undefined,
  error: unknown,
): SectionResult<V14Response> | undefined {
  if (data !== undefined) return { status: 'ok', data };
  if (error === null || error === undefined) return undefined;
  if (isApiError(error) && error.code === 'FORBIDDEN') return { status: 'forbidden' };
  return { status: 'error', errorCode: isApiError(error) ? error.code : 'UNKNOWN' };
}

/**
 * "Hallazgos de IA" rail of SCR-08 (V-14): eyebrow + info toggle, then one card per finding (`ai.bg` / `ai.border` /
 * `ai.text`, not clickable). Loading, error (retry), forbidden and empty go through SectionBoundary; the eyebrow stays in
 * every state. The page makes the rail sticky.
 */
export function AiFindingsRail({
  analysisId,
  horizon = 'tbg',
}: {
  analysisId: string;
  /** Horizon of the page (`?horizon=` of V-14); default `tbg`. */
  horizon?: ResultsHorizon;
}) {
  const t = useT();
  const query = useAiFindingsView(analysisId, horizon);
  const [infoOpen, setInfoOpen] = useState(false);
  const eyebrowId = useId();
  const panelId = useId();
  return (
    <aside
      aria-labelledby={eyebrowId}
      data-testid="ai-findings-rail"
      className="flex flex-col gap-12"
    >
      <div className="flex items-center gap-6">
        <Eyebrow id={eyebrowId}>{t('analysis-results.findingsRail.eyebrow')}</Eyebrow>
        <InfoToggle
          expanded={infoOpen}
          controls={panelId}
          describedBy={eyebrowId}
          onToggle={() => {
            setInfoOpen((open) => !open);
          }}
          testId="ai-findings-rail-info-toggle"
        />
      </div>
      <InlineInfoPanel
        id={panelId}
        labelledBy={eyebrowId}
        open={infoOpen}
        testId="ai-findings-rail-info"
      >
        {t('analysis-results.findingsRail.info')}
      </InlineInfoPanel>
      <SectionBoundary
        scope={AI_FINDINGS_RAIL_SCOPE}
        result={toSectionResult(query.data, query.error)}
        isLoading={query.isFetching && query.data === undefined}
        isEmpty={(data) => data.findings.length === 0}
        onRetry={() => {
          void query.refetch();
        }}
        skeleton={<Skeleton shape="block" size={96} />}
      >
        {(data) => (
          <ul className="m-0 flex list-none flex-col gap-12 p-0">
            {data.findings.map((finding) => (
              <li
                key={finding.id}
                data-testid="ai-finding-card"
                className="rounded-md border border-ai-border bg-ai-bg p-14 text-12 text-ai-text"
              >
                {finding.text}
              </li>
            ))}
          </ul>
        )}
      </SectionBoundary>
    </aside>
  );
}
