import { describe, expect, it } from 'vitest';

import { queryKeys } from './query-keys';

describe('queryKeys', () => {
  it('all starts with eco', () => {
    expect(queryKeys.all).toEqual(['eco']);
  });

  describe('home', () => {
    it('starts with eco', () => {
      expect(queryKeys.home()).toEqual(['eco', 'home']);
    });

    it('is stable (equal on repeated calls)', () => {
      expect(queryKeys.home()).toEqual(queryKeys.home());
    });
  });

  describe('analyses', () => {
    it('starts with eco', () => {
      expect(queryKeys.analyses()).toEqual(['eco', 'analyses', {}]);
    });

    it('includes query params when provided', () => {
      const query = { page: 1, search: 'test' };
      expect(queryKeys.analyses(query)).toEqual(['eco', 'analyses', query]);
    });

    it('is stable (equal on repeated calls)', () => {
      expect(queryKeys.analyses()).toEqual(queryKeys.analyses());
    });
  });

  describe('analysisDefinition', () => {
    it('starts with eco', () => {
      expect(queryKeys.analysisDefinition('draft-123')).toEqual([
        'eco',
        'analysis-definition',
        'draft-123',
      ]);
    });

    it('different draftIds give different keys', () => {
      expect(queryKeys.analysisDefinition('draft-123')).not.toEqual(
        queryKeys.analysisDefinition('draft-456'),
      );
    });

    it('is stable (equal on repeated calls)', () => {
      expect(queryKeys.analysisDefinition('draft-123')).toEqual(
        queryKeys.analysisDefinition('draft-123'),
      );
    });
  });

  describe('competitorCatalog', () => {
    it('starts with eco', () => {
      expect(queryKeys.competitorCatalog()).toEqual(['eco', 'competitor-catalog']);
    });

    it('is stable (equal on repeated calls)', () => {
      expect(queryKeys.competitorCatalog()).toEqual(queryKeys.competitorCatalog());
    });
  });

  describe('indicatorCatalog', () => {
    it('starts with eco', () => {
      expect(queryKeys.indicatorCatalog()).toEqual(['eco', 'indicator-catalog', 'pares']);
    });

    it('is stable (equal on repeated calls)', () => {
      expect(queryKeys.indicatorCatalog()).toEqual(queryKeys.indicatorCatalog());
    });
  });

  describe('analysisValidation', () => {
    it('starts with eco', () => {
      expect(queryKeys.analysisValidation('draft-123')).toEqual([
        'eco',
        'analysis-validation',
        'draft-123',
      ]);
    });

    it('different draftIds give different keys', () => {
      expect(queryKeys.analysisValidation('draft-123')).not.toEqual(
        queryKeys.analysisValidation('draft-456'),
      );
    });

    it('is stable (equal on repeated calls)', () => {
      expect(queryKeys.analysisValidation('draft-123')).toEqual(
        queryKeys.analysisValidation('draft-123'),
      );
    });
  });

  describe('analysis', () => {
    it('starts with eco', () => {
      expect(queryKeys.analysis('analysis-123')).toEqual(['eco', 'analysis', 'analysis-123']);
    });

    it('different analysisIds give different keys', () => {
      expect(queryKeys.analysis('analysis-123')).not.toEqual(queryKeys.analysis('analysis-456'));
    });

    it('is stable (equal on repeated calls)', () => {
      expect(queryKeys.analysis('analysis-123')).toEqual(queryKeys.analysis('analysis-123'));
    });
  });

  describe('resultsHeader', () => {
    it('starts with analysis prefix', () => {
      expect(queryKeys.resultsHeader('analysis-123')).toEqual([
        'eco',
        'analysis',
        'analysis-123',
        'results-header',
        'tbg',
      ]);
    });

    it('includes the horizon (default tbg)', () => {
      expect(queryKeys.resultsHeader('analysis-123', 'union')).toEqual([
        'eco',
        'analysis',
        'analysis-123',
        'results-header',
        'union',
      ]);
      expect(queryKeys.resultsHeader('analysis-123', 'ilp')).not.toEqual(
        queryKeys.resultsHeader('analysis-123', 'tbg'),
      );
    });

    it('different analysisIds give different keys', () => {
      expect(queryKeys.resultsHeader('analysis-123')).not.toEqual(
        queryKeys.resultsHeader('analysis-456'),
      );
    });

    it('is stable (equal on repeated calls)', () => {
      expect(queryKeys.resultsHeader('analysis-123')).toEqual(
        queryKeys.resultsHeader('analysis-123'),
      );
    });
  });

  describe('companyCoverage', () => {
    it('starts with analysis prefix', () => {
      expect(queryKeys.companyCoverage('analysis-123')).toEqual([
        'eco',
        'analysis',
        'analysis-123',
        'company-coverage',
      ]);
    });

    it('different analysisIds give different keys', () => {
      expect(queryKeys.companyCoverage('analysis-123')).not.toEqual(
        queryKeys.companyCoverage('analysis-456'),
      );
    });

    it('is stable (equal on repeated calls)', () => {
      expect(queryKeys.companyCoverage('analysis-123')).toEqual(
        queryKeys.companyCoverage('analysis-123'),
      );
    });
  });

  describe('peerAverageComparison', () => {
    it('starts with analysis prefix', () => {
      expect(queryKeys.peerAverageComparison('analysis-123')).toEqual([
        'eco',
        'analysis',
        'analysis-123',
        'peer-average-comparison',
      ]);
    });

    it('different analysisIds give different keys', () => {
      expect(queryKeys.peerAverageComparison('analysis-123')).not.toEqual(
        queryKeys.peerAverageComparison('analysis-456'),
      );
    });

    it('is stable (equal on repeated calls)', () => {
      expect(queryKeys.peerAverageComparison('analysis-123')).toEqual(
        queryKeys.peerAverageComparison('analysis-123'),
      );
    });
  });

  describe('companyComparison', () => {
    it('starts with analysis prefix', () => {
      expect(queryKeys.companyComparison('analysis-123')).toEqual([
        'eco',
        'analysis',
        'analysis-123',
        'company-comparison',
      ]);
    });

    it('different analysisIds give different keys', () => {
      expect(queryKeys.companyComparison('analysis-123')).not.toEqual(
        queryKeys.companyComparison('analysis-456'),
      );
    });

    it('is stable (equal on repeated calls)', () => {
      expect(queryKeys.companyComparison('analysis-123')).toEqual(
        queryKeys.companyComparison('analysis-123'),
      );
    });
  });

  describe('reportSummary', () => {
    it('starts with analysis prefix', () => {
      expect(queryKeys.reportSummary('analysis-123')).toEqual([
        'eco',
        'analysis',
        'analysis-123',
        'report-summary',
      ]);
    });

    it('different analysisIds give different keys', () => {
      expect(queryKeys.reportSummary('analysis-123')).not.toEqual(
        queryKeys.reportSummary('analysis-456'),
      );
    });

    it('is stable (equal on repeated calls)', () => {
      expect(queryKeys.reportSummary('analysis-123')).toEqual(
        queryKeys.reportSummary('analysis-123'),
      );
    });
  });

  describe('aiFindings', () => {
    it('starts with analysis prefix', () => {
      expect(queryKeys.aiFindings('analysis-123')).toEqual([
        'eco',
        'analysis',
        'analysis-123',
        'ai-findings',
        'tbg',
      ]);
    });

    it('includes the horizon', () => {
      expect(queryKeys.aiFindings('analysis-123', 'ilp')).toEqual([
        'eco',
        'analysis',
        'analysis-123',
        'ai-findings',
        'ilp',
      ]);
    });

    it('different analysisIds give different keys', () => {
      expect(queryKeys.aiFindings('analysis-123')).not.toEqual(
        queryKeys.aiFindings('analysis-456'),
      );
    });

    it('is stable (equal on repeated calls)', () => {
      expect(queryKeys.aiFindings('analysis-123')).toEqual(queryKeys.aiFindings('analysis-123'));
    });
  });
});
