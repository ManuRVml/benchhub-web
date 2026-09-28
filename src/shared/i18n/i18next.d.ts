import type { DEFAULT_NAMESPACE, Resources } from './resources';

// Types every `t()` key against the bundled es-CO resources, so a missing key is a type error and editors autocomplete
// "<namespace>.<key.path>".
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof DEFAULT_NAMESPACE;
    nsSeparator: '.';
    keySeparator: '.';
    resources: Resources;
  }
}
