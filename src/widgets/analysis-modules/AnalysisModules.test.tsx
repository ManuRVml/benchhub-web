import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';

import { AnalysisModules } from './AnalysisModules';
import { resetUnknownModuleReports, resolveModules } from './module-registry';
import { RESULTS_MODULE_REGISTRY } from './ModuleFrame';
import { PendingOverridesProvider, usePendingOverrides } from './pending-overrides';

import type { ResultsModule } from './module-registry';

const all = ['tbg', 'ilp', 'union'] as const;
const noUnion = ['tbg', 'ilp'] as const;

// V-09 sample order (docs/design/view-data-contracts/V-09-results-header.md L29–39), shuffled on purpose.
const MODULES: ResultsModule[] = [
  { id: 'reportSummary', order: 10, isGated: false, visibleInHorizons: [...noUnion] },
  { id: 'actionRow', order: 1, isGated: false, visibleInHorizons: [...all] },
  { id: 'peerAverageComparison', order: 3, isGated: false, visibleInHorizons: [...all] },
  { id: 'companyCoverage', order: 2, isGated: false, visibleInHorizons: [...noUnion] },
  { id: 'tbgHorizon', order: 7, isGated: false, visibleInHorizons: [...all] },
  { id: 'footerActions', order: 11, isGated: false, visibleInHorizons: [...noUnion] },
];

/** A module id a newer BFF could send; the registry must skip it. */
const UNKNOWN = {
  id: 'esgScorecard',
  order: 4,
  isGated: false,
  visibleInHorizons: [...all],
};

const renderedOrder = () =>
  [...document.querySelectorAll('[data-module], [data-slot]')].map(
    (node) => node.getAttribute('data-module') ?? node.getAttribute('data-slot'),
  );

function renderModules(
  modules: readonly ResultsModule[],
  horizon: 'tbg' | 'ilp' | 'union' = 'tbg',
) {
  return render(
    <AnalysisModules
      analysisId="ana_1"
      horizon={horizon}
      modules={modules}
      slots={{
        actionRow: <div data-slot="actionRow" />,
        footerActions: <div data-slot="footerActions" />,
      }}
    />,
  );
}

describe('AnalysisModules', () => {
  let warn: MockInstance<typeof globalThis.console.warn>;

  beforeEach(() => {
    resetUnknownModuleReports();
    warn = vi.spyOn(globalThis.console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    warn.mockRestore();
  });

  it('renders the known module frames and slots in V-09 order', () => {
    renderModules(MODULES);
    expect(renderedOrder()).toEqual([
      'actionRow',
      'companyCoverage',
      'peerAverageComparison',
      'tbgHorizon',
      'reportSummary',
      'footerActions',
    ]);
    expect(
      screen.getByRole('heading', { name: 'Comparativo GE vs. Promedio Pares' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('analysis-module-tbgHorizon')).toHaveTextContent('Horizonte TBG');
  });

  it('keeps only the modules visible in the horizon (TBG + ILP hides coverage, summary and footer)', () => {
    renderModules(MODULES, 'union');
    expect(renderedOrder()).toEqual(['actionRow', 'peerAverageComparison', 'tbgHorizon']);
    expect(screen.getByTestId('analysis-module-tbgHorizon')).toHaveTextContent(
      'Horizonte TBG y ILP',
    );
  });

  it('skips an unknown module id without crashing and reports it once', () => {
    const { rerender } = renderModules([...MODULES, UNKNOWN]);
    expect(renderedOrder()).not.toContain('esgScorecard');
    expect(renderedOrder()).toHaveLength(6);
    rerender(<AnalysisModules analysisId="ana_1" horizon="ilp" modules={[UNKNOWN, ...MODULES]} />);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[0]).toContain('esgScorecard');
  });

  it('resolves slots and content through the registry', () => {
    const resolved = resolveModules([...MODULES, UNKNOWN], 'tbg', RESULTS_MODULE_REGISTRY);
    expect(resolved.map((entry) => [entry.kind, entry.module.id])).toEqual([
      ['slot', 'actionRow'],
      ['content', 'companyCoverage'],
      ['content', 'peerAverageComparison'],
      ['content', 'tbgHorizon'],
      ['content', 'reportSummary'],
      ['slot', 'footerActions'],
    ]);
  });
});

describe('PendingOverridesProvider', () => {
  function Probe() {
    const pending = usePendingOverrides();
    return (
      <>
        <output>{pending.overrides.length}</output>
        <button
          type="button"
          onClick={() => {
            pending.stage({
              companyId: 'cmp_bp',
              indicatorId: 'ind_roace',
              value: 7,
              isEstimate: false,
            });
          }}
        >
          {'stage'}
        </button>
      </>
    );
  }

  it('keeps one pending edit per company × indicator', () => {
    render(
      <PendingOverridesProvider
        initial={[{ companyId: 'cmp_bp', indicatorId: 'ind_roace', value: 5, isEstimate: false }]}
      >
        <Probe />
      </PendingOverridesProvider>,
    );
    screen.getByRole('button').click();
    expect(screen.getByRole('status')).toHaveTextContent('1');
  });
});
