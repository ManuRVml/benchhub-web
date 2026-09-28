import { useMutation } from '@tanstack/react-query';

import { useServices } from '@/shared/api';

import type { C14Response } from '@/shared/api';

// C-14 — POST /api/v1/exports, kind `radar-png` (SCR-11 section 10 "PNG" action). Re-vendored contract (CF-REVENDOR2)
// widens `CreateExportBody.params.analysisId` to optional, so the Monitor de Valor benchmark radar (snapshot-scoped,
// not analysis-scoped, like every other V-3x view in this entity) can now go through the typed `ReportCommands.createExport`
// port instead of a raw-POST bypass.
// TODO(Nilo/BFF): flag this in the P5-54 reply — no `radar-pdf` / `radar-pptx` kind exists yet for the spec's "PDF" /
// "PPT" export buttons, only `radar-png`; those two stay disabled here until the contract adds them (the new `format`
// param on `params` might be the intended mechanism, but that's not confirmed).

export type ExportAccepted = C14Response;

/** Starts the benchmark radar PNG export (C-14); resolves with the O-01 `operationId` to poll. */
export function useExportBenchmarkRadar() {
  const { reports } = useServices();
  return useMutation({
    mutationFn: () => reports.createExport({ kind: 'radar-png', params: {} }),
  });
}
