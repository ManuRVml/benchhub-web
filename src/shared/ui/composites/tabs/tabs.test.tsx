import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { PillTabs } from './PillTabs';
import { rovingTarget, tabStopId } from './roving-focus';
import { SegmentedTabs } from './SegmentedTabs';
import { TabPanel } from './TabBar';

import type { TabBarProps, TabItem } from './TabBar';
import type { ComponentType } from 'react';

// SCR-12 indicator pills: the two not-ready indicators are disabled.
const ITEMS: TabItem[] = [
  { id: 'roace', label: 'ROACE' },
  { id: 'ebitda', label: 'Margen EBITDA', disabled: true },
  { id: 'deuda', label: 'Deuda Bruta / EBITDA' },
  { id: 'flujo', label: 'Flujo de caja' },
];

const VARIANTS: [string, ComponentType<TabBarProps>][] = [
  ['SegmentedTabs', SegmentedTabs],
  ['PillTabs', PillTabs],
];

const tab = (name: string) => screen.getByRole('tab', { name });

describe('rovingTarget', () => {
  it('moves right / left with wrap-around and skips disabled items', () => {
    expect(rovingTarget(ITEMS, 0, 'ArrowRight')).toBe(2);
    expect(rovingTarget(ITEMS, 3, 'ArrowRight')).toBe(0);
    expect(rovingTarget(ITEMS, 2, 'ArrowLeft')).toBe(0);
    expect(rovingTarget(ITEMS, 0, 'ArrowLeft')).toBe(3);
  });

  it('jumps to the first / last enabled item and ignores other keys', () => {
    const edges = [
      { id: 'a', disabled: true },
      { id: 'b' },
      { id: 'c' },
      { id: 'd', disabled: true },
    ];
    expect(rovingTarget(edges, 2, 'Home')).toBe(1);
    expect(rovingTarget(edges, 1, 'End')).toBe(2);
    expect(rovingTarget(edges, 1, 'ArrowDown')).toBeNull();
    expect(rovingTarget([{ id: 'x', disabled: true }], 0, 'ArrowRight')).toBeNull();
  });

  it('puts the tab stop on the preferred enabled item, else the first enabled one', () => {
    expect(tabStopId(ITEMS, 'deuda')).toBe('deuda');
    expect(tabStopId(ITEMS, 'ebitda')).toBe('roace');
    expect(tabStopId(ITEMS, undefined)).toBe('roace');
  });
});

