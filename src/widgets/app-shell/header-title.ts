import { useMatches } from 'react-router';

import { useT } from '@/shared/i18n';

import type { RouteKey } from '@/shared/config';

type TitleKey =
  | 'home'
  | 'analyses'
  | 'analysisDefinition'
  | 'analysisResults'
  | 'analysisReport'
  | 'indicatorDetail'
  | 'sensitivities'
  | 'valueMonitor'
  | 'presentations'
  | 'notifications'
  | 'settings';

/**
 * Header title per route (SCR-04 title map, HTML L5156): route id → `common.headerTitle.*`. Routes without an entry
 * (403, 404) fall back to "BencHUD" (HTML L5182).
 */
export const HEADER_TITLE_KEYS: Readonly<Partial<Record<RouteKey, TitleKey>>> = {
  home: 'home',
  analyses: 'analyses',
  analysisDefinition: 'analysisDefinition',
  analysisResults: 'analysisResults',
  analysisReport: 'analysisReport',
  indicatorDetail: 'indicatorDetail',
  sensitivities: 'sensitivities',
  valueMonitor: 'valueMonitor',
  presentations: 'presentations',
  presentationNew: 'presentations',
  presentationEdit: 'presentations',
  analysisPresentations: 'presentations',
  presentationDetail: 'presentations',
  notifications: 'notifications',
  settings: 'settings',
};

const isTitledRoute = (id: string): id is keyof typeof HEADER_TITLE_KEYS => id in HEADER_TITLE_KEYS;

/**
 * Title of the current screen from the deepest matched route (route ids are the route-table keys). Resultados reads
 * "Resultados · {analysisName}"; without the name (not loaded yet) it is the plain "Resultados".
 */
export function useHeaderTitle(analysisName?: string): string {
  const t = useT();
  const match = [...useMatches()].reverse().find((candidate) => isTitledRoute(candidate.id));
  const key = match && isTitledRoute(match.id) ? HEADER_TITLE_KEYS[match.id] : undefined;
  switch (key) {
    case undefined:
      return t('common.headerTitle.fallback');
    case 'analysisResults':
      return analysisName
        ? t('common.headerTitle.analysisResults', { analysisName })
        : t('common.analysisTabs.results');
    default:
      return t(`common.headerTitle.${key}`);
  }
}
