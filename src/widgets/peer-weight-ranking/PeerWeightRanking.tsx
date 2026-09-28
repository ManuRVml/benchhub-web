import { useId, useState } from 'react';

import { PEER_WEIGHT_RANKING_DIMENSIONS, usePeerWeightRankingView } from '@/entities/analysis';
import { useCompanyProfile } from '@/features/company-profile';
import { isApiError } from '@/shared/api';
import { useT } from '@/shared/i18n';
import { maxAbs, RankingBarRow } from '@/shared/ui/charts/primitives';
import { Eyebrow, InfoToggle, InlineInfoPanel } from '@/shared/ui/composites/section-card';
import { Skeleton } from '@/shared/ui/composites/skeleton';
import { SectionBoundary } from '@/shared/ui/layout/section-boundary';
import { ChipGroup } from '@/shared/ui/primitives/chip';

import { peerWeightRankingTestIds } from './test-ids';

import type { PeerWeightRankingDimension, PeerWeightRankingRow } from '@/entities/analysis';
import type { SectionResult } from '@/shared/api/section-result';
import type { KeyboardEvent } from 'react';

/** Test-id scope of this widget (`peer-weight-ranking-section-{state}`, `SectionBoundary`). */
export const PEER_WEIGHT_RANKING_SCOPE = 'peer-weight-ranking';

const DIMENSION_LABEL_KEY = {
  fin: 'analysis-report.dimensionTabs.financial',
  op: 'analysis-report.dimensionTabs.operational',
  trans: 'analysis-report.dimensionTabs.transversal',
} as const satisfies Record<PeerWeightRankingDimension, string>;

export interface PeerWeightRankingProps {
  analysisId: string;
  /** Selected dimension; the page owns it as the `ranking` URL param. */
  dimension: PeerWeightRankingDimension;
  onDimensionChange: (dimension: PeerWeightRankingDimension) => void;
}

function toSectionResult(
  data: { rows: readonly PeerWeightRankingRow[] } | undefined,
  error: unknown,
): SectionResult<{ rows: readonly PeerWeightRankingRow[] }> | undefined {
  if (data !== undefined) return { status: 'ok', data };
  if (error === null || error === undefined) return undefined;
  if (isApiError(error) && error.code === 'FORBIDDEN') return { status: 'forbidden' };
  return { status: 'error', errorCode: isApiError(error) ? error.code : 'UNKNOWN' };
}

/**
 * SCR-09 "Ranking por categoría" (V-21): dimension chips write the `ranking` URL param (the page passes `dimension` +
 * `onDimensionChange`), then a ranking bar list sorted descending by weight, Ecopetrol distinguished. Clicking a row
 * toggles a one-line explanation (client-computed from name/pct/isLeader — the V-21 doc's own `explanationKey` isn't
 * modelled, see use-peer-weight-ranking-view.ts). Clicking a peer's *name* is a separate target (OVL-13, P5-OVL13):
 * it opens the company profile modal instead, and never toggles the explanation; Ecopetrol's own row has no profile.
 */
