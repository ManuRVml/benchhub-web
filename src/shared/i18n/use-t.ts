import { useTranslation } from 'react-i18next';

import { NAMESPACES } from './resources';

/** Typed translate function for components: every namespace is available, keys autocomplete as "<ns>.<key.path>". */
export function useT() {
  return useTranslation(NAMESPACES).t;
}
