import { SendAssistantMessageBody, SendAssistantMessageResponse } from '@/shared/api';

import type { z } from 'zod';

// C-33 as contract 0.2.0 publishes it (CF-111 / CF-112): the generated request body and the SSE event union, re-exported
// under the names the assistant feature already uses.

/** CF-112: the 12 in-shell screens the Yarbis panel can be opened on (C-33 `context.screen`). */
export const assistantScreenSchema = SendAssistantMessageBody.shape.context.shape.screen;

export type AssistantScreen = z.infer<typeof assistantScreenSchema>;

/** C-33 request body. */
export const assistantMessageRequestSchema = SendAssistantMessageBody;

export type AssistantMessageRequest = z.infer<typeof assistantMessageRequestSchema>;

/**
 * One C-33 SSE event, a union on `type` (CF-111): `token` / `citation` carry `content`, `done` the `messageId` that C-34
 * rates, `error` an `errorCode` such as ASSISTANT_UNAVAILABLE.
 */
export const assistantStreamEventSchema = SendAssistantMessageResponse;

export type AssistantStreamEvent = z.infer<typeof assistantStreamEventSchema>;

export type AssistantRating = 'up' | 'down';
