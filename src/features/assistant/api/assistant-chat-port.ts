import { assistantStreamEventSchema } from '../model/assistant-events';

import type {
  AssistantMessageRequest,
  AssistantRating,
  AssistantStreamEvent,
} from '../model/assistant-events';
import type { AssistantCommands, SseClient } from '@/shared/api';

/** What the Yarbis panel needs from the BFF: the C-33 answer stream and C-34 feedback. */
export interface AssistantChatPort {
  /** C-33: POST the message and yield the SSE events of the answer. Aborting the signal ends the stream. */
  streamMessage(
    body: AssistantMessageRequest,
    options?: { signal?: AbortSignal },
  ): AsyncIterable<AssistantStreamEvent>;
  /** C-34: rate a finished answer by its `messageId`. */
  sendFeedback(body: { messageId: string; rating: AssistantRating }): Promise<void>;
}

export interface AssistantChatPortDeps {
  /** SSE client of the session (shared/api `createSseClient`). */
  sse: SseClient;
  /** Assistant command port of the service container (C-34 `createAssistantFeedback`). */
  commands: Pick<AssistantCommands, 'createAssistantFeedback'>;
}

/** The chat port over the SSE client (C-33) and the assistant command port (C-34). */
export function createAssistantChatPort({
  sse,
  commands,
}: AssistantChatPortDeps): AssistantChatPort {
  return {
    streamMessage: (body, options = {}) =>
      sse.post('/assistant/messages', body, {
        schema: assistantStreamEventSchema,
        ...(options.signal ? { signal: options.signal } : {}),
      }),
    sendFeedback: async (body) => {
      await commands.createAssistantFeedback(body);
    },
  };
}
