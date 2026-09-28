import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { API_BASE_URL } from '@/shared/api';

import { server } from '../../test/msw/server';
import { createQueryHarness } from '../../test/query-wrapper';

import { yarbisRecommendationsTestIds } from './test-ids';
import { YarbisRecommendationsTrigger } from './YarbisRecommendationsTrigger';

const PATH = `${API_BASE_URL}/views/weight-recommendations/:analysisId`;

const RESPONSE = {
  scope: 'visualization',
  items: [
    {
      dimension: 'fin',
      tone: 'ok',
      text: {
        key: 'reco.weights.ok',
        params: { dimension: 'fin', ecopetrolPct: 45, peerAvgPct: 43 },
      },
    },
    {
      dimension: 'op',
      tone: 'action',
      text: {
        key: 'reco.weights.action',
        params: {
          dimension: 'op',
          ecopetrolPct: 30,
          peerAvgPct: 34,
          leaderName: 'Equinor',
          leaderPct: 38,
        },
      },
    },
  ],
  countActionable: 1,
  status: 'suggestion',
  permissions: {},
};

function serve() {
  server.use(http.get(PATH, () => HttpResponse.json(RESPONSE)));
}

function renderTrigger() {
  const { wrapper: Wrapper } = createQueryHarness();
  return render(
    <Wrapper>
      <YarbisRecommendationsTrigger analysisId="ana_1" />
    </Wrapper>,
  );
}

describe('YarbisRecommendationsTrigger', () => {
  it('shows the V-23 countActionable on the pill and opens the modal with that data on click', async () => {
    serve();
    renderTrigger();
    await waitFor(() => {
      expect(screen.getByTestId(yarbisRecommendationsTestIds.pill)).toHaveTextContent(
        'Recomendaciones de Yarbis (1)',
      );
    });
    fireEvent.click(screen.getByTestId(yarbisRecommendationsTestIds.pill));
    expect(await screen.findByTestId(yarbisRecommendationsTestIds.item('fin'))).toHaveTextContent(
      'alineado con el sector',
    );
    expect(screen.getByTestId(yarbisRecommendationsTestIds.item('op'))).toHaveTextContent(
      'Equinor',
    );
  });
});
