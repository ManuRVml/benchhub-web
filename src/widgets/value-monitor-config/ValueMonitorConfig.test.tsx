import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { testIds } from './test-ids';
import { ValueMonitorConfig } from './ValueMonitorConfig';

import type { ValueMonitorConfigApply } from './ValueMonitorConfig';
import type {
  ValueMonitorConfigIndicator,
  ValueMonitorConfigSource,
} from '@/entities/value-monitor';

// Real C-17 shape (UpdateValueMonitorConfigurationBody): visibleIndicators + thresholds + period, not the per-KVI
// weight editing the widget originally had -- see ValueMonitorConfig.tsx's docstring for the contract mismatch this
// replaces.
const INDICATORS: ValueMonitorConfigIndicator[] = [
  { id: 'ind_roace', label: 'ROACE', isIncluded: true },
  { id: 'ind_margen_ebitda', label: 'Margen EBITDA', isIncluded: false },
];

const SOURCES: ValueMonitorConfigSource[] = [
  { id: 'capital_iq', label: 'Capital IQ', isEnabled: true },
  { id: 'bloomberg', label: 'Bloomberg', isEnabled: true },
  { id: 'platts', label: 'Platts', isEnabled: false },
  { id: 'interna_ecp', label: 'Fuentes internas Ecopetrol', isEnabled: true },
];

function renderConfig(overrides: Partial<Parameters<typeof ValueMonitorConfig>[0]> = {}) {
  const onApply = vi.fn();
  const onAddIndicator = vi.fn();
  const utils = render(
    <ValueMonitorConfig
      cutOffDate="2025-12-31"
      rangeFrom={2023}
      rangeTo={2025}
      sources={SOURCES}
      exceptionsText=""
      assistantContext="Agrupa por segmento"
      indicators={INDICATORS}
      thresholds={{ alert: 70, warning: 90 }}
      period="quarter"
      onApply={onApply}
      onAddIndicator={onAddIndicator}
      applying={false}
      {...overrides}
    />,
  );
  return { ...utils, onApply, onAddIndicator };
}

describe('ValueMonitorConfig (SCR-11 §7)', () => {
  it('applies with the current visible indicators, thresholds and period unedited', async () => {
    const { onApply } = renderConfig();
    const user = userEvent.setup({ delay: null });

    await user.click(screen.getByTestId(testIds.applyButton));

    expect(onApply).toHaveBeenCalledWith({
      visibleIndicators: ['ind_roace'],
      thresholds: { alert: 70, warning: 90 },
      period: 'quarter',
    });
  });

  it('applies with an edited threshold and period', async () => {
    const { onApply } = renderConfig();
    const user = userEvent.setup({ delay: null });

    await user.clear(screen.getByTestId(testIds.thresholdAlertInput));
    await user.type(screen.getByTestId(testIds.thresholdAlertInput), '65');
    await user.selectOptions(screen.getByTestId(testIds.periodSelect), 'year');
    await user.click(screen.getByTestId(testIds.applyButton));

    expect(onApply).toHaveBeenCalledWith({
      visibleIndicators: ['ind_roace'],
      thresholds: { alert: 65, warning: 90 },
      period: 'year',
    });
  });

  it('toggling an indicator chip changes what gets applied', async () => {
    const { onApply } = renderConfig();
    const user = userEvent.setup({ delay: null });

    await user.click(screen.getByRole('button', { name: 'Margen EBITDA' }));
    await user.click(screen.getByTestId(testIds.applyButton));

    expect(onApply).toHaveBeenCalledTimes(1);
    const [applied] = onApply.mock.calls[0] as [ValueMonitorConfigApply];
    expect([...applied.visibleIndicators].sort()).toEqual(['ind_margen_ebitda', 'ind_roace']);
  });

  it('renders every V-32 source and KVI plus the date, range and free-text fields (SCR-11 fidelity)', () => {
    const indicators: ValueMonitorConfigIndicator[] = Array.from({ length: 22 }, (_, index) => ({
      id: `kvi_${String(index)}`,
      label: `KVI ${String(index)}`,
      isIncluded: index !== 3,
    }));
    renderConfig({ indicators });

    const sources = within(screen.getByTestId(testIds.sources)).getAllByRole('listitem');
    expect(sources).toHaveLength(4);
    expect(screen.getByTestId(testIds.source('capital_iq'))).toHaveAttribute(
      'data-enabled',
      'true',
    );
    expect(screen.getByTestId(testIds.source('platts'))).toHaveAttribute('data-enabled', 'false');
    expect(screen.getByTestId(testIds.source('platts'))).toHaveTextContent('Platts inactiva');

    const chips = within(
      screen.getByRole('group', { name: 'Indicadores y métricas incluidos' }),
    ).getAllByRole('button');
    expect(chips).toHaveLength(22);
    expect(chips.filter((chip) => chip.getAttribute('aria-pressed') === 'true')).toHaveLength(21);

    expect(screen.getByTestId(testIds.cutOffDateInput)).toHaveValue('2025-12-31');
    expect(screen.getByTestId(testIds.rangeFromInput)).toHaveValue('2023');
    expect(screen.getByTestId(testIds.rangeToInput)).toHaveValue('2025');
    expect(screen.getByTestId(testIds.assistantContextInput)).toHaveValue('Agrupa por segmento');
    // C-17 cannot save these: they are read-only, never an edit "Aplicar configuración" would drop.
    for (const id of [testIds.cutOffDateInput, testIds.rangeFromInput, testIds.exceptionsInput]) {
      expect(screen.getByTestId(id)).toHaveAttribute('readonly');
    }
  });

  it('disables the apply button while applying', () => {
    renderConfig({ applying: true });
    expect(screen.getByTestId(testIds.applyButton)).toBeDisabled();
  });

  it('calls onAddIndicator when "+ Añadir indicador" is clicked', async () => {
    const { onAddIndicator } = renderConfig();
    const user = userEvent.setup({ delay: null });

    await user.click(screen.getByTestId(testIds.addIndicatorButton));

    expect(onAddIndicator).toHaveBeenCalledTimes(1);
  });
});
