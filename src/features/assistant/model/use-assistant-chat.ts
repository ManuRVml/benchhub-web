import { useCallback, useEffect, useRef, useState } from 'react';

import type { AssistantRating, AssistantScreen } from './assistant-events';
import type { AssistantChatPort } from '../api/assistant-chat-port';

export type ChatMessageRole = 'user' | 'assistant' | 'tip';
/** `streaming` while C-33 tokens arrive, `done` after its `done` event, `error` after an error event or a failure. */
export type ChatMessageStatus = 'streaming' | 'done' | 'error';

export interface ChatMessage {
  /** Local id of the bubble (list key). */
  id: string;
  role: ChatMessageRole;
  text: string;
  status: ChatMessageStatus;
  /** Citation references of an answer (C-33 `citation` events). */
  citations: readonly string[];
  /** BFF id of a finished answer (C-33 `done`); feedback is possible only once it is known. */
  messageId?: string;
  /** Error code of a failed answer: the event's `errorCode`, or the ApiError code of a failed request. */
  errorCode?: string;
  /** The user's rating of the answer (C-34), once sent. */
  rating?: AssistantRating;
  /** Question an answer replies to; a retry sends it again. */
  prompt?: string;
}

export interface UseAssistantChatOptions {
  port: AssistantChatPort;
  /** Screen the panel is open on (C-33 `context.screen`). */
  screen: AssistantScreen;
  /** Analysis in context, when the screen belongs to one. */
  analysisId?: string;
}

export interface AssistantChat {
  messages: readonly ChatMessage[];
  /** An answer is streaming; the composer and the chips wait. */
  busy: boolean;
  /** Sends a question; blank text is ignored (HTML L3632–3633). */
  send: (text: string) => void;
  /** Sends the question of a failed answer again, replacing its error bubble. */
  retry: (id: string) => void;
  /** C-34 feedback on a finished answer; one rating per answer. */
  rate: (id: string, rating: AssistantRating) => void;
  /** Appends a proactive tip bubble (the caller decides when: once per screen per session). */
  addTip: (text: string) => void;
}

const errorCodeOf = (error: unknown): string =>
  typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string'
    ? error.code
    : 'ASSISTANT_UNAVAILABLE';

/**
 * Chat state of the Yarbis panel over the C-33 stream: tokens are appended to the answer as they arrive, citations
 * collected, `done` stores the `messageId` (enabling C-34 feedback), an error event or a failed request turns the
 * answer into an error bubble that can be retried. Unmounting aborts the stream in flight.
 */
export function useAssistantChat({
  port,
  screen,
  analysisId,
}: UseAssistantChatOptions): AssistantChat {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const nextId = useRef(0);
  const controller = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      controller.current?.abort();
    },
    [],
  );

  const newId = () => {
    nextId.current += 1;
    return `msg-${String(nextId.current)}`;
  };

  const update = (id: string, patch: (message: ChatMessage) => ChatMessage) => {
    setMessages((current) =>
      current.map((message) => (message.id === id ? patch(message) : message)),
    );
  };

  const stream = useCallback(
    async (answerId: string, prompt: string) => {
      const abort = new AbortController();
      controller.current = abort;
      setBusy(true);
      try {
        const events = port.streamMessage(
          {
            message: prompt,
            context: { screen, ...(analysisId === undefined ? {} : { analysisId }) },
          },
          { signal: abort.signal },
        );
        for await (const event of events) {
          switch (event.type) {
            case 'token':
              update(answerId, (message) => ({ ...message, text: message.text + event.content }));
              break;
            case 'citation':
              update(answerId, (message) => ({
                ...message,
                citations: [...message.citations, event.content],
              }));
              break;
            case 'done':
              update(answerId, (message) => ({
                ...message,
                status: 'done',
                messageId: event.messageId,
              }));
              break;
            case 'error':
              update(answerId, (message) => ({
                ...message,
                status: 'error',
                errorCode: event.errorCode,
              }));
              break;
          }
        }
        // A stream that ends without `done` or `error` leaves no id to rate: treat it as a failed answer.
        update(answerId, (message) =>
          message.status === 'streaming'
            ? { ...message, status: 'error', errorCode: 'STREAM_INCOMPLETE' }
            : message,
        );
      } catch (error) {
        if (abort.signal.aborted) return;
        update(answerId, (message) => ({
          ...message,
          status: 'error',
          errorCode: errorCodeOf(error),
        }));
      } finally {
        if (controller.current === abort) {
          controller.current = null;
          setBusy(false);
        }
      }
    },
    [analysisId, port, screen],
  );

  const send = useCallback(
    (text: string) => {
      const prompt = text.trim();
      if (prompt === '' || controller.current) return;
      const answerId = newId();
      setMessages((current) => [
        ...current,
        { id: newId(), role: 'user', text: prompt, status: 'done', citations: [] },
        { id: answerId, role: 'assistant', text: '', status: 'streaming', citations: [], prompt },
      ]);
      void stream(answerId, prompt);
    },
    [stream],
  );

  const retry = useCallback(
    (id: string) => {
      if (controller.current) return;
      const failed = messages.find((message) => message.id === id);
      if (failed?.status !== 'error' || failed.prompt === undefined) return;
      const { prompt } = failed;
      update(id, (message) => ({
        id: message.id,
        role: message.role,
        text: '',
        status: 'streaming',
        citations: [],
        prompt,
      }));
      void stream(id, prompt);
    },
    [messages, stream],
  );

  const rate = useCallback(
    (id: string, rating: AssistantRating) => {
      const answer = messages.find((message) => message.id === id);
      if (answer?.messageId === undefined || answer.rating !== undefined) return;
      const { messageId } = answer;
      update(id, (message) => ({ ...message, rating }));
      port.sendFeedback({ messageId, rating }).catch(() => {
        // The rating did not reach the BFF: clear it so the user can try again.
        update(id, ({ rating: _rating, ...message }) => message);
      });
    },
    [messages, port],
  );

  const addTip = useCallback((text: string) => {
    setMessages((current) => [
      ...current,
      { id: newId(), role: 'tip', text, status: 'done', citations: [] },
    ]);
  }, []);

  return { messages, busy, send, retry, rate, addTip };
}
