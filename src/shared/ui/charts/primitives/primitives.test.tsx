import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  BAR_HEADROOM,
  barWidthPct,
  coverageTone,
  defaultFormat,
  maxAbs,
  ratioPct,
} from './bar-math';
import { PairedBarRow, parseBarInput } from './PairedBarRow';
import { ProgressBar } from './ProgressBar';
import { RankingBarRow } from './RankingBarRow';
import { StackedShareBar } from './StackedShareBar';
import { WinMiniBar } from './WinMiniBar';

import type { StackedShareSegment } from './StackedShareBar';

const widthOf = (el: Element | null) => (el as HTMLElement | null)?.style.width;
const barIn = (el: HTMLElement) => el.querySelector('[data-bar]');
const fillOf = (el: HTMLElement) => el.querySelector('[data-fill]');

function mockReducedMotion(matches: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('bar math', () => {
  it('width = |v| / (max × 1.15)', () => {
    expect(BAR_HEADROOM).toBe(1.15);
    expect(barWidthPct(10, 10)).toBeCloseTo((10 / 11.5) * 100, 6);
    expect(barWidthPct(5, 10)).toBeCloseTo((5 / 11.5) * 100, 6);
    expect(barWidthPct(0, 10)).toBe(0);
  });

  it('draws negatives with their absolute length (OQ-10)', () => {
    expect(barWidthPct(-13.8, 13.8)).toBeCloseTo(barWidthPct(13.8, 13.8) ?? Number.NaN, 6);
    expect(maxAbs([7.4, -13.8, null, 5.5])).toBe(13.8);
  });

  it('returns null for missing values, never 0', () => {
    expect(barWidthPct(null, 10)).toBeNull();
    expect(barWidthPct(undefined, 10)).toBeNull();
    expect(barWidthPct(Number.NaN, 10)).toBeNull();
    expect(barWidthPct(3, 0)).toBe(0);
  });

  it('ratio bars fill value / max without headroom', () => {
    expect(ratioPct(100, 100)).toBe(100);
    expect(ratioPct(6, 10)).toBe(60);
    expect(ratioPct(120, 100)).toBe(100);
    expect(ratioPct(null, 100)).toBeNull();
  });

  it('keeps the sign in the value label (OQ-10) and renders missing as an em dash', () => {
    expect(defaultFormat(-13.8)).toBe('-13,8');
    expect(defaultFormat(7.4)).toBe('7,4');
    expect(defaultFormat(null)).toBe('—');
  });

  it('maps coverage thresholds 90 / 70', () => {
    expect(coverageTone(96)).toBe('success');
    expect(coverageTone(88)).toBe('warning');
    expect(coverageTone(52)).toBe('danger');
  });
});

describe('PairedBarRow', () => {
  it('renders both bars with the width rule, signed labels and accessible values', () => {
    render(
      <PairedBarRow
        label="Rentabilidad sobre activos"
        primary={{ label: 'GE', value: -13.8 }}
        secondary={{ label: 'Pares', value: -2.2 }}
        max={13.8}
      />,
    );
    const group = screen.getByRole('group', { name: 'Rentabilidad sobre activos' });
    const ge = within(group).getByRole('img', { name: 'GE: -13,8' });
    const peers = within(group).getByRole('img', { name: 'Pares: -2,2' });
    expect(widthOf(barIn(ge))).toBe(`${String(barWidthPct(-13.8, 13.8))}%`);
    expect(widthOf(barIn(peers))).toBe(`${String(barWidthPct(-2.2, 13.8))}%`);
    expect(barIn(ge)).toHaveClass('bg-chart-highlight');
    expect(barIn(peers)).toHaveClass('bg-chart-peer');
    expect(group).toHaveTextContent('-13,8');
  });

  it('renders a null value as an empty track and an em dash', () => {
    render(
      <PairedBarRow
        label="ROACE"
        primary={{ label: 'GE', value: null }}
        secondary={{ label: 'Pares', value: 5.5 }}
        max={7.4}
      />,
    );
    const empty = screen.getByRole('img', { name: 'GE: Sin dato' });
    expect(barIn(empty)).toBeNull();
    expect(empty).toHaveAttribute('data-state', 'empty');
    expect(screen.getByRole('group')).toHaveTextContent('—');
  });

  it('emits the parsed number when an editable value changes', () => {
    const onValueChange = vi.fn();
    render(
      <PairedBarRow
        label="ROACE"
        primary={{ label: 'GE', value: 7.4 }}
        secondary={{ label: 'Pares', value: 5.5 }}
        max={7.4}
        editable="primary"
        onValueChange={onValueChange}
      />,
    );
    const input = screen.getByRole('spinbutton', { name: 'Editar ROACE · GE' });
    fireEvent.change(input, { target: { value: '8.25' } });
    expect(onValueChange).toHaveBeenLastCalledWith('primary', 8.25);
    fireEvent.change(input, { target: { value: '' } });
    expect(onValueChange).toHaveBeenLastCalledWith('primary', null);
    expect(screen.queryByRole('spinbutton', { name: 'Editar ROACE · Pares' })).toBeNull();
  });

  it('parses inputs to numbers or null', () => {
    expect(parseBarInput('-2.5')).toBe(-2.5);
    expect(parseBarInput(' ')).toBeNull();
    expect(parseBarInput('abc')).toBeNull();
  });
});

describe('reduced motion', () => {
  it('keeps the width transition by default', () => {
    mockReducedMotion(false);
    render(<ProgressBar value={96} aria-label="Cobertura Chevron" />);
    expect(barIn(screen.getByRole('progressbar'))).toHaveClass('transition-[width]');
  });

  it('removes the width transition classes with prefers-reduced-motion', () => {
    mockReducedMotion(true);
    render(<RankingBarRow label="Ecopetrol" value={10.2} max={10.2} highlight="ecopetrol" />);
    const bar = barIn(screen.getByRole('img', { name: 'Ecopetrol: 10,2' }));
    expect(bar).not.toHaveClass('transition-[width]');
    expect(bar?.className).not.toMatch(/duration-/);
  });
});

describe('ProgressBar', () => {
  it('fills value / max and exposes the value', () => {
    render(<ProgressBar value={88} tone="warning" aria-label="Cobertura Shell" valueText="88 %" />);
    const bar = screen.getByRole('progressbar', { name: 'Cobertura Shell' });
    expect(bar).toHaveAttribute('aria-valuenow', '88');
    expect(bar).toHaveAttribute('aria-valuetext', '88 %');
    expect(widthOf(barIn(bar))).toBe('88%');
    expect(barIn(bar)).toHaveClass('bg-status-warning-base');
  });

  it('renders null as an empty track', () => {
    render(<ProgressBar value={null} aria-label="Cobertura ISA" />);
    const bar = screen.getByRole('progressbar', { name: 'Cobertura ISA' });
    expect(barIn(bar)).toBeNull();
    expect(bar).not.toHaveAttribute('aria-valuenow');
    expect(bar).toHaveAttribute('aria-valuetext', 'Sin dato');
    expect(bar).toHaveAttribute('data-state', 'empty');
  });
});

describe('RankingBarRow', () => {
  it('highlights the Ecopetrol row and uses the width rule', () => {
    const { container } = render(
      <RankingBarRow rank={1} label="Ecopetrol" value={10.2} max={10.2} highlight="ecopetrol" />,
    );
    const row = container.firstElementChild;
    expect(row).toHaveAttribute('data-highlight', 'ecopetrol');
    expect(row).toHaveClass('bg-chart-eco-chip-row-bg');
    const bar = barIn(screen.getByRole('img', { name: 'Ecopetrol: 10,2' }));
    expect(bar).toHaveClass('bg-chart-highlight');
    expect(widthOf(bar)).toBe(`${String(barWidthPct(10.2, 10.2))}%`);
  });

  it('marks the leader row and falls back to the monitor tone', () => {
    const { container } = render(
      <RankingBarRow rank={1} label="Shell" value={9} max={10} highlight="leader" />,
    );
    expect(container.firstElementChild).toHaveClass('bg-chart-leader-row-bg');
    expect(barIn(screen.getByRole('img', { name: 'Shell: 9,0' }))).toHaveClass('bg-chart-monitor');
  });
});

describe('WinMiniBar', () => {
  it('fills wins / total and names the ratio', () => {
    render(<WinMiniBar wins={6} total={10} aria-label="GE vs. Chevron" />);
    const bar = screen.getByRole('img', { name: 'GE vs. Chevron: 6 de 10' });
    expect(widthOf(barIn(bar))).toBe('60%');
  });
});

describe('StackedShareBar', () => {
  const segments: StackedShareSegment[] = [
    { id: 'fin', label: 'Financiera', value: 45, tone: 'financiera' },
    { id: 'op', label: 'Operativa', value: 30, tone: 'operativa' },
    { id: 'trans', label: 'Transversal', value: 25, tone: 'transversal' },
  ];

  const renderBar = () =>
    render(<StackedShareBar segments={segments} aria-label="Peso por dimensión · Ecopetrol" />);

  it('sizes segments by share and exposes each value', () => {
    renderBar();
    const fin = screen.getByRole('button', { name: 'Financiera: 45%' });
    expect(fin.style.width).toBe('45%');
    expect(fillOf(fin)).toHaveClass('bg-dimension-share-financiera');
    expect(screen.getByRole('button', { name: 'Transversal: 25%' }).style.width).toBe('25%');
  });

  it('draws in-bar labels with an AA text colour for the tone, dark when dimmed', async () => {
    const user = userEvent.setup();
    renderBar();
    const fin = screen.getByRole('button', { name: 'Financiera: 45%' });
    const op = screen.getByRole('button', { name: 'Operativa: 30%' });
    expect(within(fin).getByText('45%')).toHaveClass('text-text-inverse');
    expect(within(op).getByText('30%')).toHaveClass('text-text-heading');
    await user.click(op);
    expect(within(fin).getByText('45%')).toHaveClass('text-text-heading');
  });

  it('click toggles the tip, dims the others and keeps a single tip open', async () => {
    const user = userEvent.setup();
    renderBar();
    const fin = screen.getByRole('button', { name: 'Financiera: 45%' });
    const op = screen.getByRole('button', { name: 'Operativa: 30%' });

    await user.click(fin);
    expect(fin).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('Financiera · 45%');
    expect(op).toHaveAttribute('data-dimmed', 'true');
    expect(fillOf(op)).toHaveClass('opacity-30');
    expect(fillOf(fin)).toHaveClass('opacity-100');

    await user.click(op);
    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(screen.getByRole('status')).toHaveTextContent('Operativa · 30%');
    expect(fin).toHaveAttribute('aria-expanded', 'false');
    expect(fillOf(fin)).toHaveClass('opacity-30');

    await user.click(op);
    expect(screen.queryByRole('status')).toBeNull();
    expect(fillOf(fin)).toHaveClass('opacity-100');
    expect(fin).toHaveAttribute('data-dimmed', 'false');
  });

  it('opens with Enter and Space and closes with Escape', async () => {
    const user = userEvent.setup();
    renderBar();
    const fin = screen.getByRole('button', { name: 'Financiera: 45%' });

    fin.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('status')).toHaveTextContent('Financiera');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('status')).toBeNull();

    await user.keyboard(' ');
    expect(screen.getByRole('status')).toHaveTextContent('Financiera');
    await user.keyboard(' ');
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('reports the open segment when controlled', async () => {
    const user = userEvent.setup();
    const onOpenSegmentChange = vi.fn();
    render(
      <StackedShareBar
        segments={segments}
        aria-label="Peso"
        openSegmentId={null}
        onOpenSegmentChange={onOpenSegmentChange}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Operativa: 30%' }));
    expect(onOpenSegmentChange).toHaveBeenLastCalledWith('op');
    expect(screen.queryByRole('status')).toBeNull();
  });
});
