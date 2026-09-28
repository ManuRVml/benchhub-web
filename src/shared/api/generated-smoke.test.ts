// Smoke test of the Orval output (P3-13, ADR-0004): the generated Zod schema of V-03 (GET /api/v1/views/home) accepts
// the web's own contract example (docs/design/view-data-contracts/V-03-home.md) and rejects a wrong enum value. V-03 is
// used because its 0.1.0 shape agrees with the web docs (CF-95/96 applied on both sides; CF-97..CF-112 do not touch it).
import { describe, expect, it } from 'vitest';

import { GetHomeViewResponse } from './generated/zod';

import type { V03Response } from './generated/model';

const v03Doc = Object.values(
  import.meta.glob<string>('/docs/design/view-data-contracts/V-03-home.md', {
    query: '?raw',
    import: 'default',
    eager: true,
  }),
)[0];

/** The first ```json block of the contract, with its bullet indent removed. */
function firstJsonExample(markdown: string | undefined): unknown {
  const match = /^([ \t]*)```json\r?\n([\s\S]*?)\r?\n\1```/m.exec(markdown ?? '');
  if (!match) throw new Error('V-03-home.md has no ```json example');
  const indent = match[1] ?? '';
  const body = (match[2] ?? '')
    .split('\n')
    .map((line) => (line.startsWith(indent) ? line.slice(indent.length) : line))
    .join('\n');
  return JSON.parse(body);
}

const example = firstJsonExample(v03Doc) as V03Response;

describe('generated contract (Orval, @eco/bff-contract 0.1.0)', () => {
  it('parses the V-03 home example of the web docs', () => {
    const parsed: V03Response = GetHomeViewResponse.parse(example);
    expect(parsed).toEqual(example);
  });

  it('accepts the error and forbidden variants of a section', () => {
    const degraded = {
      ...example,
      banner: { status: 'error', errorCode: 'PROVIDER_ERROR' },
      peerNews: { status: 'forbidden' },
    };
    expect(GetHomeViewResponse.safeParse(degraded).success).toBe(true);
  });

  it('rejects a unit outside the canonical enum (usd_per_bbl was retired by CF-96)', () => {
    const copy = structuredClone(example);
    const indicators = copy.marketIndicators;
    if (indicators.status !== 'ok') throw new Error('the example market indicators must be ok');
    const [first] = indicators.data;
    if (!first) throw new Error('the example has no market indicator');
    (first as { unit: string }).unit = 'usd_per_bbl';
    expect(GetHomeViewResponse.safeParse(copy).success).toBe(false);
  });

  it('rejects unknown keys (the spec closes every object)', () => {
    expect(GetHomeViewResponse.safeParse({ ...example, extra: true }).success).toBe(false);
  });
});
