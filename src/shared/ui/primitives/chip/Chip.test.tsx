// Testing Library and jsdom arrive with P2-W04a (not merged yet): markup is rendered with react-dom/server, and
// clicks are exercised on the element tree of the hook-free components. Switch to @testing-library/react + user-event
// once P2-W04a is on main.
import { isValidElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { Chip } from './Chip';
import { ChipGroup, FilterChipGroup, nextChipSelection } from './ChipGroup';
import { chipTestIds } from './test-ids';

import type { ChipProps } from './Chip';
import type { ChipGroupProps } from './ChipGroup';
import type { MouseEvent, ReactElement, ReactNode } from 'react';

const LABEL = 'label';

function markup(props: Omit<ChipProps, 'children'>): string {
  return renderToStaticMarkup(<Chip {...props}>{LABEL}</Chip>);
}

function rootClasses(html: string): string[] {
  return (/class="([^"]*)"/.exec(html)?.[1] ?? '').split(' ');
}

/** Depth-first list of the elements of a tree that match `predicate`. */
function collect(
  node: ReactNode,
  predicate: (el: ReactElement<Record<string, unknown>>) => boolean,
): ReactElement<Record<string, unknown>>[] {
  if (Array.isArray(node))
    return (node as ReactNode[]).flatMap((child) => collect(child, predicate));
  if (!isValidElement<Record<string, unknown>>(node)) return [];
  const self = predicate(node) ? [node] : [];
  return [...self, ...collect(node.props.children as ReactNode, predicate)];
}

const click = {} as MouseEvent<HTMLButtonElement>;

