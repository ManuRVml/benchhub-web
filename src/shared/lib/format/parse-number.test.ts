import { describe, expect, it } from 'vitest';

import { parseEsCoNumber } from './parse-number';

describe('parseEsCoNumber', () => {
  it.each([
    ['', { kind: 'empty' }],
    ['   ', { kind: 'empty' }],
    ['7,4', { kind: 'number', value: 7.4 }],
    ['7.4', { kind: 'number', value: 7.4 }],
    ['4.102', { kind: 'number', value: 4102 }],
    ['4.102,5', { kind: 'number', value: 4102.5 }],
    ['-5.000', { kind: 'number', value: -5000 }],
    ['−0,5', { kind: 'number', value: -0.5 }],
    [',5', { kind: 'number', value: 0.5 }],
    ['0', { kind: 'number', value: 0 }],
    ['abc', { kind: 'invalid' }],
    ['7,4,1', { kind: 'invalid' }],
    ['1.23,4', { kind: 'invalid' }],
    ['-', { kind: 'invalid' }],
  ])('reads %j', (text, expected) => {
    expect(parseEsCoNumber(text)).toEqual(expected);
  });
});
