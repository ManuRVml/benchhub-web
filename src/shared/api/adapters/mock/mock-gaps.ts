import type { MockOperationId } from './operations';

export interface MockGap {
  /** Why the docs fixture does not parse with the 0.1.0 schema. */
  reason: string;
  /**
   * Minimal payload valid for 0.1.0, served instead of the fixture. `undefined` when 0.1.0 accepts no payload at all:
   * the mock then fails with INVALID_RESPONSE, exactly as the HTTP client would.
   */
  payload: unknown;
}

/**
 * Operations whose docs fixture (`src/test/fixtures/contracts/<ID>.response.json`, current docs up to CF-138) does not
 * parse with the vendored 0.1.0 schema, which predates those decisions. Kept visible on purpose; a test recomputes the
 * set from the fixtures so this list cannot drift. Remove an entry when the contract catches up.
 *
 * Empty as of the CF-revendor re-pack: every previously-listed divergence (CF-101 English statuses, CF-107 totalItems
 * rename, C-16's row/kpis/composition shape, C-24's operating_costs key, Q-B06's upload filename pattern, and C-28's
 * full builder-patch shape) has since landed on BFF main. All 48 doc fixtures now validate against 0.1.0.
 */
export const MOCK_GAPS: Partial<Record<MockOperationId, MockGap>> = {};
