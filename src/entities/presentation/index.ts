export {
  PRESENTATION_PREFIX,
  presentationQueryKeys,
  usePresentationDetail,
  usePresentationSlides,
  type PresentationDetail,
  type PresentationSlides,
} from './api/presentation-views';
export {
  useCreatePresentationComment,
  type PresentationCommentInput,
} from './api/use-presentation-comment';
export {
  presentationBuilderQueryKeys,
  usePresentationBuilderView,
  type BuilderChart,
  type BuilderModule,
  type PresentationBuilder,
  type PresentationTemplateId,
} from './api/use-presentation-builder-view';
export {
  presentationsListQueryKeys,
  usePresentationsView,
  type PresentationsList,
  type PresentationsListItem,
  type PresentationsViewOptions,
  type PresentationStatus,
} from './api/use-presentations-view';
export { useCreatePresentationDraft } from './api/use-create-presentation-draft';
export {
  CLOSING_KEY,
  COVER_KEY,
  flattenBuilderOrder,
  moveOrderItem,
  reorderModules,
} from './api/reorder-modules';
export {
  useUpdatePresentationBuilder,
  usePublishPresentation,
  useRemoveUploadedVersion,
  type UpdatePresentationBuilderBody,
} from './api/use-presentation-commands';
export {
  MAX_UPLOAD_BYTES,
  UPLOAD_EXTENSIONS,
  uploadPresentationVersion,
  useUploadPresentationVersion,
  validateUploadFile,
  type UploadedPresentationVersion,
  type UploadRejection,
} from './api/use-presentation-upload';
export {
  OPERATION_PREFIX,
  useOperationStatus,
  type OperationStatus,
} from './api/use-operation-status';
export { downloadMediatedFile, useMediatedDownload } from './api/use-mediated-download';

export {
  useGenerateSlideCommentDraft,
  type SlideCommentDraft,
  type GenerateSlideCommentDraftInput,
} from './api/use-slide-comment-draft';
export {
  useExportPresentation,
  type ExportAccepted,
  type PresentationExportKind,
} from './api/use-presentation-export';
export * from './ui/slide-renderer';

export { runSlideCommentBatch } from './api/slide-comment-batch';
