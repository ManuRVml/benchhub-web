import { describe, expect, it } from 'vitest';

import { DATA_STATES, dataEntityAttrs, dataStateAttrs, dataValueAttrs } from './data-state';

describe('data-state helpers', () => {
  it('lists the five states of brief §5.6', () => {
    expect(DATA_STATES).toEqual(['loading', 'empty', 'error', 'forbidden', 'ready']);
  });

  it('builds data-state', () => {
    expect(dataStateAttrs('forbidden')).toEqual({ 'data-state': 'forbidden' });
  });

  it('builds data-entity-*', () => {
    expect(dataEntityAttrs('company', 'cmp_shell')).toEqual({
      'data-entity-type': 'company',
      'data-entity-id': 'cmp_shell',
    });
  });

  it('builds data-value with an optional data-trend', () => {
    expect(dataValueAttrs(7.4, 'down')).toEqual({ 'data-value': '7.4', 'data-trend': 'down' });
    expect(dataValueAttrs(0)).toEqual({ 'data-value': '0' });
    expect(dataValueAttrs(null)).toEqual({ 'data-value': '' });
  });
});
