import { useMutation } from '@tanstack/react-query';

import { useServices } from '@/shared/api';

import type { ApiPorts } from '@/shared/api';

// O-03 GET /api/v1/files/:fileId/download?disposition=attachment — the ONLY way a file (an export, an uploaded PPT) is
// ever downloaded (brief §4.1 rule 12): never a raw storage URL. Through the typed port (P7-PORTS-PRES); the port
// returns the raw `Blob` (its generated response schema is the `ApiError` shape, not a file schema — ports/operations.ts).

/**
 * Fetches a file through O-03 and saves it as `fileName` (a temporary object-URL anchor: the browser download, not a
 * navigation, so the calling page never leaves).
 */
export async function downloadMediatedFile(
  services: Pick<ApiPorts, 'operations'>,
  fileId: string,
  fileName: string,
): Promise<void> {
  const blob = await services.operations.downloadFile(fileId);
  const objectUrl = URL.createObjectURL(blob);
  try {
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fileName;
    link.click();
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/** `useMutation` wrapper of `downloadMediatedFile`, for its pending / error state in the download UI. */
export function useMediatedDownload() {
  const services = useServices();
  return useMutation({
    mutationFn: ({ fileId, fileName }: { fileId: string; fileName: string }) =>
      downloadMediatedFile(services, fileId, fileName),
  });
}
