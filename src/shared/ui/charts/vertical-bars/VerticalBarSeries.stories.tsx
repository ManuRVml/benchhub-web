import { t } from '@/shared/i18n';

import { VerticalBarSeries } from './VerticalBarSeries';

import type { Meta, StoryObj } from '@storybook/react-vite';

// SCR-11 "Comparación con serie histórica" (V-29): ROACE per year. V2 draws illustrative values
// (6.2 + sin(i·0.9)·1.8 + i·0.15, BencHUD.dc.html L4718–4721); "Actual" is 2024 6,2 % · 2025 7,8 %. Years are data.
const years = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, index) => {
    const year = String(from + index);
    return { id: year, label: year };
  });
const illustrative = (count: number) =>
  Array.from(
    { length: count },
    (_, index) => Math.round((6.2 + Math.sin(index * 0.9) * 1.8 + index * 0.15) * 10) / 10,
  );

const meta = {
  title: 'Charts/VerticalBarSeries',
  component: VerticalBarSeries,
  args: {
    periods: years(2021, 2025),
    series: [{ id: 'roace', label: 'ROACE', values: illustrative(5) }],
    unit: 'percent',
    ariaLabel: t('value-monitor.history.title'),
    periodLabel: t('value-monitor.history.columnYear'),
    highlightId: '2025',
  },
} satisfies Meta<typeof VerticalBarSeries>;

export default meta;
type Story = StoryObj<typeof meta>;

/** "5 años", the current year highlighted. */
export const HistoricoCincoAnos: Story = { name: 'Histórico · 5 años' };

export const HistoricoActual: Story = {
  name: 'Histórico · actual',
  args: {
    periods: years(2024, 2025),
    series: [{ id: 'roace', label: 'ROACE', values: [6.2, 7.8] }],
  },
};

/** "10 años" with one year without data: no bar, "—" in the data table. */
export const HistoricoDiezAnosConHueco: Story = {
  name: 'Histórico · 10 años con un año sin dato',
  args: {
    periods: years(2016, 2025),
    series: [
      {
        id: 'roace',
        label: 'ROACE',
        values: illustrative(10).map((value, index) => (index === 3 ? null : value)),
      },
    ],
  },
};
