import { describe, expect, it } from 'vitest';

import { stepperStatus } from './stepper-status';

describe('stepperStatus', () => {
  it('a fresh draft on step 1 shows the later steps pending even when V-05 says they are valid', () => {
    expect([1, 2, 3, 4, 5].map((step) => stepperStatus(step, 1, 'valid', [1]))).toEqual([
      'current',
      'pending',
      'pending',
      'pending',
      'pending',
    ]);
  });

  it('marks the steps before the current one by their V-05 status', () => {
    expect(stepperStatus(1, 4, 'valid', [4])).toBe('done');
    expect(stepperStatus(2, 4, 'invalid', [4])).toBe('invalid');
    expect(stepperStatus(3, 4, 'untouched', [4])).toBe('pending');
    expect(stepperStatus(5, 4, 'valid', [4])).toBe('pending');
  });

  it('keeps a later step the user already opened in this session by its status', () => {
    expect(stepperStatus(3, 1, 'valid', [1, 3])).toBe('done');
    expect(stepperStatus(3, 1, 'invalid', [1, 3])).toBe('invalid');
    expect(stepperStatus(4, 1, 'valid', [1, 3])).toBe('pending');
  });
});