describe('Chip variants', () => {
  it.each<[string, Omit<ChipProps, 'children'>, string, string[]]>([
    ['static', { variant: 'static' }, 'span', ['bg-surface-page', 'text-text-secondary']],
    ['indicator', { variant: 'indicator', code: 'PAR-01' }, 'span', ['bg-surface-page']],
    ['filter', { variant: 'filter' }, 'span', ['bg-brand-primary-subtle', 'text-brand-primary']],
    [
      'suggestion',
      { variant: 'suggestion' },
      'button',
      ['bg-brand-primary-subtle', 'border-brand-primary-border'],
    ],
    ['dashed', { variant: 'dashed' }, 'button', ['border-dashed', 'text-brand-primary']],
    ['choice off', { variant: 'choice' }, 'button', ['bg-surface-page', 'border-border-default']],
    [
      'choice on',
      { variant: 'choice', selected: true },
      'button',
      ['bg-brand-primary', 'text-text-inverse'],
    ],
    [
      'toggle on',
      { variant: 'toggle', selected: true },
      'button',
      ['bg-brand-primary', 'text-text-inverse'],
    ],
    ['soft off', { variant: 'soft' }, 'button', ['bg-surface-page', 'text-text-secondary']],
    [
      'soft on',
      { variant: 'soft', selected: true },
      'button',
      ['bg-brand-primary-subtle', 'text-brand-primary', 'border-transparent'],
    ],
    ['estimate off', { variant: 'estimate' }, 'button', ['bg-surface-page']],
    [
      'estimate on',
      { variant: 'estimate', selected: true },
      'button',
      ['bg-status-warning-bg', 'text-status-warning-text'],
    ],
  ])('%s renders its element and token classes', (_name, props, element, classes) => {
    const html = markup(props);
    expect(html.startsWith(`<${element}`)).toBe(true);
    expect(rootClasses(html)).toEqual(expect.arrayContaining(classes));
    expect(html).toContain(`data-variant="${props.variant ?? 'static'}"`);
    expect(html).toContain(LABEL);
  });

  it('segment is an on/off toggle: brand fill on, muted off, rounded 8px, no check mark (SCR-15)', () => {
    const off = markup({ variant: 'segment', size: 'toggle' });
    expect(off).toContain('aria-pressed="false"');
    expect(rootClasses(off)).toEqual(
      expect.arrayContaining([
        'bg-surface-page',
        'text-text-secondary',
        'rounded-control',
        'px-11',
        'py-5',
      ]),
    );
    expect(rootClasses(off)).not.toContain('rounded-pill');
    const on = markup({ variant: 'segment', size: 'toggle', selected: true });
    expect(rootClasses(on)).toEqual(
      expect.arrayContaining(['bg-brand-primary', 'text-text-inverse']),
    );
    expect(on).not.toContain('✓');
  });

  it('option is the wizard choice: 8px radius, lilac outline when selected, no check mark (SCR-07)', () => {
    const off = markup({ variant: 'option', size: 'option' });
    expect(off).toContain('aria-pressed="false"');
    expect(rootClasses(off)).toEqual(
      expect.arrayContaining([
        'rounded-control',
        'border-border-default',
        'bg-surface-page',
        'text-text-secondary',
        'px-14',
        'py-9',
      ]),
    );
    expect(rootClasses(off)).not.toContain('rounded-pill');
    const on = markup({ variant: 'option', size: 'option', selected: true });
    expect(rootClasses(on)).toEqual(
      expect.arrayContaining([
        'border-brand-primary-border',
        'bg-brand-primary-subtle',
        'text-brand-primary',
      ]),
    );
    expect(rootClasses(on)).not.toContain('bg-brand-primary');
    expect(on).not.toContain('✓');
  });

  it('applies the size classes', () => {
    expect(rootClasses(markup({ size: 'sm' }))).toEqual(
      expect.arrayContaining(['px-8', 'text-micro']),
    );
    expect(rootClasses(markup({}))).toEqual(expect.arrayContaining(['px-12', 'text-small-medium']));
  });

  it('shows the indicator code in mono', () => {
    expect(markup({ variant: 'indicator', code: 'PAR-01' })).toContain(
      '<span class="font-mono text-text-secondary">PAR-01</span>',
    );
  });

  it('sets aria-pressed and data-selected only on pressable chips', () => {
    expect(markup({ variant: 'toggle', selected: true })).toContain('aria-pressed="true"');
    expect(markup({ variant: 'choice' })).toContain('aria-pressed="false"');
    expect(markup({ variant: 'estimate', selected: true })).toContain('data-selected="true"');
    expect(markup({ variant: 'suggestion' })).not.toContain('aria-pressed');
    expect(markup({ variant: 'static' })).not.toContain('aria-pressed');
  });

  it('renders native disabled buttons and a configurable data-testid', () => {
    const html = markup({
      variant: 'choice',
      disabled: true,
      'data-testid': chipTestIds.root('analyses', 'filter', 'draft'),
    } as Omit<ChipProps, 'children'>);
    expect(html).toContain('disabled=""');
    expect(html).toContain('type="button"');
    expect(html).toContain('data-testid="analyses-filter-chip-draft"');
  });

  it('renders the filter remove button with the caller label and test id', () => {
    const html = markup({
      variant: 'filter',
      onRemove: vi.fn(),
      removeLabel: 'Quitar',
      removeTestId: chipTestIds.remove('analyses', 'filter', 'draft'),
    });
    expect(html).toContain('aria-label="Quitar"');
    expect(html).toContain('data-testid="analyses-filter-chip-remove-draft"');
  });
});

