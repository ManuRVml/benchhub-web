import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { createDataTableColumnHelper } from './data-table-features';
import { DataTable } from './DataTable';
import { DataTableRowInfoToggle } from './DataTableRowInfoToggle';
import { dataTableTestIds } from './test-ids';

import type { DataTableSorting } from './data-table-features';
import type { DataTableProps } from './DataTable';

// SCR-11 KVI rows (name, result %, description), trimmed to three.
interface Kvi {
  id: string;
  name: string;
  result: number;
  description: string;
}

const KVIS: Kvi[] = [
  { id: 'kvi-roace', name: 'ROACE', result: 94, description: 'Retorno sobre el capital empleado' },
  { id: 'kvi-fcl', name: 'Flujo de Caja Libre', result: 149, description: 'Flujo libre del grupo' },
  { id: 'kvi-pib', name: 'Aporte al PIB', result: 101, description: 'Aporte a la economía' },
];

const col = createDataTableColumnHelper<Kvi>();
const COLUMNS = [
  col.accessor('name', {
    header: 'Indicador',
    enableSorting: true,
    meta: { rowHeader: true, width: 'minmax(0, 2fr)' },
  }),
  col.accessor('result', { header: 'Resultado', enableSorting: true, meta: { align: 'end' } }),
  col.display({ id: 'owner', header: 'Responsable', cell: () => 'GMV' }),
];

const TEST_ID = 'value-monitor-kvi-table';

function renderTable(props: Partial<DataTableProps<Kvi>> = {}) {
  return render(
    <DataTable
      columns={COLUMNS}
      data={KVIS}
      caption="KVIs"
      getRowId={(row) => row.id}
      testId={TEST_ID}
      {...props}
    />,
  );
}

const header = (name: string) => screen.getByRole('columnheader', { name });
const rowNames = () => screen.getAllByRole('rowheader').map((cell) => cell.textContent);

