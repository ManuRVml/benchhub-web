import { describe, expect, it } from 'vitest';

import { testId, toKebabCase } from './test-ids';

describe('testId', () => {
  it('builds the brief §5.6 examples', () => {
    expect(testId('comparison-overview', 'kpi', 'card', 'ebitda')).toBe(
      'comparison-overview-kpi-card-ebitda',
    );
    const peerId = 'shell';
    expect(testId('peer-ranking', 'table', 'row', peerId)).toBe(`peer-ranking-table-row-${peerId}`);
  });

  it('omits a missing qualifier', () => {
    expect(testId('home', 'peer-news', 'section')).toBe('home-peer-news-section');
  });

  it('normalises every part to kebab-case', () => {
    expect(testId('comparisonOverview', 'KPI Card', 'value_label', 'cmp_Shell')).toBe(
      'comparison-overview-kpi-card-value-label-cmp-shell',
    );
    expect(testId('peer-ranking', 'table', 'row', 3)).toBe('peer-ranking-table-row-3');
  });

  it('rejects empty parts', () => {
    expect(() => testId('home', ' ', 'section')).toThrow(/empty part/);
  });

  it('kebab-cases single parts', () => {
    expect(toKebabCase('peerRanking')).toBe('peer-ranking');
    expect(toKebabCase('--Peer  Ranking--')).toBe('peer-ranking');
  });
});
