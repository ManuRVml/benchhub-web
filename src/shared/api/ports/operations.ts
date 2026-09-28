import type { CallOptions, DownloadFileOptions } from './call-options';
import type { O01Response } from './responses';

// Long-running job infrastructure (brief §4.1 rule 12: files are never fetched by a raw storage URL). O-02 is streamed
// by the shared SSE client because it is a GET text/event-stream rather than a JSON request/response port method.

/** O-01 / O-03: polling a long-running job and downloading its result file. */
export interface OperationsPort {
  /** O-01 — status of a job started by a 202 command (e.g. C-14 export). */
  getOperationStatus(operationId: string, options?: CallOptions): Promise<O01Response>;
  /**
   * O-03 — the only way a file (an export, an uploaded PPT) is ever downloaded. Its generated response schema
   * (`DownloadFileResponse`) is the `ApiError` shape (the vendored contract only documents the error body; a real 200
   * is the file's bytes, not JSON), so this returns the raw `Blob` instead of a schema-validated type.
   */
  downloadFile(fileId: string, options?: DownloadFileOptions): Promise<Blob>;
}