describe('DataTable', () => {
  it('names the table with its caption, visually hidden by default', () => {
    renderTable();
    const table = screen.getByRole('table', { name: 'KVIs' });
    const caption = table.querySelector('caption');
    expect(caption).toHaveTextContent('KVIs');
    expect(caption).toHaveClass('sr-only');
  });

  it('shows the caption when captionVisible', () => {
    renderTable({ captionVisible: true });
    expect(screen.getByRole('table').querySelector('caption')).not.toHaveClass('sr-only');
  });

  it('paints the header row on the muted surface.page band (prototype #F5F6F7, HTML L415)', () => {
    renderTable();
    const headerRow = screen.getAllByRole('rowgroup')[0];
    expect(headerRow?.tagName).toBe('THEAD');
    expect(headerRow).toHaveClass('bg-surface-page');
  });

  it('uses th scope="col" for headers and th scope="row" for the row-header column', () => {
    renderTable();
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(3);
    headers.forEach((cell) => {
      expect(cell.tagName).toBe('TH');
      expect(cell).toHaveAttribute('scope', 'col');
    });
    const rowHeaders = screen.getAllByRole('rowheader');
    expect(rowHeaders).toHaveLength(3);
    rowHeaders.forEach((cell) => {
      expect(cell.tagName).toBe('TH');
      expect(cell).toHaveAttribute('scope', 'row');
    });
    expect(screen.getAllByRole('cell')).toHaveLength(6);
  });

  it('builds the row grid template from the column meta widths', () => {
    renderTable();
    const row = screen.getByTestId(dataTableTestIds.row(TEST_ID, 'kvi-roace'));
    expect(row.style.gridTemplateColumns).toBe('minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr)');
  });

  it('cycles aria-sort none → ascending → descending → none on a sortable header', async () => {
    const user = userEvent.setup();
    renderTable();
    const name = header('Indicador');
    expect(name).toHaveAttribute('aria-sort', 'none');
    expect(rowNames()).toEqual(['ROACE', 'Flujo de Caja Libre', 'Aporte al PIB']);

    await user.click(within(name).getByRole('button', { name: 'Indicador' }));
    expect(name).toHaveAttribute('aria-sort', 'ascending');
    expect(rowNames()).toEqual(['Aporte al PIB', 'Flujo de Caja Libre', 'ROACE']);

    await user.click(within(name).getByRole('button'));
    expect(name).toHaveAttribute('aria-sort', 'descending');
    expect(rowNames()).toEqual(['ROACE', 'Flujo de Caja Libre', 'Aporte al PIB']);

    await user.click(within(name).getByRole('button'));
    expect(name).toHaveAttribute('aria-sort', 'none');
  });

  it('sorts numbers ascending first too and leaves non-sortable headers without aria-sort or button', async () => {
    const user = userEvent.setup();
    renderTable();
    await user.click(within(header('Resultado')).getByRole('button'));
    expect(header('Resultado')).toHaveAttribute('aria-sort', 'ascending');
    expect(rowNames()).toEqual(['ROACE', 'Aporte al PIB', 'Flujo de Caja Libre']);
    expect(header('Responsable')).not.toHaveAttribute('aria-sort');
    expect(within(header('Responsable')).queryByRole('button')).toBeNull();
  });

  it('keeps sorting controlled: reports the next state and renders the given one', async () => {
    const user = userEvent.setup();
    const onSortingChange = vi.fn();
    renderTable({ sorting: [{ id: 'result', desc: true }], onSortingChange });
    expect(header('Resultado')).toHaveAttribute('aria-sort', 'descending');
    expect(rowNames()).toEqual(['Flujo de Caja Libre', 'Aporte al PIB', 'ROACE']);

    await user.click(within(header('Indicador')).getByRole('button'));
    expect(onSortingChange).toHaveBeenCalledWith([{ id: 'name', desc: false }]);
    expect(header('Resultado')).toHaveAttribute('aria-sort', 'descending');
  });

  it('follows the parent state when controlled', async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [sorting, setSorting] = useState<DataTableSorting>([]);
      return (
        <DataTable
          columns={COLUMNS}
          data={KVIS}
          caption="KVIs"
          getRowId={(row) => row.id}
          sorting={sorting}
          onSortingChange={setSorting}
        />
      );
    }
    render(<Controlled />);
    await user.click(within(header('Indicador')).getByRole('button'));
    expect(header('Indicador')).toHaveAttribute('aria-sort', 'ascending');
  });

  it('applies defaultSorting when uncontrolled', () => {
    renderTable({ defaultSorting: [{ id: 'result', desc: true }] });
    expect(header('Resultado')).toHaveAttribute('aria-sort', 'descending');
  });

  describe('expandable rows', () => {
    const expandable = {
      renderExpanded: (row: Kvi) => row.description,
      getRowLabel: (row: Kvi) => row.name,
    };

    it('renders toggles with aria-expanded and aria-controls pointing at the hidden detail row', () => {
      renderTable(expandable);
      const toggle = screen.getByRole('button', { name: 'Detalle de ROACE' });
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
      const detail = document.getElementById(toggle.getAttribute('aria-controls') ?? '');
      expect(detail).toBe(screen.getByTestId(dataTableTestIds.detail(TEST_ID, 'kvi-roace')));
      expect(detail).not.toBeVisible();
      expect(screen.queryByText('Retorno sobre el capital empleado')).toBeNull();
      expect(header('Detalle')).toHaveAttribute('scope', 'col');
    });

    it('opens and closes the detail row by click', async () => {
      const user = userEvent.setup();
      renderTable(expandable);
      const toggle = screen.getByRole('button', { name: 'Detalle de ROACE' });
      await user.click(toggle);
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
      const detail = screen.getByTestId(dataTableTestIds.detail(TEST_ID, 'kvi-roace'));
      expect(detail).toBeVisible();
      expect(detail).toHaveTextContent('Retorno sobre el capital empleado');
      expect(within(detail).getByRole('cell')).toHaveClass('col-span-full');
      await user.click(toggle);
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
      expect(detail).not.toBeVisible();
    });

    it('toggles from the keyboard with Enter and Space', async () => {
      const user = userEvent.setup();
      renderTable(expandable);
      await user.tab(); // scroll region
      await user.tab(); // first sortable header
      await user.tab(); // second sortable header
      await user.tab();
      const toggle = screen.getByRole('button', { name: 'Detalle de ROACE' });
      expect(toggle).toHaveFocus();
      await user.keyboard('{Enter}');
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
      await user.keyboard(' ');
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
    });

    it('keeps one row open with singleExpand', async () => {
      const user = userEvent.setup();
      renderTable({ ...expandable, singleExpand: true });
      await user.click(screen.getByRole('button', { name: 'Detalle de ROACE' }));
      await user.click(screen.getByRole('button', { name: 'Detalle de Aporte al PIB' }));
      expect(screen.getByRole('button', { name: 'Detalle de ROACE' })).toHaveAttribute(
        'aria-expanded',
        'false',
      );
      expect(screen.getByRole('button', { name: 'Detalle de Aporte al PIB' })).toHaveAttribute(
        'aria-expanded',
        'true',
      );
    });

    it('only adds toggles to rows that can expand', () => {
      renderTable({ ...expandable, getRowCanExpand: (row) => row.id !== 'kvi-pib' });
      expect(screen.getAllByRole('button', { name: /^Detalle de/ })).toHaveLength(2);
      expect(screen.queryByTestId(dataTableTestIds.detail(TEST_ID, 'kvi-pib'))).toBeNull();
    });
  });

  describe('empty state', () => {
    it('renders the default empty row spanning every column', () => {
      renderTable({ data: [] });
      const empty = screen.getByTestId(dataTableTestIds.empty(TEST_ID));
      expect(empty).toHaveTextContent('No hay datos para mostrar.');
      expect(empty).toHaveClass('col-span-full');
      expect(screen.getAllByRole('columnheader')).toHaveLength(3);
      expect(screen.queryAllByRole('rowheader')).toHaveLength(0);
    });

    it('renders a custom empty state', () => {
      renderTable({ data: [], emptyState: 'No se encontraron análisis.' });
      expect(screen.getByTestId(dataTableTestIds.empty(TEST_ID))).toHaveTextContent(
        'No se encontraron análisis.',
      );
    });
  });

  describe('getRowId', () => {
    it('keys rows by the given id, not the index', () => {
      renderTable();
      const ids = screen
        .getAllByRole('row')
        .slice(1)
        .map((row) => row.getAttribute('data-row-id'));
      expect(ids).toEqual(['kvi-roace', 'kvi-fcl', 'kvi-pib']);
    });

    it('keeps the expanded state on the same row when the data is reordered', async () => {
      const user = userEvent.setup();
      const { rerender } = renderTable({ renderExpanded: (row) => row.description });
      await user.click(screen.getByRole('button', { name: 'Detalle de 2' }));
      expect(screen.getByTestId(dataTableTestIds.detail(TEST_ID, 'kvi-fcl'))).toBeVisible();

      rerender(
        <DataTable
          columns={COLUMNS}
          data={[...KVIS].reverse()}
          caption="KVIs"
          getRowId={(row) => row.id}
          testId={TEST_ID}
          renderExpanded={(row) => row.description}
        />,
      );
      expect(screen.getByTestId(dataTableTestIds.detail(TEST_ID, 'kvi-fcl'))).toBeVisible();
      expect(screen.getByTestId(dataTableTestIds.detail(TEST_ID, 'kvi-roace'))).not.toBeVisible();
      expect(screen.getByTestId(dataTableTestIds.row(TEST_ID, 'kvi-fcl'))).toHaveAttribute(
        'data-row-id',
        'kvi-fcl',
      );
    });
  });

  it('expandToggle="inline": no toggle column, a DataTableRowInfoToggle in a cell opens the detail row', async () => {
    const user = userEvent.setup();
    const inlineColumns = [
      col.accessor('name', {
        header: 'Indicador',
        meta: { rowHeader: true },
        cell: (info) => (
          <span>
            {info.getValue()}
            <DataTableRowInfoToggle row={info.row} label={info.getValue()} />
          </span>
        ),
      }),
      col.accessor('result', { header: 'Resultado' }),
    ];
    renderTable({
      columns: inlineColumns,
      expandToggle: 'inline',
      renderExpanded: (row) => row.description,
      getRowLabel: (row) => row.name,
      singleExpand: true,
    });

    expect(screen.getAllByRole('columnheader')).toHaveLength(2);
    const toggle = screen.getByTestId(dataTableTestIds.expand(TEST_ID, 'kvi-roace'));
    expect(within(screen.getByRole('rowheader', { name: /ROACE/ })).getByRole('button')).toBe(
      toggle,
    );
    expect(toggle).toHaveAccessibleName('Detalle de ROACE');
    const detail = screen.getByTestId(dataTableTestIds.detail(TEST_ID, 'kvi-roace'));
    expect(toggle).toHaveAttribute('aria-controls', detail.id);
    expect(detail).not.toBeVisible();
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(detail).toBeVisible();
    expect(detail).toHaveTextContent('Retorno sobre el capital empleado');
  });

  it('wraps the table in a focusable scroll region named by the caption', () => {
    renderTable();
    const region = screen.getByRole('region', { name: 'KVIs' });
    expect(region).toHaveAttribute('tabindex', '0');
    expect(region).toBe(screen.getByTestId(TEST_ID));
    expect(region).toHaveClass('overflow-auto');
    expect(region).toContainElement(screen.getByRole('table'));
  });

  it('drops the tab stop when scrollFocusable is false', () => {
    renderTable({ scrollFocusable: false });
    expect(screen.getByRole('region', { name: 'KVIs' })).not.toHaveAttribute('tabindex');
  });

  it('applies density, sticky header, min width and the highlighted row', () => {
    renderTable({
      density: 'sm',
      stickyHeader: true,
      minWidth: '1080px',
      maxHeight: '320px',
      highlightedRowId: 'kvi-fcl',
    });
    expect(screen.getByRole('table').style.width).toBe('max(100%, 1080px)');
    expect(screen.getByRole('table')).toHaveClass('min-w-min');
    expect(screen.getByRole('region')).toHaveStyle({ maxHeight: '320px' });
    expect(screen.getAllByRole('rowgroup')[0]).toHaveClass('sticky', 'top-0');
    expect(header('Responsable')).toHaveClass('px-12', 'py-8');
    expect(screen.getByTestId(dataTableTestIds.row(TEST_ID, 'kvi-fcl'))).toHaveAttribute(
      'data-highlighted',
      'true',
    );
  });
});
