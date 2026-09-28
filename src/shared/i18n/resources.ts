import accessGate from './locales/es-CO/access-gate.json';
import admin from './locales/es-CO/admin.json';
import analyses from './locales/es-CO/analyses.json';
import analysisDefinition from './locales/es-CO/analysis-definition.json';
import analysisReport from './locales/es-CO/analysis-report.json';
import analysisResults from './locales/es-CO/analysis-results.json';
import common from './locales/es-CO/common.json';
import forbidden from './locales/es-CO/forbidden.json';
import home from './locales/es-CO/home.json';
import indicatorDetail from './locales/es-CO/indicator-detail.json';
import login from './locales/es-CO/login.json';
import notFound from './locales/es-CO/not-found.json';
import notifications from './locales/es-CO/notifications.json';
import presentationDetail from './locales/es-CO/presentation-detail.json';
import presentations from './locales/es-CO/presentations.json';
import sensitivities from './locales/es-CO/sensitivities.json';
import settings from './locales/es-CO/settings.json';
import valueMonitor from './locales/es-CO/value-monitor.json';

/** The only locale of v1 (brief §2.4); also the fallback. */
export const DEFAULT_LANGUAGE = 'es-CO';

/** Shell and cross-screen copy. Keys without a namespace prefix resolve here. */
export const DEFAULT_NAMESPACE = 'common';

/**
 * Bundled statically: one namespace for shared copy plus one per page slice of `src/pages/` (synthesis §7, P5 tasks).
 * Namespace names equal the page slice folder names.
 */
export const resources = {
  [DEFAULT_LANGUAGE]: {
    common,
    login,
    'access-gate': accessGate,
    admin,
    home,
    analyses,
    'analysis-definition': analysisDefinition,
    'analysis-results': analysisResults,
    'analysis-report': analysisReport,
    'indicator-detail': indicatorDetail,
    'value-monitor': valueMonitor,
    sensitivities,
    presentations,
    'presentation-detail': presentationDetail,
    notifications,
    settings,
    forbidden,
    'not-found': notFound,
  },
} as const;

export type Resources = (typeof resources)[typeof DEFAULT_LANGUAGE];
export type Namespace = keyof Resources;

export const NAMESPACES = Object.keys(resources[DEFAULT_LANGUAGE]) as Namespace[];
