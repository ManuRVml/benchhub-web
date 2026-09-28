import { useMutation } from '@tanstack/react-query';

import { useServices } from '@/shared/api';

// C-14 IS vendored and its `kind` enum already has `strategic-plan` (unlike the presentation export, which needed a
// bypass because its analysisId was never at hand — here the sensitivities screen already resolves one, the same
// session-default fallback P5-57 used for presentations). This starts the export (202 `operationId`); polling it to
// completion and the mediated download itself (OVL-07b's progress modal, `useOperationStatus` /
// `useMediatedDownload`) is a bigger subsystem than "Descargar calls its handler" needs here — a natural follow-up
// once OVL-03 gets its own progress UI.

/** C-14 — starts a strategic-plan export ("Descargar", OVL-03). */
export function useExportStrategicPlan() {
  const { reports } = useServices();
  return useMutation({
    mutationFn: (analysisId: string) =>
      reports.createExport({ kind: 'strategic-plan', params: { analysisId } }),
  });
}
