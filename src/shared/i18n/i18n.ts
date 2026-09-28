import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { DEFAULT_LANGUAGE, DEFAULT_NAMESPACE, NAMESPACES, resources } from './resources';

import type { i18n as I18nInstance } from 'i18next';

/**
 * The app's i18next instance: es-CO only (default and fallback), resources bundled statically, no language detector in
 * v1. Keys are dot notation with the namespace as the first segment: `t('common.nav.home')`. i18next reads the first
 * segment as a namespace because nsSeparator and keySeparator are both "." and the segment names a loaded namespace.
 */
export const i18n: I18nInstance = createInstance();

void i18n.use(initReactI18next).init({
  resources,
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: [DEFAULT_LANGUAGE],
  ns: NAMESPACES,
  defaultNS: DEFAULT_NAMESPACE,
  nsSeparator: '.',
  keySeparator: '.',
  // Resources are in memory, so initialisation completes synchronously and the first render has its copy.
  initAsync: false,
  // React already escapes rendered strings.
  interpolation: { escapeValue: false },
  returnNull: false,
});

/** Translate outside React (e.g. document.title); inside components use `useT()`. */
export const t = i18n.t.bind(i18n);
