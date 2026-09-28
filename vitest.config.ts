import { defineConfig, mergeConfig } from 'vitest/config';

import viteConfig from './vite.config';

// Unit and component tests (brief §2.4): jsdom + Testing Library + MSW. Reuses vite.config.ts (React plugin, `@` alias).
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['./tools/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}', 'tools/**/*.test.{ts,tsx,mjs}'],
      passWithNoTests: true,
      coverage: {
        provider: 'v8',
        include: ['src/**/*.{ts,tsx}'],
        exclude: [
          'src/**/*.test.*',
          'src/**/*.stories.*',
          'src/shared/api/generated/**',
          'src/test/**',
        ],
        thresholds: {
          lines: 80,
        },
      },
    },
  }),
);
