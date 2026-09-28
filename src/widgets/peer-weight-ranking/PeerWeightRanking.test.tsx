import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import { API_BASE_URL } from '@/shared/api';
import { sectionBoundaryTestIds } from '@/shared/ui/layout/section-boundary';

import { server } from '../../test/msw/server';
import { createQueryHarness } from '../../test/query-wrapper';

import { PeerWeightRanking, PEER_WEIGHT_RANKING_SCOPE } from './PeerWeightRanking';
import { peerWeightRankingTestIds } from './test-ids';

import type { PeerWeightRankingProps } from './PeerWeightRanking';

const PATH = `${API_BASE_URL}/views/peer-weight-ranking/:analysisId`;
const PROFILE_PATH = `${API_BASE_URL}/views/company-profile/:companyId`;

// Unsorted on purpose: the widget must sort descending itself, never trust the fixture's own order. `rank`,
// `initials`, `colorKey` and `explanation` are V-21's real fields (P7-SWAP-VIS); this widget doesn't render them.
const ROWS_FIN = [
  {
    rank: 2,
    companyId: 'cmp_ecopetrol',
    name: 'Ecopetrol',
    initials: 'EC',
    colorKey: 'ecopetrol',
    pct: 45,
    isLeader: false,
    isEcopetrol: true,
    explanation: {
      key: 'ranking.explain.ecopetrol',
      params: {
        rank: 2,
        dimension: 'fin',
        pct: 45,
        gapToLeaderPts: 17,
        leaderName: 'TotalEnergies',
        leaderPct: 62,
        gapToAvgPts: 2,
      },
    },
  },
  {
    rank: 1,
    companyId: 'cmp_total',
    name: 'TotalEnergies',
    initials: 'TE',
    colorKey: 'total',
    pct: 62,
    isLeader: true,
    isEcopetrol: false,
    explanation: {
      key: 'ranking.explain.leader',
      params: { name: 'TotalEnergies', dimension: 'fin', pct: 62 },
    },
  },
  {
    rank: 3,
    companyId: 'cmp_bp',
    name: 'BP',
    initials: 'BP',
    colorKey: 'bp',
    pct: 55,
    isLeader: false,
    isEcopetrol: false,
    explanation: {
      key: 'ranking.explain.peer',
      params: {
        name: 'BP',
        rank: 3,
        dimension: 'fin',
        pct: 55,
        gapToLeaderPts: 7,
        leaderName: 'TotalEnergies',
        leaderPct: 62,
      },
    },
  },
];

function serve(seen: string[] = []) {
  server.use(
    http.get(PATH, ({ request }) => {
      const dimension = new URL(request.url).searchParams.get('dimension') ?? '';
      seen.push(dimension);
      return HttpResponse.json({ dimension: dimension || 'fin', rows: ROWS_FIN, permissions: {} });
    }),
  );
  return seen;
}

function renderRanking(overrides: Partial<PeerWeightRankingProps> = {}) {
  const { wrapper: Wrapper } = createQueryHarness();
  const onDimensionChange = vi.fn();
  const utils = render(
    <Wrapper>
      <PeerWeightRanking
        analysisId="ana_1"
        dimension="fin"
        onDimensionChange={onDimensionChange}
        {...overrides}
      />
    </Wrapper>,
  );
  return { ...utils, onDimensionChange, Wrapper };
}

