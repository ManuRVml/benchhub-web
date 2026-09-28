import type { StorybookConfig } from '@storybook/react-vite';

// Storybook for the design system (brief §5.5): every component under src/shared/ui gets a story, and entities,
// features and widgets add theirs (P5-31, P5-38, P5-59). The Vite builder reuses vite.config.ts (React + Tailwind
// plugins, `@` alias), so stories render with the same tokens as the app.
const config: StorybookConfig = {
  // Every slice's presentational UI (shared/ui, entities, features, widgets) keeps its stories beside it.
  stories: ['../src/**/*.stories.tsx'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: { name: '@storybook/react-vite', options: {} },
  core: { disableTelemetry: true },
  typescript: {
    // react-docgen (Babel) reads prop types and TSDoc without the TypeScript compiler API, which typescript@7 lacks.
    reactDocgen: 'react-docgen',
  },
};

export default config;
