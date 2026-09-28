// Architecture-only ESLint config: FSD boundaries, the import fences (echarts, generated contract) and the routes rule,
// without type information.
// Used by `pnpm check:architecture` (src + valid fixtures) and `pnpm check:architecture:selftest` (planted fixtures,
// which are excluded from tsconfig and may import packages that are not installed).
import { defineConfig, globalIgnores } from 'eslint/config';
import { parser as tsParser } from 'typescript-eslint';

import { FSD_ROOTS, fsdConfigs } from './fsd-rules.js';

export default defineConfig(
  // Orval output (pnpm contract:generate, gitignored): generated, never linted.
  globalIgnores(['src/shared/api/generated/**']),
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    linterOptions: { reportUnusedDisableDirectives: 'error' },
  },
  {
    // This config never registers react-hooks or jsx-a11y, so its own unused-directive check flags every
    // `eslint-disable-next-line` that only exists to silence a react-hooks/exhaustive-deps or jsx-a11y/* rule under
    // `pnpm lint`. Exempt those files here instead of stripping the (correct, main-lint-only) suppression comment.
    files: [
      'src/features/presentation-download/ui/PresentationDownloadModal.tsx',
      'src/pages/presentations/PresentationsPage.tsx',
      'src/pages/value-monitor/ValueMonitorPage.tsx',
      'src/widgets/peer-weight-ranking/PeerWeightRanking.tsx',
    ],
    linterOptions: { reportUnusedDisableDirectives: 'off' },
  },
  ...fsdConfigs(FSD_ROOTS),
);