describe.each(VARIANTS)('%s', (_name, Tabs) => {
  it('renders a named tablist with one tab stop on the selected tab', () => {
    render(<Tabs items={ITEMS} defaultValue="deuda" aria-label="Indicador" />);
    expect(screen.getByRole('tablist', { name: 'Indicador' })).toBeInTheDocument();
    expect(tab('Deuda Bruta / EBITDA')).toHaveAttribute('aria-selected', 'true');
    expect(tab('Deuda Bruta / EBITDA')).toHaveAttribute('tabindex', '0');
    for (const name of ['ROACE', 'Flujo de caja']) {
      expect(tab(name)).toHaveAttribute('tabindex', '-1');
      expect(tab(name)).toHaveAttribute('aria-selected', 'false');
    }
    expect(tab('Margen EBITDA')).toBeDisabled();
  });

  it('ArrowRight / ArrowLeft move and activate, skipping the disabled tab and wrapping', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Tabs items={ITEMS} onChange={onChange} aria-label="Indicador" />);

    await user.tab();
    expect(tab('ROACE')).toHaveFocus();

    await user.keyboard('{ArrowRight}');
    expect(tab('Deuda Bruta / EBITDA')).toHaveFocus();
    expect(tab('Deuda Bruta / EBITDA')).toHaveAttribute('aria-selected', 'true');
    expect(onChange).toHaveBeenLastCalledWith('deuda');

    await user.keyboard('{ArrowRight}');
    expect(tab('Flujo de caja')).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(tab('ROACE')).toHaveFocus();
    expect(onChange).toHaveBeenLastCalledWith('roace');

    await user.keyboard('{ArrowLeft}');
    expect(tab('Flujo de caja')).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(tab('Deuda Bruta / EBITDA')).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(tab('ROACE')).toHaveFocus();
    expect(onChange).not.toHaveBeenCalledWith('ebitda');
  });

  it('Home / End jump to the first / last enabled tab', async () => {
    const user = userEvent.setup();
    render(<Tabs items={ITEMS} defaultValue="deuda" aria-label="Indicador" />);
    await user.tab();
    expect(tab('Deuda Bruta / EBITDA')).toHaveFocus();

    await user.keyboard('{End}');
    expect(tab('Flujo de caja')).toHaveFocus();
    expect(tab('Flujo de caja')).toHaveAttribute('aria-selected', 'true');

    await user.keyboard('{Home}');
    expect(tab('ROACE')).toHaveFocus();
    expect(tab('ROACE')).toHaveAttribute('aria-selected', 'true');
  });

  it('manual activation moves focus only and selects on Enter / Space', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Tabs items={ITEMS} activation="manual" onChange={onChange} aria-label="Indicador" />);
    await user.tab();

    await user.keyboard('{ArrowRight}');
    expect(tab('Deuda Bruta / EBITDA')).toHaveFocus();
    expect(tab('Deuda Bruta / EBITDA')).toHaveAttribute('tabindex', '0');
    expect(tab('ROACE')).toHaveAttribute('aria-selected', 'true');
    expect(onChange).not.toHaveBeenCalled();

    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenLastCalledWith('deuda');
    expect(tab('Deuda Bruta / EBITDA')).toHaveAttribute('aria-selected', 'true');

    await user.keyboard('{ArrowRight}');
    await user.keyboard(' ');
    expect(onChange).toHaveBeenLastCalledWith('flujo');
  });

  it('selects on click and never selects a disabled tab', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Tabs items={ITEMS} onChange={onChange} aria-label="Indicador" />);
    await user.click(tab('Flujo de caja'));
    expect(onChange).toHaveBeenLastCalledWith('flujo');
    expect(tab('Flujo de caja')).toHaveAttribute('aria-selected', 'true');

    await user.click(tab('Margen EBITDA'));
    expect(onChange).not.toHaveBeenCalledWith('ebitda');
    expect(tab('Margen EBITDA')).toHaveAttribute('aria-selected', 'false');
  });

  it('follows the controlled value', async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [value, setValue] = useState('flujo');
      return (
        <>
          <Tabs items={ITEMS} value={value} onChange={setValue} aria-label="Indicador" />
          <output>{value}</output>
        </>
      );
    }
    render(<Controlled />);
    expect(tab('Flujo de caja')).toHaveAttribute('aria-selected', 'true');
    await user.click(tab('ROACE'));
    expect(screen.getByRole('status')).toHaveTextContent('roace');
    expect(tab('ROACE')).toHaveAttribute('aria-selected', 'true');
  });

  it('links tabs and panels when rendered with idPrefix', () => {
    render(
      <>
        <Tabs items={ITEMS} defaultValue="roace" idPrefix="kpi" aria-label="Indicador" />
        <TabPanel idPrefix="kpi" itemId="roace">
          {'ROACE = NOPAT / Capital empleado'}
        </TabPanel>
      </>,
    );
    const panel = screen.getByRole('tabpanel', { name: 'ROACE' });
    expect(tab('ROACE')).toHaveAttribute('aria-controls', panel.id);
  });
});

describe('SegmentedTabs variants', () => {
  it('colours the active dimension tab with AA text', () => {
    render(
      <SegmentedTabs
        variant="dimension"
        items={[
          { id: 'fin', label: 'Financiera', dimension: 'financiera' },
          { id: 'op', label: 'Operativa', dimension: 'operativa' },
        ]}
        value="op"
        aria-label="Dimensión"
      />,
    );
    expect(tab('Operativa')).toHaveClass('bg-dimension-share-operativa', 'text-text-heading');
    expect(tab('Financiera')).toHaveClass('text-text-secondary');
  });

  it('draws the company dot of the withDot variant', () => {
    render(
      <SegmentedTabs
        variant="withDot"
        items={[{ id: 'shell', label: 'Shell', dotClassName: 'bg-company-shell' }]}
        aria-label="Compañía"
      />,
    );
    expect(tab('Shell').querySelector('.bg-company-shell')).not.toBeNull();
  });

  it('buttons: separate 28px muted squares without a track, the selected one lilac (SCR-16)', () => {
    render(
      <SegmentedTabs
        variant="buttons"
        size="sm"
        items={[
          { id: 'decrease', label: 'A-', className: 'text-11' },
          { id: 'normal', label: 'A' },
        ]}
        value="normal"
        aria-label="Tamaño de fuente"
      />,
    );
    expect(screen.getByRole('tablist')).not.toHaveClass('bg-surface-page');
    expect(tab('A-')).toHaveClass(
      'size-(--size-control-square)',
      'rounded-sm',
      'bg-surface-page',
      'text-11',
    );
    expect(tab('A-')).not.toHaveClass('text-small-medium');
    expect(tab('A')).toHaveClass('bg-brand-primary-subtle', 'text-brand-primary');
  });
});
