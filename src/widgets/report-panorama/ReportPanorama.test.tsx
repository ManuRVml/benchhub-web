import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { API_BASE_URL } from '@/shared/api';

import { server } from '../../test/msw/server';
import { createQueryHarness } from '../../test/query-wrapper';

import { ReportHeatmap, ReportPanorama, ReportRadar } from './ReportPanorama';
import { reportPanoramaTestIds } from './test-ids';

import type { VisualizationHeatmapRow, VisualizationRadar } from '@/entities/analysis';

const PROFILE_PATH = `${API_BASE_URL}/views/company-profile/:companyId`;

const HEATMAP: VisualizationHeatmapRow[] = [
  { companyId: 'cmp_bp', name: 'BP', isEcopetrol: false, fin: 55, op: 15, trans: 30 },
  { companyId: 'cmp_ecopetrol', name: 'Ecopetrol', isEcopetrol: true, fin: 45, op: 30, trans: 25 },
  { companyId: 'cmp_equinor', name: 'Equinor', isEcopetrol: false, fin: 33, op: 34, trans: 33 },
];

const RADAR: VisualizationRadar = {
  axes: ['fin', 'op', 'trans'],
  ecopetrol: [45, 30, 25],
  sector: [43, 30, 28],
};

function renderPanorama() {
  const { wrapper: Wrapper } = createQueryHarness();
  return render(
    <Wrapper>
      <ReportPanorama
        heatmapSlot={<ReportHeatmap heatmap={HEATMAP} />}
        rankingSlot={<div>{'ranking-slot-content'}</div>}
        radarSlot={<ReportRadar radar={RADAR} />}
        recommendationsSlot={<div>{'recommendations-slot-content'}</div>}
      />
    </Wrapper>,
  );
}

describe('ReportPanorama', () => {
  it('renders the heatmap with one row per company, Ecopetrol first', () => {
    renderPanorama();
    const table = screen.getByTestId(`${reportPanoramaTestIds.heatmap}-data-table`);
    const rowHeaders = within(table)
      .getAllByRole('rowheader')
      .map((cell) => cell.textContent);
    expect(rowHeaders).toEqual(['Ecopetrol', 'BP', 'Equinor']);
  });

  it('renders the radar with the 3 axes and Ecopetrol vs. sector values', () => {
    renderPanorama();
    const table = screen.getByTestId(`${reportPanoramaTestIds.radar}-data-table`);
    const rowHeaders = within(table)
      .getAllByRole('rowheader')
      .map((cell) => cell.textContent);
    expect(rowHeaders).toEqual(['Financiera', 'Operativa', 'Transversal']);
    const rows = within(table).getAllByRole('row').slice(1);
    expect(rows[0]).toHaveTextContent('45');
    expect(rows[0]).toHaveTextContent('43');
  });

  it('renders the ranking slot between the heatmap and the radar', () => {
    renderPanorama();
    expect(screen.getByText('ranking-slot-content')).toBeInTheDocument();
  });

  it('renders the recommendations slot as the card action', () => {
    renderPanorama();
    expect(screen.getByText('recommendations-slot-content')).toBeInTheDocument();
  });

  it('clicking a heatmap peer name opens the company profile modal (OVL-13)', async () => {
    server.use(
      http.get(PROFILE_PATH, () =>
        HttpResponse.json({
          company: { id: 'cmp_bp', name: 'BP', colorKey: 'bp' },
          country: 'Reino Unido',
          category: null,
          business: null,
          segments: [],
          news: null,
          permissions: {},
        }),
      ),
    );
    renderPanorama();
    const table = screen.getByTestId(`${reportPanoramaTestIds.heatmap}-data-table`);
    await userEvent.click(within(table).getByRole('button', { name: 'BP' }));
    expect(await screen.findByRole('dialog')).toHaveTextContent('BP');
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toHaveTextContent('Reino Unido');
    });
  });

  it("clicking Ecopetrol's own heatmap row name never opens a profile", async () => {
    renderPanorama();
    const table = screen.getByTestId(`${reportPanoramaTestIds.heatmap}-data-table`);
    await userEvent.click(within(table).getByRole('button', { name: 'Ecopetrol' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
