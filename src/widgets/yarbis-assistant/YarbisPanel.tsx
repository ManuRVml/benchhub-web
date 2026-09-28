import { useEffect, useId, useRef, useState } from 'react';

import { useT } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { Button } from '@/shared/ui/primitives/button';
import { Chip } from '@/shared/ui/primitives/chip';
import { IconButton } from '@/shared/ui/primitives/icon-button';
import { Textarea } from '@/shared/ui/primitives/inputs';

import { ThumbsDownGlyph, ThumbsUpGlyph } from './feedback-glyphs';
import { yarbisTestIds } from './test-ids';

import type { AssistantRating, ChatMessage } from '@/features/assistant';

export interface YarbisPanelProps {
  /** DOM id of the panel (the FAB's `aria-controls`). */
  id: string;
  /** Title of the current screen, already translated (header "✦ Yarbis · {screenTitle}"). */
  screenTitle: string;
  messages: readonly ChatMessage[];
  /** Suggestion chips of the screen (V-46); the row is hidden when empty (HTML L3196). */
  suggestions: readonly string[];
  /** V-46 state of the tip and chips: loading, arrived, or failed (error bubble with retry; the chat stays usable). */
  contextStatus?: 'loading' | 'ready' | 'error';
  /** Retry button of the V-46 error bubble. */
  onRetryContext?: () => void;
  /** An answer is streaming: sending waits for it. */
  busy: boolean;
  onSend: (text: string) => void;
  onRetry: (id: string) => void;
  onRate: (id: string, rating: AssistantRating) => void;
  /** Esc or "✕"; the owner returns the focus to the FAB. */
  onClose: () => void;
}

const BUBBLE_CLASS: Record<ChatMessage['role'], string> = {
  // AI bubbles `surface.page` (#F5F6F7), user bubbles `brand.primary.subtle` (#EDE9FE), SCR-04 HTML L3183–3195.
  assistant: 'self-start bg-surface-page text-text-body',
  tip: 'self-start bg-surface-page text-text-body',
  user: 'self-end bg-brand-primary-subtle text-text-heading',
};

function MessageBubble({
  message,
  onRetry,
  onRate,
}: {
  message: ChatMessage;
  onRetry: (id: string) => void;
  onRate: (id: string, rating: AssistantRating) => void;
}) {
  const t = useT();
  const answer = message.role === 'assistant';
  const rated = message.rating !== undefined;
  const canRate = answer && message.status === 'done' && message.messageId !== undefined;

  return (
    <li
      data-testid={yarbisTestIds.message(message.id)}
      data-role={message.role}
      data-status={message.status}
      {...(message.messageId === undefined ? {} : { 'data-message-id': message.messageId })}
      className={cn(
        'flex max-w-4/5 flex-col gap-6 rounded-md px-12 py-8 text-small',
        BUBBLE_CLASS[message.role],
      )}
    >
      {message.status === 'error' ? (
        <>
          <p className="text-status-danger-text">{t('common.assistantChat.error')}</p>
          <Button
            size="sm"
            variant="outline"
            className="self-start"
            onClick={() => {
              onRetry(message.id);
            }}
          >
            {t('common.assistantChat.retry')}
          </Button>
        </>
      ) : (
        <p className="whitespace-pre-wrap">
          {message.text === '' && message.status === 'streaming'
            ? t('common.assistantChat.thinking')
            : message.text}
        </p>
      )}
      {message.citations.length > 0 ? (
        <ul
          aria-label={t('common.a11y.citations')}
          className="flex flex-col gap-2 text-label text-text-secondary"
        >
          {message.citations.map((citation) => (
            <li key={citation}>{citation}</li>
          ))}
        </ul>
      ) : null}
      {canRate ? (
        <div className="flex gap-4">
          <IconButton
            size="sm"
            variant="ghost"
            icon={ThumbsUpGlyph}
            // Selected feedback: success / danger fills of the prototype (HTML L3189–3190).
            className="aria-pressed:bg-status-success-bg"
            aria-label={t('common.a11y.helpful')}
            aria-pressed={message.rating === 'up'}
            // aria-disabled, not disabled: the focus stays on the button the user just pressed.
            aria-disabled={rated}
            testId={`${yarbisTestIds.message(message.id)}-up`}
            onClick={() => {
              if (!rated) onRate(message.id, 'up');
            }}
          />
          <IconButton
            size="sm"
            variant="ghost"
            icon={ThumbsDownGlyph}
            className="aria-pressed:bg-status-danger-bg"
            aria-label={t('common.a11y.notHelpful')}
            aria-pressed={message.rating === 'down'}
            aria-disabled={rated}
            testId={`${yarbisTestIds.message(message.id)}-down`}
            onClick={() => {
              if (!rated) onRate(message.id, 'down');
            }}
          />
        </div>
      ) : null}
    </li>
  );
}

