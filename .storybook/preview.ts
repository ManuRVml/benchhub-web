import type { Preview } from '@storybook/react-vite';

// Same global stylesheet as the app: Tailwind + generated token theme + self-hosted Roboto fonts.
import '../src/app/styles/global.css';

const preview: Preview = {
  parameters: {
    controls: { expanded: true },
    // Accessibility checks (addon-a11y / axe) fail the story in the test runner instead of only warning.
    a11y: { test: 'error' },
  },
  tags: ['autodocs'],
};

export default preview;
