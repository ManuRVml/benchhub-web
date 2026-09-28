import { useEffect, useRef, useState } from 'react';

import { cn } from '@/shared/lib';
import { Button } from '@/shared/ui/primitives/button';
import { Textarea, TextField } from '@/shared/ui/primitives/inputs';

import type { MaybePromise } from './types';
import type { KeyboardEvent } from 'react';

export interface CommentComposerProps {
  /** Label of the text area (kept for screen readers only unless `showLabel`). */
  label: string;
  showLabel?: boolean;
  placeholder: string;
  /** Text of the primary submit button, e.g. "Enviar". */
  submitLabel: string;
  /** Called with the trimmed text; empty text is never submitted. The text clears once it resolves. */
  onSubmit: (text: string) => MaybePromise;
  /**
   * Secondary action for a change request (C-12, "Solicitar ajuste"): same text, its own label, warning tone and
   * callback. Omit it to render the plain comment composer.
   */
  requestChange?: { label: string; onSubmit: (text: string) => MaybePromise };
  /** Character limit, announced by the counter (default 1000). */
  maxLength?: number;
  /**
   * `stacked` (default): a two-row text area with a character counter and the buttons below. `inline`: a single-line
   * field with the submit button on its right (SCR-13 / SCR-14, HTML L2350-2353, L2577-2580); Enter submits and
   * `maxLength` still caps the text.
   */
  layout?: 'stacked' | 'inline';
  /** Moves focus into the text area when it mounts (e.g. after the user pressed "Responder"). */
  focusOnMount?: boolean;
  /** `data-testid` root; the buttons are `<testId>-submit` and `<testId>-request-change`. */
  testId?: string;
  className?: string;
}

/**
 * Comment composer (component catalog `Cmp:CommentComposer`): P5-15 Textarea with a character counter and the P5-11
 * submit Button. Text is trimmed and never sent empty; Ctrl+Enter / Cmd+Enter submits; everything is disabled while a
 * submission is pending, and the text clears when it succeeds (it is kept when the callback rejects).
 */
export function CommentComposer({
  label,
  showLabel = false,
  placeholder,
  submitLabel,
  onSubmit,
  requestChange,
  maxLength = 1000,
  layout = 'stacked',
  focusOnMount = false,
  testId = 'comment-composer',
  className,
}: CommentComposerProps) {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lineRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (focusOnMount) (inputRef.current ?? lineRef.current)?.focus();
  }, [focusOnMount]);
  const [submitting, setSubmitting] = useState(false);
  const trimmed = text.trim();
  const disabled = submitting || trimmed === '' || trimmed.length > maxLength;

  const submit = async (send: (value: string) => MaybePromise) => {
    if (disabled) return;
    setSubmitting(true);
    try {
      await send(trimmed);
      setText('');
    } catch {
      // The container reports the failure (toast); the text stays so the user can retry.
    } finally {
      setSubmitting(false);
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      void submit(onSubmit);
    }
  };

  if (layout === 'inline') {
    return (
      <div className={cn('flex items-start gap-8', className)} data-testid={testId}>
        <TextField
          label={label}
          hideLabel={!showLabel}
          placeholder={placeholder}
          maxLength={maxLength}
          value={text}
          disabled={submitting}
          ref={lineRef}
          className="flex-1"
          testId={`${testId}-input`}
          onValueChange={setText}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              void submit(onSubmit);
            }
          }}
        />
        <Button
          size="md"
          testId={`${testId}-submit`}
          disabled={disabled}
          loading={submitting}
          onClick={() => {
            void submit(onSubmit);
          }}
        >
          {submitLabel}
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-8', className)} data-testid={testId}>
      <Textarea
        label={label}
        hideLabel={!showLabel}
        placeholder={placeholder}
        variant="compact"
        rows={2}
        maxLength={maxLength}
        value={text}
        disabled={submitting}
        ref={inputRef}
        testId={`${testId}-input`}
        onValueChange={setText}
        onKeyDown={onKeyDown}
      />
      <div className="flex justify-end gap-8">
        {requestChange === undefined ? null : (
          <Button
            variant="outline"
            size="sm"
            testId={`${testId}-request-change`}
            disabled={disabled}
            className="border-status-warning-base text-status-warning-text hover:border-status-warning-text hover:bg-status-warning-bg"
            onClick={() => {
              void submit(requestChange.onSubmit);
            }}
          >
            {requestChange.label}
          </Button>
        )}
        <Button
          size="sm"
          testId={`${testId}-submit`}
          disabled={disabled}
          loading={submitting}
          onClick={() => {
            void submit(onSubmit);
          }}
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}