export function PeerWeightRanking({
  analysisId,
  dimension,
  onDimensionChange,
}: PeerWeightRankingProps) {
  const t = useT();
  const query = usePeerWeightRankingView(analysisId, dimension);
  const [infoOpen, setInfoOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const eyebrowId = useId();
  const panelId = useId();
  const { open: openCompanyProfile, modal: companyProfileModal } = useCompanyProfile();

  return (
    <div data-testid={peerWeightRankingTestIds.root} className="grid gap-8">
      <div className="flex items-center gap-6">
        <Eyebrow as="h4" id={eyebrowId}>
          {t('analysis-report.panorama.rankingSection')}
        </Eyebrow>
        <InfoToggle
          expanded={infoOpen}
          controls={panelId}
          describedBy={eyebrowId}
          onToggle={() => {
            setInfoOpen((open) => !open);
          }}
          testId={peerWeightRankingTestIds.infoToggle}
        />
      </div>
      <InlineInfoPanel
        id={panelId}
        labelledBy={eyebrowId}
        open={infoOpen}
        testId={peerWeightRankingTestIds.infoPanel}
      >
        {t('analysis-report.panorama.rankingSectionInfo')}
      </InlineInfoPanel>
      <ChipGroup
        mode="single"
        aria-label={t('analysis-report.panorama.rankingSection')}
        items={PEER_WEIGHT_RANKING_DIMENSIONS.map((id) => ({
          id,
          label: t(DIMENSION_LABEL_KEY[id]),
        }))}
        value={[dimension]}
        onChange={(ids) => {
          const next = ids[0];
          if (next) onDimensionChange(next as PeerWeightRankingDimension);
        }}
        testIds={{ scope: 'peer-weight-ranking', component: 'dimension' }}
      />
      <SectionBoundary
        scope={PEER_WEIGHT_RANKING_SCOPE}
        result={toSectionResult(query.data, query.error)}
        isLoading={query.isFetching && query.data === undefined}
        onRetry={() => {
          void query.refetch();
        }}
        skeleton={<Skeleton shape="block" size={160} />}
      >
        {(data) => {
          const rows = [...data.rows].sort((a, b) => b.pct - a.pct);
          const max = maxAbs(rows.map((row) => row.pct));
          return (
            <div className="grid gap-4">
              {rows.map((row, index) => {
                const expanded = expandedId === row.companyId;
                return (
                  <div key={row.companyId}>
                    {/* Ecopetrol's row has no nested control (no onLabelClick below), so it's still its own
                        keyboard-operable toggle target; a peer row already nests a real button (the name, OVL-13),
                        and role="button"/tabIndex here would nest a virtual button around a real one (axe
                        nested-interactive) — its keyboard path is the name button instead, mouse click still toggles. */}
                    {/* eslint-disable-next-line */}
                    <div
                      className="block w-full cursor-pointer text-start"
                      data-testid={peerWeightRankingTestIds.row(row.companyId)}
                      onClick={() => {
                        setExpandedId(expanded ? null : row.companyId);
                      }}
                      {...(row.isEcopetrol
                        ? {
                            role: 'button' as const,
                            tabIndex: 0,
                            onKeyDown: (event: KeyboardEvent) => {
                              if (event.key !== 'Enter' && event.key !== ' ') return;
                              event.preventDefault();
                              setExpandedId(expanded ? null : row.companyId);
                            },
                          }
                        : {})}
                    >
                      <RankingBarRow
                        rank={index + 1}
                        label={row.name}
                        value={row.pct}
                        max={max}
                        tone={row.isEcopetrol ? 'highlight' : 'peer'}
                        {...(row.isEcopetrol
                          ? { highlight: 'ecopetrol' as const }
                          : row.isLeader
                            ? { highlight: 'leader' as const }
                            : {})}
                        {...(row.isEcopetrol
                          ? {}
                          : {
                              onLabelClick: () => {
                                openCompanyProfile(row.companyId, row.name);
                              },
                            })}
                      />
                    </div>
                    {expanded ? (
                      <p
                        data-testid={peerWeightRankingTestIds.explanation(row.companyId)}
                        className="rounded-sm bg-surface-page px-8 py-6 text-small text-text-body"
                      >
                        {row.isLeader
                          ? t('analysis-report.panorama.ranking.explanationLeader', {
                              name: row.name,
                              dimension: t(DIMENSION_LABEL_KEY[dimension]),
                              pct: row.pct,
                            })
                          : t('analysis-report.panorama.ranking.explanationOther', {
                              name: row.name,
                              rank: index + 1,
                              dimension: t(DIMENSION_LABEL_KEY[dimension]),
                              pct: row.pct,
                            })}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          );
        }}
      </SectionBoundary>
      {companyProfileModal}
    </div>
  );
}
