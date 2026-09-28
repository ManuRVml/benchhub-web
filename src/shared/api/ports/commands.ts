import type { CallOptions } from './call-options';
import type {
  C01Response,
  C02Response,
  C03Response,
  C04Response,
  C05Response,
  C06Response,
  C07Response,
  C08Response,
  C09Response,
  C10Response,
  C11Response,
  C12Response,
  C13Response,
  C14Response,
  C15Response,
  C16Response,
  C17Response,
  C18Response,
  C19Response,
  C20Response,
  C21Response,
  C22Response,
  C23Response,
  C24Response,
  C25Response,
  C26Response,
  C27Response,
  C28Response,
  C29Response,
  C30Response,
  C31Response,
  C32Response,
  C33Response,
  C34Response,
  C35Response,
  C36Response,
  C38Response,
  C39Response,
  C40Response,
  C37Response,
  C41Response,
} from './responses';
import type {
  C01Request,
  C02Request,
  C03Request,
  C04Request,
  C06Request,
  C07Request,
  C08Request,
  C09Request,
  C10Request,
  C11Request,
  C12Request,
  C13Request,
  C14Request,
  C15Request,
  C16Request,
  C17Request,
  C18Request,
  C19Request,
  C21Request,
  C22Request,
  C23Request,
  C24Request,
  C25Request,
  C26Request,
  C27Request,
  C28Request,
  C29Request,
  C30Request,
  C32Request,
  C33Request,
  C34Request,
  C35Request,
  C36Request,
  C38Request,
  C39Request,
  C37Request,
  C41Request,
} from '../generated/model';

// Command ports (brief §4.3): writes grouped by domain, typed with the generated contract models. Path params come first,
// then the body. The DELETE commands of 0.1.0 (C-05, C-20, C-31) have no body.

/** SCR-07 wizard drafts. */
export interface AnalysisDraftCommands {
  /** C-01 — create a draft (optionally from an existing analysis). */
  createAnalysisDraft(body: C01Request, options?: CallOptions): Promise<C01Response>;
  /** C-02 — autosave the fields of a wizard step. */
  updateAnalysisDraft(
    draftId: string,
    body: C02Request,
    options?: CallOptions,
  ): Promise<C02Response>;
  /** C-03 — generate the analysis from a valid draft. */
  generateAnalysis(draftId: string, body: C03Request, options?: CallOptions): Promise<C03Response>;
}

/** SCR-08 data edits of an analysis. */
export interface AnalysisEditCommands {
  /** C-04 — add a company to the analysis set. */
  addAnalysisCompany(
    analysisId: string,
    body: C04Request,
    options?: CallOptions,
  ): Promise<C04Response>;
  /** C-05 — remove a company from the analysis set. */
  removeAnalysisCompany(
    analysisId: string,
    companyId: string,
    options?: CallOptions,
  ): Promise<C05Response>;
  /** C-06 — batch value overrides. */
  updateValueOverrides(
    analysisId: string,
    body: C06Request,
    options?: CallOptions,
  ): Promise<C06Response>;
  /** C-07 — batch weight overrides. */
  updateWeightOverrides(
    analysisId: string,
    body: C07Request,
    options?: CallOptions,
  ): Promise<C07Response>;
  /** C-08 — start a recalculation (analysis or monitor). */
  createRecalculation(body: C08Request, options?: CallOptions): Promise<C08Response>;
  /** C-09 — publish an analysis and its products. */
  publishAnalysis(body: C09Request, options?: CallOptions): Promise<C09Response>;
}

/** Review comments and change requests. */
export interface ReviewCommands {
  /** C-10 — create a review comment. */
  createReviewComment(body: C10Request, options?: CallOptions): Promise<C10Response>;
  /** C-11 — change the status of a review comment. */
  updateReviewComment(
    commentId: string,
    body: C11Request,
    options?: CallOptions,
  ): Promise<C11Response>;
  /** C-12 — create a change request. */
  createChangeRequest(body: C12Request, options?: CallOptions): Promise<C12Response>;
  /** C-13 — decide a change request. */
  updateChangeRequest(
    requestId: string,
    body: C13Request,
    options?: CallOptions,
  ): Promise<C13Response>;
}

/** Exports and generated narratives. */
export interface ReportCommands {
  /** C-14 — start an export (PPTX / PDF / XLSX…). */
  createExport(body: C14Request, options?: CallOptions): Promise<C14Response>;
  /** C-15 — generate the executive narrative (AI suggestion). */
  generateExecutiveNarrative(body: C15Request, options?: CallOptions): Promise<C15Response>;
}

