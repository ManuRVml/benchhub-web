import js from '@eslint/js';
import vitest from '@vitest/eslint-plugin';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettierConfig from 'eslint-config-prettier';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import { createNodeResolver, importX } from 'eslint-plugin-import-x';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import playwright from 'eslint-plugin-playwright';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import { configs as tsConfigs } from 'typescript-eslint';

import { fsdConfigs } from './tools/architecture/fsd-rules.js';

const TS_FILES = ['**/*.ts', '**/*.tsx'];
const JS_FILES = ['**/*.js', '**/*.cjs', '**/*.mjs'];
const UNUSED_VARS_OPTIONS = {
  argsIgnorePattern: '^_',
  varsIgnorePattern: '^_',
  caughtErrorsIgnorePattern: '^_',
  destructuredArrayIgnorePattern: '^_',
};

export default defineConfig(
  // Planted fixtures break the architecture rules on purpose and may import packages that are not installed;
  // only `pnpm check:architecture:selftest` lints them.
  globalIgnores([
    'dist/**',
    'coverage/**',
    'playwright-report/**',
    'test-results/**',
    'storybook-static/**',
    'src/shared/api/generated/**',
    'tools/arch-fixtures/planted/**',
    // Byte-exact third-party UMD builds served to the prototype (sha384-pinned).
    'tools/prototype-render/vendor/**',
  ]),

  js.configs.recommended,
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
    },
    settings: {
      'import-x/resolver-next': [createTypeScriptImportResolver(), createNodeResolver()],
    },
    rules: {
      'no-console': 'error',
      // `_`-prefixed names mark intentionally unused bindings (e.g. `([_, value]) => …`).
      'no-unused-vars': ['error', UNUSED_VARS_OPTIONS],
      'import-x/no-cycle': 'error',
      'import-x/no-duplicates': 'error',
      'import-x/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'type'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },

  {
    files: TS_FILES,
    extends: [tsConfigs.strictTypeChecked, tsConfigs.stylisticTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', UNUSED_VARS_OPTIONS],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
      '@typescript-eslint/consistent-type-exports': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        { 'ts-ignore': true, 'ts-expect-error': 'allow-with-description' },
      ],
    },
  },
  {
    files: JS_FILES,
    extends: [tsConfigs.disableTypeChecked],
  },

  {
    files: ['**/*.tsx'],
    extends: [
      react.configs.flat.recommended,
      react.configs.flat['jsx-runtime'],
      reactHooks.configs.flat.recommended,
      jsxA11y.flatConfigs.recommended,
    ],
    // Pinned instead of "detect": the installed react@18.3.1 belongs to the prototype render harness, the app targets
    // React 19 (P2-W01b).
    settings: { react: { version: '19.3' } },
    rules: {
      'react-hooks/exhaustive-deps': 'error',
      // Props are typed with TypeScript.
      'react/prop-types': 'off',
    },
  },

  // The theme resets Tailwind's defaults and exposes only tablet/laptop/desktop/canvas. A default
  // breakpoint prefix therefore silently emits no CSS; reject it in source class strings.
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/\\b(sm|md|lg|xl|2xl):/]',
          message:
            'Use tablet:, laptop:, desktop:, or canvas: rather than a Tailwind default breakpoint.',
        },
      ],
    },
  },

  // AGENTS.md rule 15: visible text only through i18n (`useT()` from src/shared/i18n). Bare punctuation and glyphs
  // that carry no language are allowed.
  {
    files: [
      'src/pages/**/*.tsx',
      'src/widgets/**/*.tsx',
      'src/features/**/*.tsx',
      'src/entities/**/*.tsx',
      'src/shared/ui/**/*.tsx',
    ],
    rules: {
      'react/jsx-no-literals': [
        'error',
        {
          noStrings: false,
          ignoreProps: true,
          allowedStrings: [
            '·',
            '|',
            '›',
            '‹',
            '✦',
            '✕',
            '—',
            '–',
            '…',
            ':',
            '/',
            '%',
            '+',
            '-',
            '(',
            ')',
            '*',
          ],
        },
      ],
    },
  },

  ...fsdConfigs(['src', 'tools/arch-fixtures/valid']),

  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx', 'tests/unit/**'],
    ...vitest.configs.recommended,
  },
  {
    files: ['e2e/**/*.ts', 'tests/e2e/**/*.ts'],
    ...playwright.configs['flat/recommended'],
  },

  // Command-line tools report to the terminal by design.
  {
    files: ['tools/**/*.{js,mjs,cjs}'],
    rules: { 'no-console': 'off' },
  },

  // Must stay last: turns off stylistic rules that Prettier owns.
  prettierConfig,
);
