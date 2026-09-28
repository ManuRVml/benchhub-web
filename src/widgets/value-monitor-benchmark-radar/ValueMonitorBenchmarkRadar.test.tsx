import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { API_BASE_URL } from '@/shared/api';

import { server } from '../../test/msw/server';
import { createQueryHarness } from '../../test/query-wrapper';

import { valueMonitorBenchmarkRadarTestIds } from './test-ids';
import { ValueMonitorBenchmarkRadar } from './ValueMonitorBenchmarkRadar';

const RADAR_PATH = `${API_BASE_URL}/views/value-monitor-benchmark-radar`;
const EXPORTS_PATH = `${API_BASE_URL}/exports`;

const COMPANY_OPTIONS = [
  { id: 'cmp_ecopetrol', name: 'Ecopetrol' },
  { id: 'cmp_shell', name: 'Shell' },
  { id: 'cmp_bp', name: 'BP' },
  { id: 'cmp_equinor', name: 'Equinor' },
  { id: 'cmp_chevron', name: 'Chevron' },
  { id: 'cmp_total', name: 'TotalEnergies' },
];

const AXES = [
  { kviId: 'kvi_fcf', label: 'Flujo de Caja Libre' },
  { kviId: 'kvi_debt', label: 'Deuda Bruta / EBITDA' },
  { kviId: 'kvi_cobertura', label: 'Cobertura de Intereses' },
];

function seriesFor(companyId: string, colorKey: string, name: string) {
  return { companyId, name, year: 2025, colorKey, values: [80, 90, 70] };
}

const VIEW = {
  radar: {
    status: 'ok',
    data: {
      axes: AXES,
      series: [
        seriesFor('cmp_ecopetrol', 'ecopetrol', 'Ecopetrol'),
        seriesFor('cmp_shell', 'shell', 'Shell'),
        seriesFor('cmp_bp', 'bp', 'BP'),
        seriesFor('cmp_equinor', 'equinor', 'Equinor'),
        seriesFor('cmp_chevron', 'chevron', 'Chevron'),
        seriesFor('cmp_total', 'total-energies', 'TotalEnergies'),
      ],
    },
  },
  ranking: {
    status: 'ok',
    data: {
      strengths: [{ kviId: 'kvi_fcf', label: 'Flujo de Caja Libre', pct: 100 }],
      opportunities: [{ kviId: 'kvi_cobertura', label: 'Cobertura de Intereses', pct: 75 }],
    },
  },
  insight: {
    status: 'ok',
    data: {
      text: 'Ecopetrol muestra un desempeño sólido en Flujo de Caja Libre.',
      tone: 'ok',
      status: 'suggestion',
      generatedBy: { model: 'template', version: '1' },
    },
  },
  companyOptions: COMPANY_OPTIONS,
  yearOptions: [2025, 2024],
  permissions: {},
};

function serve() {
  server.use(http.get(RADAR_PATH, () => HttpResponse.json(VIEW)));
}

function renderWidget() {
  const { wrapper: Wrapper } = createQueryHarness();
  return render(
    <Wrapper>
      <ValueMonitorBenchmarkRadar />
    </Wrapper>,
  );
}