/** SCR-11 Monitor de Valor. */
export interface ValueMonitorCommands {
  /** C-16 — update the targets of a KVI. */
  updateKviTargets(kviId: string, body: C16Request, options?: CallOptions): Promise<C16Response>;
  /** C-17 — update the monitor configuration. */
  updateValueMonitorConfiguration(body: C17Request, options?: CallOptions): Promise<C17Response>;
  /** C-18 — add indicators to the monitor. */
  addValueMonitorKvis(body: C18Request, options?: CallOptions): Promise<C18Response>;
}

/** Saved views of filterable screens. */
export interface SavedViewCommands {
  /** C-19 — save the current view state. */
  createSavedView(body: C19Request, options?: CallOptions): Promise<C19Response>;
  /** C-20 — delete a saved view. */
  deleteSavedView(viewId: string, options?: CallOptions): Promise<C20Response>;
}

/** SCR-12 Sensibilidades. */
export interface SensitivityCommands {
  /** C-21 — evaluate lever changes. */
  evaluateSensitivity(body: C21Request, options?: CallOptions): Promise<C21Response>;
  /** C-22 — validate an AI lever suggestion. */
  validateSensitivitySuggestion(
    suggestionId: string,
    body: C22Request,
    options?: CallOptions,
  ): Promise<C22Response>;
  /** C-23 — save a simulation. */
  createSensitivitySimulation(body: C23Request, options?: CallOptions): Promise<C23Response>;
  /** C-24 — evaluate a weight simulation. */
  evaluateWeightSimulation(body: C24Request, options?: CallOptions): Promise<C24Response>;
  /** C-25 — create the strategic plan. */
  createStrategicPlan(body: C25Request, options?: CallOptions): Promise<C25Response>;
  /** C-26 — update the strategic plan. */
  updateStrategicPlan(
    planId: string,
    body: C26Request,
    options?: CallOptions,
  ): Promise<C26Response>;
}

/** SCR-13 / SCR-14 presentations. */
export interface PresentationCommands {
  /** C-27 — create a presentation draft. */
  createPresentation(body: C27Request, options?: CallOptions): Promise<C27Response>;
  /** C-28 — autosave the builder. */
  updatePresentation(
    presentationId: string,
    body: C28Request,
    options?: CallOptions,
  ): Promise<C28Response>;
  /** C-29 — publish a presentation. */
  publishPresentation(
    presentationId: string,
    body: C29Request,
    options?: CallOptions,
  ): Promise<C29Response>;
  /** C-30 — register an uploaded PPT version (the file itself travels as multipart). */
  uploadPresentationVersion(
    presentationId: string,
    body: C30Request,
    options?: CallOptions,
  ): Promise<C30Response>;
  /** C-31 — remove the uploaded version. */
  deletePresentationVersion(presentationId: string, options?: CallOptions): Promise<C31Response>;
  /** C-32 — draft a slide comment with the assistant. */
  createSlideCommentDraft(body: C32Request, options?: CallOptions): Promise<C32Response>;
}

/** Yarbis assistant panel. */
export interface AssistantCommands {
  /** C-33 — send a message to the assistant. */
  sendAssistantMessage(body: C33Request, options?: CallOptions): Promise<C33Response>;
  /** C-34 — rate an assistant answer. */
  createAssistantFeedback(body: C34Request, options?: CallOptions): Promise<C34Response>;
}

/** SCR-15 notifications. */
export interface NotificationCommands {
  /** C-35 — mark one notification as read. */
  markNotificationRead(
    notificationId: string,
    body: C35Request,
    options?: CallOptions,
  ): Promise<C35Response>;
  /** C-36 — mark every notification as read. */
  markAllNotificationsRead(body: C36Request, options?: CallOptions): Promise<C36Response>;
}

/** SCR-08b comparison profiles: create, edit and delete a saved profile. */
export interface ComparisonProfileCommands {
  /** C-38 — save a new comparison profile. */
  createComparisonProfile(
    analysisId: string,
    body: C38Request,
    options?: CallOptions,
  ): Promise<C38Response>;
  /** C-39 — update a comparison profile. */
  updateComparisonProfile(
    analysisId: string,
    profileId: string,
    body: C39Request,
    options?: CallOptions,
  ): Promise<C39Response>;
  /** C-40 — delete a comparison profile (no body). */
  deleteComparisonProfile(
    analysisId: string,
    profileId: string,
    options?: CallOptions,
  ): Promise<C40Response>;
}

/** SCR-16 settings. */
export interface SettingsCommands {
  /** C-37 — update the edited settings fields (all optional; only the changed ones are sent). */
  updateUserSettings(body: C37Request, options?: CallOptions): Promise<C37Response>;
}

/** Presentation preview invitations (SCR-14, "not started" — no consumer built yet, ported for completeness only). */
export interface PreviewInvitationCommands {
  /** C-41 — invite reviewers to preview an analysis's presentations. */
  createPreviewInvitations(
    analysisId: string,
    body: C41Request,
    options?: CallOptions,
  ): Promise<C41Response>;
}
