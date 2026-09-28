import type { DevtoolsOptions } from 'zustand/middleware';

/**
 * Redux DevTools options for a Zustand store (ADR-0005): connected only in development builds, where the extension
 * shows the store as `eco/<name>`. Production bundles never connect, whether or not the extension is installed.
 */
export const storeDevtools = (name: string): DevtoolsOptions => ({
  name: `eco/${name}`,
  enabled: import.meta.env.DEV,
});