describe('ValueMonitorBenchmarkRadar', () => {
  it('renders one axis per KVI from V-36', async () => {
    serve();
    renderWidget();
    const table = await screen.findByTestId(
      `${valueMonitorBenchmarkRadarTestIds.radar}-data-table`,
    );
    expect(within(table).getAllByRole('rowheader')).toHaveLength(AXES.length);
  });

  it('defaults to the first 2 companies and toggling a company updates the series', async () => {
    serve();
    renderWidget();
    const radar = await screen.findByTestId(valueMonitorBenchmarkRadarTestIds.radar);
    expect(radar).toHaveAttribute('data-series-count', '2');

    fireEvent.click(screen.getByTestId(valueMonitorBenchmarkRadarTestIds.companyToggle('cmp_bp')));

    await waitFor(() => {
      expect(radar).toHaveAttribute('data-series-count', '3');
    });
  });

  it('plots and lists the series companies even when companyOptions only names other peers (V-36 example)', async () => {
    server.use(
      http.get(RADAR_PATH, () =>
        HttpResponse.json({
          ...VIEW,
          radar: {
            status: 'ok',
            data: {
              axes: AXES,
              series: [
                seriesFor('cmp_ecopetrol', 'ecopetrol', 'Ecopetrol'),
                seriesFor('cmp_shell', 'shell', 'Shell'),
              ],
            },
          },
          companyOptions: [
            { id: 'cmp_bp', name: 'BP' },
            { id: 'cmp_equinor', name: 'Equinor' },
          ],
        }),
      ),
    );
    renderWidget();
    const radar = await screen.findByTestId(valueMonitorBenchmarkRadarTestIds.radar);
    expect(radar).toHaveAttribute('data-series-count', '2');
    const table = screen.getByTestId(`${valueMonitorBenchmarkRadarTestIds.radar}-data-table`);
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((th) => th.textContent),
    ).toEqual(['Eje', 'Ecopetrol 2025', 'Shell 2025']);
    expect(within(table).getAllByRole('row')[1]).toHaveTextContent('Flujo de Caja Libre80,0%80,0%');

    const ecopetrol = screen.getByTestId(
      valueMonitorBenchmarkRadarTestIds.companyToggle('cmp_ecopetrol'),
    );
    expect(ecopetrol).toHaveAttribute('aria-pressed', 'true');
    expect(ecopetrol).toBeEnabled();
    expect(
      screen.getByTestId(valueMonitorBenchmarkRadarTestIds.companyToggle('cmp_shell')),
    ).toHaveAttribute('aria-pressed', 'true');
    // A peer without a series in this response cannot be plotted: its toggle is disabled, not a silent no-op.
    expect(
      screen.getByTestId(valueMonitorBenchmarkRadarTestIds.companyToggle('cmp_bp')),
    ).toBeDisabled();

    fireEvent.click(ecopetrol);
    await waitFor(() => {
      expect(radar).toHaveAttribute('data-series-count', '1');
    });
  });

  it('disables the 6th company toggle once 5 are selected', async () => {
    serve();
    renderWidget();
    await screen.findByTestId(valueMonitorBenchmarkRadarTestIds.radar);

    fireEvent.click(screen.getByTestId(valueMonitorBenchmarkRadarTestIds.companyToggle('cmp_bp')));
    fireEvent.click(
      screen.getByTestId(valueMonitorBenchmarkRadarTestIds.companyToggle('cmp_equinor')),
    );
    fireEvent.click(
      screen.getByTestId(valueMonitorBenchmarkRadarTestIds.companyToggle('cmp_chevron')),
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(valueMonitorBenchmarkRadarTestIds.companyToggle('cmp_total')),
      ).toBeDisabled();
    });
    expect(
      screen.getByTestId(valueMonitorBenchmarkRadarTestIds.companyToggle('cmp_ecopetrol')),
    ).not.toBeDisabled();
  });

  it('fires the export command once on "PNG", through the typed port with no analysisId', async () => {
    serve();
    let calls = 0;
    server.use(
      http.post(EXPORTS_PATH, async ({ request }) => {
        calls += 1;
        const body = (await request.json()) as { kind: string; params: Record<string, unknown> };
        expect(body).toEqual({ kind: 'radar-png', params: {} });
        return HttpResponse.json({ operationId: 'op_1', status: 'accepted' }, { status: 202 });
      }),
    );
    renderWidget();
    await screen.findByTestId(valueMonitorBenchmarkRadarTestIds.radar);

    fireEvent.click(screen.getByTestId(valueMonitorBenchmarkRadarTestIds.exportPng));

    await waitFor(() => {
      expect(calls).toBe(1);
    });
  });
});
