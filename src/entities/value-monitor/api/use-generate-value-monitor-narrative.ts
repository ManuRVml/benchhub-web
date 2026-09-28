import { useMutation } from '@tanstack/react-query';

import { useServices } from '@/shared/api';

import type { C15Response } from '@/shared/api';

// C-15 OVL-09 "Narrativa ejecutiva": Nilo's answer (CF-REVENDOR2) keeps `section` a single required enum even for
// `scope: 'value-monitor'` -- there is no one-call-returns-all-4-sections mode. The Monitor de Valor narrative pill
// still needs its 4 fixed sections in one open, so the web client batches 4 typed `generateExecutiveNarrative` calls
// (one per section, `scope: 'value-monitor'`, no `analysisId`, per docs/design/view-data-contracts/C-15-generate-
// executive-narrative.md) and assembles their `sections[0]` into one 4-item array, matching the modal's expected
// `{sections, status, generatedBy}` shape (status/generatedBy taken from the first response).

export type ValueMonitorNarrative = C15Response;

/** Generates the Monitor de Valor executive narrative: 4 client-batched C-15 calls, one per fixed section. */
export function useGenerateValueMonitorNarrative() {
  const { reports } = useServices();
  return useMutation({
    mutationFn: async (): Promise<ValueMonitorNarrative> => {
      const [overview, performance, trends, recommendations] = await Promise.all([
        reports.generateExecutiveNarrative({ scope: 'value-monitor', section: 'overview' }),
        reports.generateExecutiveNarrative({ scope: 'value-monitor', section: 'performance' }),
        reports.generateExecutiveNarrative({ scope: 'value-monitor', section: 'trends' }),
        reports.generateExecutiveNarrative({ scope: 'value-monitor', section: 'recommendations' }),
      ]);
      return {
        sections: [
          ...overview.sections,
          ...performance.sections,
          ...trends.sections,
          ...recommendations.sections,
        ],
        status: overview.status,
        generatedBy: overview.generatedBy,
      };
    },
  });
}
