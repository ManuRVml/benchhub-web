import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ComparisonProfilesSummary } from './ComparisonProfilesSummary';
import { comparisonProfilesTestIds } from './test-ids';

import type { ComparisonProfilesSummaryProps } from './ComparisonProfilesSummary';

// P4-22 acceptance oracle, 2-peer scenario (docs/design/screen-inventory/SCR-08-resultados.md, module 9): Perfil 1 ·
// Descarbonización, vigencia 2025, Ecopetrol score 64.8, peer average 77.2, gapPts -12.4, position "3 de 3", ranking
// 1 Shell 77.6 · 2 Equinor 76.7 · 3 Ecopetrol 64.8.
const RESULT: ComparisonProfilesSummaryProps['result'] = {
  score: 64.8,
  gapPts: -12.4,
  position: 3,
  of: 3,
  peerAvg: 77.2,
  ranking: [
    { companyId: 'cmp_shell', name: 'Shell', score: 77.6, isEcopetrol: false },
    { companyId: 'cmp_equinor', name: 'Equinor', score: 76.7, isEcopetrol: false },
    {
      companyId: 'cmp_ecopetrol',
      name: 'Ecopetrol',
      score: 64.8,
      isEcopetrol: true,
    },
  ],
  insight:
    'Ecopetrol ocupa el puesto 3 de 3 con 64.8 pts (-12.4 vs. pares). Su mayor brecha está en la dimensión ' +
    'Transversal (-20 pts): subir su peso en el perfil amplifica el rezago, bajarlo mejora la posición relativa.',
};

const SUMMARY_TABLE: ComparisonProfilesSummaryProps['summaryTable'] = [
  {
    profileId: 'prf_1',
    name: 'Perfil 1 · Descarbonización',
    subtitle: 'Descarbonización · Renovables · Shell, Equinor',
    year: 2025,
    ecopetrolScore: 64.8,
    peerAvg: 77.2,
    gapPts: -12.4,
    position: 3,
    of: 3,
    isActive: true,
  },
  {
    profileId: 'prf_2',
    name: 'Perfil 2 · Hidrocarburos',
    subtitle: 'Hidrocarburos · Upstream · Exxon, Chevron, Petrobras, Pemex',
    year: 2025,
    ecopetrolScore: 66.2,
    peerAvg: 70.5,
    gapPts: -4.3,
    position: 4,
    of: 5,
    isActive: false,
  },
  {
    profileId: 'prf_3',
    name: 'Perfil 3 · Gas',
    subtitle: 'Gas y GNL · Equinor, Shell, TotalEnergies, YPF',
    year: 2024,
    ecopetrolScore: 62.1,
    peerAvg: 70.8,
    gapPts: -8.7,
    position: 4,
    of: 5,
    isActive: false,
  },
];

function renderSummary(overrides: Partial<ComparisonProfilesSummaryProps> = {}) {
  const onSelectProfile = vi.fn();
  render(
    <ComparisonProfilesSummary
      result={RESULT}
      summaryTable={SUMMARY_TABLE}
      onSelectProfile={onSelectProfile}
      {...overrides}
    />,
  );
  return { onSelectProfile };
}

describe('ComparisonProfilesSummary', () => {
  it('renders the 3 KPI tiles with the P4-22 2-peer oracle values', () => {
    renderSummary();
    expect(screen.getByTestId(comparisonProfilesTestIds.kpiTile('score'))).toHaveTextContent(
      '64,8',
    );
    const gapTile = screen.getByTestId(comparisonProfilesTestIds.kpiTile('gap'));
    // formatDelta(-12.4, { unit: 'pts' }) -> es-CO "-12,4 pts" (comma decimal separator, ASCII hyphen-minus).
    expect(gapTile).toHaveTextContent('-12,4 pts');
    expect(screen.getByTestId(comparisonProfilesTestIds.kpiTile('position'))).toHaveTextContent(
      '3 de 3',
    );
  });

  it('shows the ranking with peers in a neutral tone and Ecopetrol distinguished', () => {
    renderSummary();
    const ecopetrolRow = screen.getByTestId(comparisonProfilesTestIds.rankingRow('cmp_ecopetrol'));
    expect(ecopetrolRow).toHaveAttribute('data-highlight', 'ecopetrol');
    const shellRow = screen.getByTestId(comparisonProfilesTestIds.rankingRow('cmp_shell'));
    expect(shellRow).not.toHaveAttribute('data-highlight');
    expect(screen.getByText('Shell')).toBeInTheDocument();
    expect(screen.getByText('Equinor')).toBeInTheDocument();
  });

  it('renders the Yarbis note with the insight text', () => {
    renderSummary();
    expect(screen.getByTestId(comparisonProfilesTestIds.yarbisNote)).toHaveTextContent(
      RESULT.insight,
    );
  });

  it('renders one summary-table row per profile with the active one visibly distinguished', () => {
    renderSummary();
    const activeRow = document.querySelector('[data-row-id="prf_1"]');
    const inactiveRow = document.querySelector('[data-row-id="prf_2"]');
    expect(activeRow).toHaveAttribute('data-highlighted', 'true');
    expect(inactiveRow).not.toHaveAttribute('data-highlighted');
    expect(screen.getByText('Perfil 2 · Hidrocarburos')).toBeInTheDocument();
    expect(screen.getByText('Perfil 3 · Gas')).toBeInTheDocument();
  });

  it('calls onSelectProfile with its id when a non-active row is clicked', async () => {
    const { onSelectProfile } = renderSummary();
    await userEvent.click(screen.getByTestId(comparisonProfilesTestIds.select('prf_2')));
    expect(onSelectProfile).toHaveBeenCalledWith('prf_2');
  });
});
