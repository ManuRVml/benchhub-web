import { z } from 'zod';

import {
  GetAdminHomeViewResponse,
  GetCommentThreadViewResponse,
  GetPresentationBuilderViewResponse,
  GetResultsHeaderViewResponse,
} from '../generated/zod';

// Response schemas the web reads with, where they intentionally differ from the generated contract schema. The
// generated schemas stay untouched; the HTTP adapter validates with these.

/**
 * V-26 as the web reads it: `permissions` narrowed from the generated `Record<string, boolean>` to the 4 keys every
 * comment-thread consumer (report-comments, indicator detail, Monitor de Valor comments) already reads directly —
 * under `noUncheckedIndexedAccess`, the generic record types each access as `boolean | undefined`, which does not
 * assign to the `boolean` props these widgets pass on (P7-PORTS-C).
 */
export const CommentThreadViewSchema = GetCommentThreadViewResponse.extend({
  permissions: z.object({
    canComment: z.boolean(),
    canReply: z.boolean(),
    canRequestChange: z.boolean(),
    canResolve: z.boolean(),
  }),
});

const GeneratedAdminCard = GetAdminHomeViewResponse.shape.cards.element;

/**
 * V-02 as the web reads it: `cards[].id` is any non-empty string instead of the generated (closed) enum, the same
 * reasoning as `ResultsHeaderViewSchema` below: a back-office module the BFF adds ahead of the web's contract must not
 * fail the whole SCR-03 page. The page renders the ids it knows and skips the rest.
 */
export const AdminHomeViewSchema = GetAdminHomeViewResponse.extend({
  cards: z.array(GeneratedAdminCard.extend({ id: z.string().min(1) })),
});

/** Card ids of contract 0.1.0 (the generated enum): the ids SCR-03 has copy for. */
export type KnownAdminCardId = z.output<typeof GeneratedAdminCard>['id'];

const GeneratedModule = GetResultsHeaderViewResponse.shape.modules.element;

/**
 * V-09 as the web reads it: `modules[].id` is any non-empty string instead of the generated enum, so a module the BFF
 * adds before the web's contract knows it reaches the SCR-08 module registry, which skips it and reports it once,
 * instead of failing the whole frame (P5-40b). Every other member keeps the generated (strict) validation.
 */
export const ResultsHeaderViewSchema = GetResultsHeaderViewResponse.extend({
  modules: z.array(GeneratedModule.extend({ id: z.string().min(1) })),
});

/** Module ids of contract 0.1.0 (the generated enum): the ids the registry can know. */
export type KnownResultsModuleId = z.output<typeof GeneratedModule>['id'];

/**
 * A-03 (logout) success: `204 No Content`, no body (docs/design/view-data-contracts/A-03-auth-logout.md). The
 * generated `LogoutResponse` only documents the 403 `CSRF_INVALID` error shape (parsed separately, by
 * `apiErrorBodySchema`) — this is what the HTTP adapter validates the real 200-range response against.
 */
export const LogoutSuccessSchema = z.void();

/**
 * V-41 as the web reads it: `modules[].id` is any non-empty string instead of the generated (closed) enum, the same
 * reasoning as `ResultsHeaderViewSchema` above — a builder module the BFF adds ahead of the web's contract should not
 * fail the whole builder frame.
 */
export const PresentationBuilderViewSchema = GetPresentationBuilderViewResponse.extend({
  modules: z.array(
    GetPresentationBuilderViewResponse.shape.modules.element.extend({ id: z.string().min(1) }),
  ),
});
