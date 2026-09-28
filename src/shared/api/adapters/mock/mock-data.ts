import { ApiError } from '../../errors';

import { MOCK_GAPS } from './mock-gaps';
import { MOCK_OPERATIONS } from './operations';

import type { MockOperationId } from './operations';
import type { z } from 'zod';

// ZodIssue is deprecated in zod v4. Use unknown and let TypeScript infer the type.

// Fixtures are loaded lazily (one chunk each), so an `http` build carries only the loaders, never the data.
const FIXTURES = import.meta.glob<unknown>('/src/test/fixtures/contracts/*.response.json', {
  import: 'default',
});

export type MockResponse<K extends MockOperationId> = z.output<
  (typeof MOCK_OPERATIONS)[K]['schema']
>;

/** The docs fixture of a contract id (`<ID>.response.json`, e.g. `V-24`), unvalidated. */
export async function loadContractFixture(contract: string): Promise<unknown> {
  const load = FIXTURES[`/src/test/fixtures/contracts/${contract}.response.json`];
  if (!load) throw new Error(`no fixture for ${contract}`);
  return structuredClone(await load());
}

/** The docs fixture of an operation (`<ID>.response.json`), unvalidated. */
export async function loadFixture(operationId: MockOperationId): Promise<unknown> {
  return loadContractFixture(MOCK_OPERATIONS[operationId].contract);
}

/**
 * The payload the mocks serve for an operation, before validation: the MOCK_GAPS payload when the fixture does not fit
 * 0.1.0, else the fixture (also for a gap without a valid payload, which then fails validation as it would over HTTP).
 * MSW handlers send it as the response body (the HTTP client validates it).
 */
export async function mockPayload(operationId: MockOperationId): Promise<unknown> {
  const gap = MOCK_GAPS[operationId]?.payload;
  if (gap !== undefined) return structuredClone(gap);
  return loadFixture(operationId);
}

/**
 * The validated payload of an operation, as the port returns it. It goes through the operation's generated schema like
 * an HTTP response; a payload 0.1.0 cannot accept rejects with `ApiError { code: 'INVALID_RESPONSE' }`.
 */
export async function mockResponse<K extends MockOperationId>(
  operationId: K,
): Promise<MockResponse<K>> {
  const payload = await mockPayload(operationId);
  const result = MOCK_OPERATIONS[operationId].schema.safeParse(payload);
  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      path: issue.path,
      code: issue.code,
      message: issue.message,
    }));
    throw new ApiError({
      code: 'INVALID_RESPONSE',
      message: `Mock payload of ${operationId} does not match contract 0.1.0`,
      traceId: 'mock',
      status: 200,
      details,
    });
  }
  return result.data as MockResponse<K>;
}
