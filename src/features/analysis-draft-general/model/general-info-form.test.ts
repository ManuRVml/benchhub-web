import { describe, expect, it } from 'vitest';

import {
  fieldErrorCode,
  formFieldOf,
  generalInfoSchema,
  toDraftField,
  valuesFromDraft,
} from './general-info-form';

import type { GeneralInfoValues } from './general-info-form';
import type { V05Response } from '@/shared/api';

const DRAFT: V05Response['draft'] = {
  id: 'drf_1',
  type: 'estrategico_tbg',
  name: 'Desempeño comparativo — 4T 2025',
  objective: 'Evaluar la posición competitiva de Ecopetrol.',
  question: '',
  currentPeriod: { year: 2025, quarter: 4 },
  comparedPeriod: { year: 2025, quarter: 3 },
  cutOffDate: null,
  scope: ['grupo_ecopetrol'],
  competitorIds: [],
  indicatorIds: [],
  sources: [],
};

const valid = (): GeneralInfoValues => valuesFromDraft(DRAFT);
const codesOf = (values: GeneralInfoValues) => {
  const result = generalInfoSchema.safeParse(values);
  return result.success
    ? []
    : result.error.issues.map((issue) => `${issue.path.join('.')}:${issue.message}`);
};

describe('general info form model', () => {
  it('reads a V-05 draft into form values (selects as strings, no cut-off date as "")', () => {
    expect(valid()).toMatchObject({ currentQuarter: '4', currentYear: '2025', cutOffDate: '' });
    expect(codesOf(valid())).toEqual([]);
  });

  it('maps a changed field to its C-02 key and value', () => {
    expect(toDraftField('name', 'ROACE')).toEqual(['name', 'ROACE']);
    expect(toDraftField('currentQuarter', '2')).toEqual(['currentPeriod.quarter', 2]);
    expect(toDraftField('comparedYear', '2024')).toEqual(['comparedPeriod.year', 2024]);
    expect(toDraftField('cutOffDate', '')).toEqual(['cutOffDate', null]);
    expect(toDraftField('scope', ['grupo_ecopetrol', 'isa'])).toEqual([
      'scope',
      ['grupo_ecopetrol', 'isa'],
    ]);
  });

  it('maps C-02 error keys back to form fields and unknown codes to invalid', () => {
    expect(formFieldOf('comparedPeriod.quarter')).toBe('comparedQuarter');
    expect(formFieldOf('fieldName')).toBeUndefined();
    expect(fieldErrorCode('tooLong')).toBe('tooLong');
    expect(fieldErrorCode('max_length')).toBe('invalid');
  });

  it('applies the step-1 rules: required name, compared before current, a scope, no future cut-off date', () => {
    expect(codesOf({ ...valid(), name: '  ' })).toContain('name:required');
    expect(codesOf({ ...valid(), name: 'ab' })).toContain('name:tooShort');
    expect(codesOf({ ...valid(), comparedQuarter: '4' })).toContain('comparedQuarter:periodOrder');
    expect(codesOf({ ...valid(), scope: [] })).toContain('scope:atLeastOne');
    expect(codesOf({ ...valid(), cutOffDate: '2999-01-01' })).toContain('cutOffDate:futureDate');
  });
});
