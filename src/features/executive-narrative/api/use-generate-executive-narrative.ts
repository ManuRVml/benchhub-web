import { useMutation } from '@tanstack/react-query';

import { useServices } from '@/shared/api';

import type { C15Response } from '@/shared/api';

// C-15 — one executive-narrative suggestion for a Resultados (SCR-08) section. `scope` is always `'results'` here:
// the Monitor de Valor variant (OVL-09, `scope: 'value-monitor'`) is a separate trigger this feature does not build.

export type ExecutiveNarrativeSection = 'overview' | 'performance' | 'trends' | 'recommendations';

export interface GenerateExecutiveNarrativeInput {
  analysisId: string;
  section: ExecutiveNarrativeSection;
}

/** The one narrative text C-15 returns for the requested section, or `undefined` if the response carries none. */
export function narrativeTextOf(response: C15Response): string | undefined {
  return response.sections[0]?.text;
}

/** Wraps C-15 as a mutation (never a query): the caller decides exactly when to fire it — once per modal open. */
export function useGenerateExecutiveNarrative() {
  const { reports } = useServices();
  return useMutation({
    mutationFn: ({ analysisId, section }: GenerateExecutiveNarrativeInput) =>
      reports.generateExecutiveNarrative({ scope: 'results', section, analysisId }),
  });
}
