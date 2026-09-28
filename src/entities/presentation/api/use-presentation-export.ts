import { useMutation } from '@tanstack/react-query';

import { useServices } from '@/shared/api';

import type { C14Response } from '@/shared/api/ports/responses';

/** Presentation export kinds for C-14. */
export type PresentationExportKind = 'presentation-pptx' | 'presentation-pdf';

/** C-14 response type (operation accepted). */
export type ExportAccepted = C14Response;

/** Starts a presentation export (C-14); resolves with the O-01 `operationId` to poll. */
export function useExportPresentation(presentationId: string) {
  const { reports } = useServices();
  return useMutation({
    mutationFn: (kind: PresentationExportKind): Promise<C14Response> =>
      reports.createExport({ kind, params: { presentationId } }),
  });
}
