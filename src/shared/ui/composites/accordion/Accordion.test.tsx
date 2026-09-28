import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Accordion } from './Accordion';

import type { AccordionItem } from './Accordion';

// SCR-08 module 4 category groups.
const ITEMS: AccordionItem[] = [
  { id: 'rentabilidad', title: 'Rentabilidad', summary: 'GE supera en 2 de 3', content: 'ROACE' },
  { id: 'liquidez', title: 'Liquidez', summary: 'GE supera en 1 de 2', content: 'Razón corriente' },
  { id: 'solvencia', title: 'Solvencia', content: 'Deuda neta / EBITDA' },
];

const trigger = (name: RegExp) => screen.getByRole('button', { name });

describe('Accordion', () => {
  it('renders each header as a heading wrapping a toggle button', () => {
    render(<Accordion items={ITEMS} headingLevel={4} />);
    expect(screen.getAllByRole('heading', { level: 4 })).toHaveLength(3);
    expect(trigger(/Rentabilidad/)).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('ROACE')).toBeNull();
  });

  it('keeps several sections open at once (type multiple)', async () => {
    const user = userEvent.setup();
    render(<Accordion items={ITEMS} />);
    await user.click(trigger(/Rentabilidad/));
    await user.click(trigger(/Liquidez/));
    expect(trigger(/Rentabilidad/)).toHaveAttribute('aria-expanded', 'true');
    expect(trigger(/Liquidez/)).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('ROACE')).toBeVisible();
    expect(screen.getByText('Razón corriente')).toBeVisible();

    await user.click(trigger(/Rentabilidad/));
    expect(trigger(/Rentabilidad/)).toHaveAttribute('aria-expanded', 'false');
    expect(trigger(/Liquidez/)).toHaveAttribute('aria-expanded', 'true');
  });

  it('opens defaultOpen ids and links each button to its region', () => {
    render(<Accordion items={ITEMS} defaultOpen={['rentabilidad', 'solvencia']} />);
    const open = trigger(/Rentabilidad/);
    expect(open).toHaveAttribute('aria-expanded', 'true');
    expect(trigger(/Solvencia/)).toHaveAttribute('aria-expanded', 'true');
    const region = document.getElementById(open.getAttribute('aria-controls') ?? '');
    expect(region).toHaveTextContent('ROACE');
  });

  it('toggles with Enter / Space and moves between headers with the arrow keys', async () => {
    const user = userEvent.setup();
    render(<Accordion items={ITEMS} />);
    await user.tab();
    expect(trigger(/Rentabilidad/)).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(trigger(/Rentabilidad/)).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard('{ArrowDown}');
    expect(trigger(/Liquidez/)).toHaveFocus();
    await user.keyboard(' ');
    expect(trigger(/Liquidez/)).toHaveAttribute('aria-expanded', 'true');
    expect(trigger(/Rentabilidad/)).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard('{End}');
    expect(trigger(/Solvencia/)).toHaveFocus();
    await user.keyboard('{Home}');
    expect(trigger(/Rentabilidad/)).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(trigger(/Solvencia/)).toHaveFocus();
  });

  it('reports the open ids when controlled', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Accordion items={ITEMS} value={['liquidez']} onValueChange={onValueChange} />);
    expect(trigger(/Liquidez/)).toHaveAttribute('aria-expanded', 'true');
    await user.click(trigger(/Solvencia/));
    expect(onValueChange).toHaveBeenLastCalledWith(['liquidez', 'solvencia']);
    expect(trigger(/Solvencia/)).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders nothing without items', () => {
    const { container } = render(<Accordion items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
