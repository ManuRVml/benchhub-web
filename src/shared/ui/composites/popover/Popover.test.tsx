import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { Popover, PopoverGroup } from './Popover';

beforeAll(() => {
  // Radix Popper measures the trigger with ResizeObserver, which jsdom does not implement.
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    },
  );
});

const info = (name: string) => (
  <Popover
    trigger={<button type="button">{`i ${name}`}</button>}
    label={name}
    testId={`popover-${name}`}
  >
    {`Fórmula de ${name}`}
  </Popover>
);

describe('Popover', () => {
  it('opens on click, is named by its label and closes on Esc returning focus', async () => {
    const user = userEvent.setup();
    render(info('ROACE'));
    await user.click(screen.getByRole('button', { name: 'i ROACE' }));
    expect(screen.getByRole('dialog', { name: 'ROACE' })).toHaveTextContent('Fórmula de ROACE');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'i ROACE' })).toHaveFocus();
  });

  it('keeps a single popover open inside a group', async () => {
    const user = userEvent.setup();
    render(
      <PopoverGroup>
        {info('ROACE')}
        {info('EBITDA')}
      </PopoverGroup>,
    );
    await user.click(screen.getByRole('button', { name: 'i ROACE' }));
    expect(screen.getByTestId('popover-ROACE')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'i EBITDA' }));
    expect(screen.getByTestId('popover-EBITDA')).toBeInTheDocument();
    expect(screen.queryByTestId('popover-ROACE')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'i EBITDA' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('honours the controlled open prop outside a group', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Popover
        open
        onOpenChange={onOpenChange}
        trigger={<button type="button">{'i Linea'}</button>}
        label="Linea"
      >
        {'Leyenda'}
      </Popover>,
    );
    expect(screen.getByRole('dialog', { name: 'Linea' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(screen.getByRole('dialog', { name: 'Linea' })).toBeInTheDocument();
  });
});