/**
 * Yarbis chat panel (SCR-04 OVL-14, HTML L3180–3207, `Cmp:YarbisChatPanel`): a non-modal dialog 320px wide above the
 * FAB on `z.chat`, radius 14. Header "✦ Yarbis · {screenTitle}" on `ai.accent` (text in `text.heading`: white is
 * 2.2:1 there), the conversation as an `aria-live` log (streamed tokens are announced as they arrive), the screen's
 * suggestion chips, and the composer (Enter sends, Shift+Enter breaks the line). The composer takes the focus on open;
 * Esc closes the panel.
 */
export function YarbisPanel({
  id,
  screenTitle,
  messages,
  suggestions,
  contextStatus = 'ready',
  onRetryContext,
  busy,
  onSend,
  onRetry,
  onRate,
  onClose,
}: YarbisPanelProps) {
  const t = useT();
  const titleId = useId();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Keep the newest message in view while answers stream in.
  const lastText = messages.at(-1)?.text;
  useEffect(() => {
    const log = logRef.current;
    if (log && typeof log.scrollTo === 'function') log.scrollTo({ top: log.scrollHeight });
  }, [messages.length, lastText]);

  // Sending disables the button or chip that was used, so the focus goes back to the composer instead of the page.
  const send = (text: string) => {
    onSend(text);
    inputRef.current?.focus();
  };

  const submit = () => {
    if (busy || draft.trim() === '') return;
    send(draft);
    setDraft('');
  };

  // The log scrolls on its own (max 300px), so it is a tab stop for keyboard scrolling (axe
  // scrollable-region-focusable). Spread: jsx-a11y/no-noninteractive-tabindex does not know the log pattern.
  const logFocus = { tabIndex: 0 };

  // Esc closes the panel while the focus is inside it (a document listener: the dialog itself is not interactive).
  const panelRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (!(event.target instanceof Node) || !panelRef.current?.contains(event.target)) return;
      event.stopPropagation();
      onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  return (
    <section
      id={id}
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      ref={panelRef}
      data-testid={yarbisTestIds.panel}
      className="fixed right-28 bottom-23.5 z-(--z-chat) flex w-80 flex-col overflow-hidden rounded-modal border border-border-default bg-surface-card shadow-chat"
    >
      <header className="flex items-center justify-between gap-8 bg-ai-accent px-16 py-10">
        <h2 id={titleId} className="text-body-strong text-text-heading">
          {t('common.assistant.panelTitle', { screenTitle })}
        </h2>
        <button
          type="button"
          aria-label={t('common.a11y.closeAssistant')}
          onClick={onClose}
          className="cursor-pointer rounded-control px-4 text-text-heading focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
        >
          ✕
        </button>
      </header>
      <div
        ref={logRef}
        role="log"
        aria-label={t('common.a11y.assistantConversation')}
        data-testid={yarbisTestIds.log}
        {...logFocus}
        className="max-h-75 overflow-y-auto px-16 py-14 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-border-focus"
      >
        <ol className="flex flex-col gap-10">
          {contextStatus === 'error' ? (
            <li
              data-testid={yarbisTestIds.contextError}
              className={cn(
                'flex max-w-4/5 flex-col gap-6 rounded-md px-12 py-8 text-small',
                BUBBLE_CLASS.assistant,
              )}
            >
              <p role="alert" className="text-status-danger-text">
                {t('common.assistantChat.contextError')}
              </p>
              <Button
                size="sm"
                variant="outline"
                className="self-start"
                testId={yarbisTestIds.contextRetry}
                onClick={onRetryContext}
              >
                {t('common.assistantChat.retry')}
              </Button>
            </li>
          ) : null}
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} onRetry={onRetry} onRate={onRate} />
          ))}
        </ol>
      </div>
      {contextStatus === 'loading' ? (
        <p
          role="status"
          data-testid={yarbisTestIds.contextLoading}
          className="px-16 pb-10 text-label text-text-secondary"
        >
          {t('common.assistantChat.contextLoading')}
        </p>
      ) : null}
      {suggestions.length > 0 ? (
        <div
          role="group"
          aria-label={t('common.a11y.assistantSuggestions')}
          className="flex flex-wrap gap-6 px-16 pb-10"
        >
          {suggestions.map((suggestion) => (
            <Chip
              key={suggestion}
              variant="suggestion"
              disabled={busy}
              onClick={() => {
                send(suggestion);
              }}
            >
              {suggestion}
            </Chip>
          ))}
        </div>
      ) : null}
      <form
        className="flex items-end gap-8 border-t border-surface-page px-16 py-10"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <Textarea
          ref={inputRef}
          label={t('common.a11y.assistantMessage')}
          hideLabel
          placeholder={t('common.assistant.inputPlaceholder')}
          rows={1}
          value={draft}
          testId={yarbisTestIds.composer}
          className="flex-1"
          onValueChange={setDraft}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
        />
        <Button
          type="submit"
          size="sm"
          variant="cyan"
          aria-label={t('common.a11y.sendMessage')}
          disabled={busy || draft.trim() === ''}
        >
          ›
        </Button>
      </form>
    </section>
  );
}