describe('Chip interaction', () => {
  it('toggle chip fires onPressedChange with the next state and forwards onClick', () => {
    const onPressedChange = vi.fn();
    const onClick = vi.fn();
    const off = Chip({
      variant: 'toggle',
      selected: false,
      onPressedChange,
      onClick,
      children: LABEL,
    });
    (off.props as { onClick: (e: MouseEvent<HTMLButtonElement>) => void }).onClick(click);
    expect(onPressedChange).toHaveBeenLastCalledWith(true);
    expect(onClick).toHaveBeenCalledTimes(1);

    const on = Chip({ variant: 'toggle', selected: true, onPressedChange, children: LABEL });
    (on.props as { onClick: (e: MouseEvent<HTMLButtonElement>) => void }).onClick(click);
    expect(onPressedChange).toHaveBeenLastCalledWith(false);
  });

  it('non-pressable chips never call onPressedChange', () => {
    const onPressedChange = vi.fn();
    const chip = Chip({ variant: 'suggestion', onPressedChange, children: LABEL });
    (chip.props as { onClick: (e: MouseEvent<HTMLButtonElement>) => void }).onClick(click);
    expect(onPressedChange).not.toHaveBeenCalled();
  });

  it('filter chip remove button calls onRemove', () => {
    const onRemove = vi.fn();
    const chip = Chip({ variant: 'filter', onRemove, removeLabel: 'Quitar', children: LABEL });
    const [remove] = collect(chip, (el) => el.type === 'button');
    (remove?.props.onClick as () => void)();
    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});

describe('FilterChipGroup', () => {
  const items = [
    { id: 'info', label: 'Info' },
    { id: 'warn', label: 'Atención' },
    { id: 'error', label: 'Crítico', disabled: true },
  ];

  it('computes single-select changes (none selected = all)', () => {
    expect(nextChipSelection([], 'info', 'single')).toEqual(['info']);
    expect(nextChipSelection(['info'], 'warn', 'single')).toEqual(['warn']);
    expect(nextChipSelection(['info'], 'info', 'single')).toEqual([]);
  });

  it('computes multi-select changes', () => {
    expect(nextChipSelection([], 'info', 'multi')).toEqual(['info']);
    expect(nextChipSelection(['info'], 'warn', 'multi')).toEqual(['info', 'warn']);
    expect(nextChipSelection(['info', 'warn'], 'info', 'multi')).toEqual(['warn']);
  });

  function group(props: Partial<ChipGroupProps>) {
    return ChipGroup({
      items,
      mode: 'multi',
      value: ['info'],
      onChange: vi.fn(),
      'aria-label': 'Severidad',
      ...props,
    });
  }

  it('renders a labelled group of pressable chips with test ids', () => {
    const html = renderToStaticMarkup(
      <FilterChipGroup
        items={items}
        mode="multi"
        value={['info']}
        onChange={vi.fn()}
        aria-label="Severidad"
        testIds={{ scope: 'notifications', component: 'severity' }}
      />,
    );
    expect(html).toContain('role="group"');
    expect(html).toContain('aria-label="Severidad"');
    const tag = (id: string) =>
      new RegExp(`<button[^>]*data-testid="notifications-severity-chip-${id}"[^>]*>`).exec(
        html,
      )?.[0] ?? '';
    expect(tag('info')).toContain('data-variant="toggle"');
    expect(tag('info')).toContain('aria-pressed="true"');
    expect(tag('warn')).toContain('aria-pressed="false"');
    expect(tag('error')).toContain('disabled=""');
  });

  it('multi mode: clicking a chip adds or removes it', () => {
    const onChange = vi.fn();
    const chips = collect(group({ onChange }), (el) => el.type === Chip);
    (chips[1]?.props.onPressedChange as () => void)();
    expect(onChange).toHaveBeenLastCalledWith(['info', 'warn']);
    (chips[0]?.props.onPressedChange as () => void)();
    expect(onChange).toHaveBeenLastCalledWith([]);
    expect(chips.map((c) => c.props.variant)).toEqual(['toggle', 'toggle', 'toggle']);
  });

  it('option appearance uses option chips in both modes, keeping the selection rules of each mode', () => {
    const onChange = vi.fn();
    const multi = collect(group({ appearance: 'option', onChange }), (el) => el.type === Chip);
    expect(multi.map((c) => c.props.variant)).toEqual(['option', 'option', 'option']);
    (multi[1]?.props.onPressedChange as () => void)();
    expect(onChange).toHaveBeenLastCalledWith(['info', 'warn']);
    const single = collect(
      group({ appearance: 'option', mode: 'single', onChange }),
      (el) => el.type === Chip,
    );
    expect(single.map((c) => c.props.variant)).toEqual(['option', 'option', 'option']);
    (single[1]?.props.onPressedChange as () => void)();
    expect(onChange).toHaveBeenLastCalledWith(['warn']);
  });

  it('single mode: choice chips replace the selection', () => {
    const onChange = vi.fn();
    const chips = collect(group({ mode: 'single', onChange }), (el) => el.type === Chip);
    expect(chips.map((c) => c.props.variant)).toEqual(['choice', 'choice', 'choice']);
    expect(chips.map((c) => c.props.selected)).toEqual([true, false, false]);
    (chips[1]?.props.onPressedChange as () => void)();
    expect(onChange).toHaveBeenLastCalledWith(['warn']);
  });
});
