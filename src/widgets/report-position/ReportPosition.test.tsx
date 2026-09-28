import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useNavigate } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { routes } from '@/shared/config';

import { ReportKpiTiles, ReportPosition } from './ReportPosition';
import { reportPositionTestIds } from './test-ids';

import type { ReportPositionProps } from './ReportPosition';
import type { VisualizationKpiTile } from '@/entities/analysis';
import type { NavigateFunction } from 'react-router';

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return { ...actual, useNavigate: vi.fn() };
});

const KPI_TILES: readonly VisualizationKpiTile[] = [
  { dimension: 'fin', sectorAvg: 43, ecopetrol: 45, min: 33, max: 62 },
  { dimension: 'op', sectorAvg: 30, ecopetrol: 30, min: 15, max: 40 },
  { dimension: 'trans', sectorAvg: 28, ecopetrol: 25, min: 24, max: 33 },
];

let navigate: NavigateFunction & ReturnType<typeof vi.fn>;

beforeEach(() => {
  navigate = vi.fn() as NavigateFunction & ReturnType<typeof vi.fn>;
  vi.mocked(useNavigate).mockReturnValue(navigate);
});

function renderReportPosition(overrides: Partial<ReportPositionProps> = {}) {
  render(
    <ReportPosition
      analysisId="ana_1"
      position={{
        tierId: 2,
        periodLabel: { year: 2025, quarter: 4 },
        indicatorCount: 34,
        peerCount: 14,
      }}
      kpiTilesSlot={<ReportKpiTiles kpiTiles={KPI_TILES} />}
      canCreatePresentation={true}
      {...overrides}
    />,
  );
}

describe('ReportPosition', () => {
  it('renders the tier name, eyebrow period and the indicator/peer counts', () => {
    renderReportPosition();
    expect(screen.getByTestId(reportPositionTestIds.tierName)).toHaveTextContent('Estratégico');
    expect(screen.getByTestId(reportPositionTestIds.eyebrow)).toHaveTextContent(
      'Posición global · T4 2025',
    );
    expect(screen.getByTestId(reportPositionTestIds.contextLine)).toHaveTextContent(
      'promedio de 34 indicadores vs. 14 pares',
    );
  });

  it('renders the 3 KPI tiles with their sector average, Ecopetrol chip and range', () => {
    renderReportPosition();
    const fin = screen.getByTestId(reportPositionTestIds.kpiTile('fin'));
    expect(fin).toHaveTextContent('43%');
    expect(fin).toHaveTextContent('Ecopetrol 45%');
    expect(fin).toHaveTextContent('Rango 33–62%');
    expect(screen.getByTestId(reportPositionTestIds.kpiTile('op'))).toHaveTextContent('30%');
    expect(screen.getByTestId(reportPositionTestIds.kpiTile('trans'))).toHaveTextContent('28%');
  });

  it('"Crear presentación" navigates to the presentation builder with the analysisId', async () => {
    renderReportPosition({ analysisId: 'ana_42' });
    await userEvent.click(screen.getByTestId(reportPositionTestIds.createPresentation));
    expect(navigate).toHaveBeenCalledWith(
      routes.presentationNew.build({}, { analysisId: 'ana_42' }),
    );
  });
});
