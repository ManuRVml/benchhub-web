/**
 * TEMPORARY (P5-07): hand-written copy of the contract type `SectionResult<T>` (brief §3, view-data contracts). P3-13
 * generates it from the pinned `@eco/bff-contract` into `src/shared/api/generated/`; then delete this file and import
 * the generated type.
 *
 * One independently loaded section of a view: the view still answers 200 when a section fails or is not allowed
 * (brief §4.1 rule 4, partial degradation).
 */
export type SectionResult<T> =
  { status: 'ok'; data: T } | { status: 'error'; errorCode: string } | { status: 'forbidden' };
