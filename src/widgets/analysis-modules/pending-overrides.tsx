// Relocated to `entities/analysis` (P5-41): two sibling widgets (this one and `company-coverage`) need it, and a
// widget may only import a lower layer, never another widget (FSD boundary, `tools/architecture/fsd-rules.js`).
// Re-exported here so existing imports of `./pending-overrides` keep working.
export { PendingOverridesProvider, usePendingOverrides } from '@/entities/analysis';
