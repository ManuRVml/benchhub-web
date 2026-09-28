import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ValueMonitorRanking } from './ValueMonitorRanking';

import type { ValueMonitorRankingRow } from './ValueMonitorRanking';

const ROWS: ValueMonitorRankingRow[] = [
  { rank: 1, companyId: 'ecopetrol', displayName: 'Ecopetrol', value: 7.4, isEcopetrol: true },
  {
    rank: 2,
    companyId: 'conocophillips',
    displayName: 'ConocoPhillips',
    value: 7.2,
    isEcopetrol: false,
  },
  { rank: 3, companyId: 'pttep', displayName: 'PTTEP', value: 6.7, isEcopetrol: false },
];

describe('ValueMonitorRanking', () => {
  it('renders the rows sorted, with Ecopetrol distinguished', () => {
    render(<ValueMonitorRanking rows={ROWS} />);
    const rows = screen.getAllByRole('listitem');
    expect(rows).toHaveLength(3);
    expect(rows[0]).toHaveTextContent('Ecopetrol');
    expect(rows[0]).toHaveTextContent('7,4%');
    expect(rows[0]).toHaveAttribute('data-testid', 'value-monitor-ranking-row-ecopetrol');
    expect(screen.getByTestId('value-monitor-ranking-row-ecopetrol')).toHaveTextContent(
      'Ecopetrol',
    );

    const ecopetrolBar = screen.getByRole('img', { name: 'Ecopetrol: 7,4%' });
    expect(ecopetrolBar.closest('[data-highlight]')).toHaveAttribute('data-highlight', 'ecopetrol');
  });

  it('calls onCompanyClick with the companyId when a row is clicked', () => {
    const onCompanyClick = vi.fn();
    render(<ValueMonitorRanking rows={ROWS} onCompanyClick={onCompanyClick} />);
    const row = screen.getByTestId('value-monitor-ranking-row-pttep');
    fireEvent.click(within(row).getByRole('button'));
    expect(onCompanyClick).toHaveBeenCalledWith('pttep');
  });

  it('renders plain rows (no button) when onCompanyClick is omitted', () => {
    render(<ValueMonitorRanking rows={ROWS} />);
    expect(screen.queryByRole('button', { name: /PTTEP/ })).not.toBeInTheDocument();
  });
});
