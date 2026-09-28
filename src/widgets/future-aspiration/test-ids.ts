/**
 * Test IDs for FutureAspiration widget (P5-45a).
 * Convention: `<scope>-<component>-<element>`; scope = widget name.
 */
export const futureAspirationTestIds = {
  root: () => 'future-aspiration',
  row: (companyId: string) => `future-aspiration-row-${companyId}`,
  rankCircle: (rank: number) => `future-aspiration-rank-${String(rank)}`,
  segmentChip: (segmentId: string) => `future-aspiration-segment-chip-${segmentId}`,
};