describe('PeerWeightRanking', () => {
  it('sorts the ranking rows descending by weight, regardless of the fixture order', async () => {
    serve();
    renderRanking();
    const rows = await screen.findAllByTestId(/^peer-weight-ranking-row-/);
    expect(rows.map((row) => row.textContent.includes('TotalEnergies'))).toEqual([
      true,
      false,
      false,
    ]);
  });

  it('calls onDimensionChange when a different dimension chip is clicked', async () => {
    serve();
    const { onDimensionChange } = renderRanking();
    await screen.findAllByTestId(/^peer-weight-ranking-row-/);
    fireEvent.click(screen.getByRole('button', { name: 'Operativa' }));
    expect(onDimensionChange).toHaveBeenCalledWith('op');
  });

  it('requests V-21 with the given dimension, and refetches when the prop changes', async () => {
    const seen = serve();
    const { rerender, Wrapper } = renderRanking();
    await screen.findAllByTestId(/^peer-weight-ranking-row-/);
    expect(seen).toEqual(['fin']);
    rerender(
      <Wrapper>
        <PeerWeightRanking analysisId="ana_1" dimension="op" onDimensionChange={vi.fn()} />
      </Wrapper>,
    );
    await waitFor(() => {
      expect(seen).toEqual(expect.arrayContaining(['fin', 'op']));
    });
  });

  it('toggles a one-line explanation when a row is clicked', async () => {
    serve();
    renderRanking();
    const row = await screen.findByTestId(peerWeightRankingTestIds.row('cmp_total'));
    expect(screen.queryByTestId(peerWeightRankingTestIds.explanation('cmp_total'))).toBeNull();
    fireEvent.click(row);
    expect(screen.getByTestId(peerWeightRankingTestIds.explanation('cmp_total'))).toHaveTextContent(
      'TotalEnergies lidera en Financiera con 62%',
    );
    fireEvent.click(row);
    expect(screen.queryByTestId(peerWeightRankingTestIds.explanation('cmp_total'))).toBeNull();
  });

  it("clicking a peer's name opens the profile of that company (the clicked companyId), without toggling the explanation", async () => {
    serve();
    const requestedIds: string[] = [];
    server.use(
      http.get(PROFILE_PATH, ({ params }) => {
        requestedIds.push(String(params.companyId));
        return HttpResponse.json({
          company: {
            id: String(params.companyId),
            name: 'TotalEnergies',
            colorKey: 'totalenergies',
          },
          country: 'Francia',
          category: null,
          business: null,
          segments: [],
          news: null,
        });
      }),
    );
    renderRanking();
    const name = await screen.findByRole('button', { name: 'TotalEnergies' });
    await userEvent.click(name);
    expect(await screen.findByRole('dialog')).toHaveTextContent('TotalEnergies');
    await waitFor(() => {
      expect(requestedIds).toEqual(['cmp_total']);
    });
    expect(screen.queryByTestId(peerWeightRankingTestIds.explanation('cmp_total'))).toBeNull();
  });

  it("clicking Ecopetrol's own row never opens a profile (no name button)", async () => {
    serve();
    renderRanking();
    await screen.findAllByTestId(/^peer-weight-ranking-row-/);
    expect(screen.queryByRole('button', { name: 'Ecopetrol' })).toBeNull();
  });

  it('closing the profile modal returns focus to the name that opened it', async () => {
    serve();
    server.use(
      http.get(PROFILE_PATH, () =>
        HttpResponse.json({
          company: { id: 'cmp_total', name: 'TotalEnergies', colorKey: 'totalenergies' },
          country: null,
          category: null,
          business: null,
          segments: [],
          news: null,
        }),
      ),
    );
    renderRanking();
    const name = await screen.findByRole('button', { name: 'TotalEnergies' });
    await userEvent.click(name);
    const dialog = await screen.findByRole('dialog');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(dialog).not.toBeInTheDocument();
    });
    expect(name).toHaveFocus();
  });

  it('shows a retry button on a V-21 error, without touching the rest of the page', async () => {
    server.use(
      http.get(PATH, () =>
        HttpResponse.json(
          { code: 'INTERNAL_ERROR', message: 'boom', traceId: 't1' },
          { status: 500 },
        ),
      ),
    );
    renderRanking();
    const retry = await screen.findByTestId(
      sectionBoundaryTestIds.retry(PEER_WEIGHT_RANKING_SCOPE),
    );
    expect(retry).toBeInTheDocument();
    const seen = serve();
    fireEvent.click(retry);
    await waitFor(() => {
      expect(seen).toEqual(['fin']);
    });
  });
});
