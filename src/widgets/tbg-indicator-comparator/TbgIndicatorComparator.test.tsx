import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { API_BASE_URL } from '@/shared/api';
import { ToastProvider } from '@/shared/ui/composites/toast';

import { server } from '../../test/msw/server';
import { createQueryHarness } from '../../test/query-wrapper';

import { TbgIndicatorComparator } from './TbgIndicatorComparator';

import type { TbgIndicatorComparatorProps } from './TbgIndicatorComparator';

const BASE_PROPS: TbgIndicatorComparatorProps = {
  indicators: [
    { id: 'roace', label: 'ROACE' },
    { id: 'margin', label: 'Margen EBITDA' },
  ],
  scopes: [{ id: 'all', label: 'Todas las compañías' }],
  selectedIndicator: 'roace',
  selectedScope: 'all',
  onIndicatorChange: vi.fn(),
  onScopeChange: vi.fn(),
  tiles: { ecopetrolValue: 12.8, tbgAvg: 19.8, gapPts: -7, rank: 7, of: 9 },
  ranking: [
    { companyId: 'shell', name: 'Shell', value: 24.5, isTbgMember: true, isEcopetrol: false },
    { companyId: 'chevron', name: 'Chevron', value: 15.1, isTbgMember: false, isEcopetrol: false },
    {
      companyId: 'ecopetrol',
      name: 'Ecopetrol',
      value: 12.8,
      isTbgMember: false,
      isEcopetrol: true,
    },
  ],
  membership: { inside: ['shell'], outside: ['ecopetrol', 'chevron'] },
  gapToLeader: -9.3,
  unit: '%',
};

function renderWidget(overrides: Partial<TbgIndicatorComparatorProps> = {}) {
  return render(<TbgIndicatorComparator {...BASE_PROPS} {...overrides} />);
}

describe('TbgIndicatorComparator', () => {
  it('renders the 4 KPI tiles with formatted values', () => {
    renderWidget();
    expect(
      screen.getByTestId('tbg-indicator-comparator-tile-ecopetrol-value-value'),
    ).toHaveTextContent('12,8%');
    expect(screen.getByTestId('tbg-indicator-comparator-tile-tbg-avg-value')).toHaveTextContent(
      '19,8%',
    );
    expect(screen.getByTestId('tbg-indicator-comparator-tile-gap-value')).toHaveTextContent(
      '-7 pts',
    );
    expect(screen.getByTestId('tbg-indicator-comparator-tile-position-value')).toHaveTextContent(
      '7 de 9',
    );
  });

  it('the "Brecha" tile is danger-toned when negative and not when non-negative', () => {
    renderWidget();
    expect(screen.getByTestId('tbg-indicator-comparator-tile-gap-value')).toHaveClass(
      'text-status-danger-text',
    );

    renderWidget({ tiles: { ...BASE_PROPS.tiles, gapPts: 3 } });
    expect(screen.getAllByTestId('tbg-indicator-comparator-tile-gap-value').at(-1)).not.toHaveClass(
      'text-status-danger-text',
    );
  });

  it('renders the ranking bars in descending order with the right tone per row', () => {
    renderWidget();
    const rows = [
      screen.getByTestId('tbg-indicator-comparator-ranking-row-shell'),
      screen.getByTestId('tbg-indicator-comparator-ranking-row-chevron'),
      screen.getByTestId('tbg-indicator-comparator-ranking-row-ecopetrol'),
    ];
    // Descending by value: Shell (24.5) > Chevron (15.1) > Ecopetrol (12.8).
    expect(rows.map((row) => row.textContent)).toEqual([
      expect.stringContaining('Shell'),
      expect.stringContaining('Chevron'),
      expect.stringContaining('Ecopetrol'),
    ]);

    // TBG member (Shell): success tone on the bar fill.
    expect(rows[0]?.querySelector('[data-bar]')).toHaveClass('bg-status-success-base');
    // Non-member (Chevron): the neutral/grey peer tone, never the member tone.
    expect(rows[1]?.querySelector('[data-bar]')).toHaveClass('bg-chart-peer');
    expect(rows[1]?.querySelector('[data-bar]')).not.toHaveClass('bg-status-success-base');
    // Ecopetrol: the distinct highlight tone, overriding both member/non-member tones, and a bold label.
    expect(rows[2]?.querySelector('[data-bar]')).toHaveClass('bg-chart-highlight');
    expect(rows[2]).toHaveClass('font-semibold');
  });

  it('lists the right company names in each membership chip group', () => {
    renderWidget();
    const inside = screen.getByRole('list', { name: 'TOP BENCHMARK GROUP' });
    const outside = screen.getByRole('list', { name: 'FUERA DEL TBG' });
    expect(inside).toHaveTextContent('Shell');
    expect(outside).toHaveTextContent('Ecopetrol');
    expect(outside).toHaveTextContent('Chevron');
    expect(inside).not.toHaveTextContent('Chevron');
  });

  it('calls onIndicatorChange / onScopeChange when a different option is selected', async () => {
    const onIndicatorChange = vi.fn();
    const onScopeChange = vi.fn();
    const user = userEvent.setup();
    renderWidget({
      onIndicatorChange,
      onScopeChange,
      scopes: [
        { id: 'all', label: 'Todas las compañías' },
        { id: 'tbg', label: 'Solo TBG' },
      ],
    });

    await user.selectOptions(
      screen.getByTestId('tbg-indicator-comparator-select-indicator'),
      'margin',
    );
    expect(onIndicatorChange).toHaveBeenCalledWith('margin');

    await user.selectOptions(screen.getByTestId('tbg-indicator-comparator-select-scope'), 'tbg');
    expect(onScopeChange).toHaveBeenCalledWith('tbg');
  });

  it('renders the "Generar narrativa ejecutiva" button as present but inert', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const user = userEvent.setup();
    renderWidget();

    const button = screen.getByTestId('tbg-indicator-comparator-narrativa-button-trigger');
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();

    await user.click(button);

    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it('with analysisId, "Generar narrativa ejecutiva" opens the narrative dialog via C-15', async () => {
    const requests: unknown[] = [];
    server.use(
      http.post(`${API_BASE_URL}/executive-narratives`, async ({ request }) => {
        requests.push(await request.json());
        return HttpResponse.json({
          sections: [
            { title: 'TBG', text: 'Ecopetrol está por debajo del promedio TBG en ROACE.' },
          ],
          status: 'suggestion',
          generatedBy: { model: 'template', version: '1' },
        });
      }),
    );
    const user = userEvent.setup();
    const { wrapper: Wrapper } = createQueryHarness();

    render(
      <Wrapper>
        <ToastProvider>
          <MemoryRouter>
            <TbgIndicatorComparator {...BASE_PROPS} analysisId="ana_1" />
          </MemoryRouter>
        </ToastProvider>
      </Wrapper>,
    );

    const button = screen.getByTestId('tbg-indicator-comparator-narrativa-button-trigger');
    expect(button).not.toBeDisabled();
    await user.click(button);

    expect(
      await screen.findByText('Ecopetrol está por debajo del promedio TBG en ROACE.'),
    ).toBeInTheDocument();
    expect(requests).toEqual([{ scope: 'results', section: 'performance', analysisId: 'ana_1' }]);
  });
});
