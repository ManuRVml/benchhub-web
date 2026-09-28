import { useId, useState } from 'react';

import { isApiError, isInAppPath } from '@/shared/api';
import { routes } from '@/shared/config';
import { useT } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { InfoIcon, UserIcon } from '@/shared/ui/icons';
import { Button } from '@/shared/ui/primitives/button';
import { TextField } from '@/shared/ui/primitives/inputs';

import { loginPageTestIds } from './test-ids';

import type { PasswordCredentials } from '@/entities/session';
import type { A05Response } from '@/shared/api';
import type { ReactNode } from 'react';

export interface LoginFormProps {
  /** In-app route to open after login (`?returnTo=` of /login). */
  returnTo: string | null;
  /** Error banner copy for `?error=<code>`, already translated; `null` hides it. */
  error: string | null;
  /** A-05 password login (`usePasswordLogin`): resolves with the new session, rejects with the call's ApiError. */
  login: (credentials: PasswordCredentials) => Promise<A05Response>;
  /** Full-page navigation to the in-app route the signed-in user lands on. */
  redirect: (url: string) => void;
}

// TextField has no on-dark variant yet: the glass card restyles its label and input through descendant selectors
// (prototype L80-L83: 500 12px lead label, 12/14 px padding, 9 px radius, 14px text).
const ON_DARK_FIELD =
  '[&_label]:text-small-medium [&_label]:text-text-on-dark-lead [&_input]:rounded-nav [&_input]:px-14 [&_input]:py-12 [&_input]:text-14 [&_input]:border-dark-input-border [&_input]:bg-dark-input-bg [&_input]:text-text-on-dark-heading [&_input]:placeholder:text-text-on-dark-caption';

/** "**bold**" segments of a translation (login.info.access marks "Directorio Activo") rendered as <strong>. */
function withBold(text: string): ReactNode[] {
  return text.split('**').map((part, index) =>
    index % 2 === 1 ? (
      <strong key={part} className="font-semibold text-text-on-dark-heading">
        {part}
      </strong>
    ) : (
      part
    ),
  );
}

/**
 * Where a fresh session lands, as the login route's own guard decides (router/access.ts `login`): the access gate for
 * an admin, else `returnTo` when it stays in the app, else Inicio. A full-page navigation, so the app re-bootstraps
 * with the new session cookie (A-04), exactly as after the A-01 → A-02 redirect.
 */
function landingRoute(session: A05Response, returnTo: string | null): string {
  if (session.hasAdminAccess) return routes.accessGate.build();
  return isInAppPath(returnTo) ? returnTo : routes.home.build();
}

type Failure = 'invalidCredentials' | 'unknown';

/**
 * SCR-01 login card: username and password as in the prototype (HTML L80-L83; owner decision 2026-09-28 overrides
 * CF-29) and "Ingresar", which POSTs both through A-05 (the password only ever travels in the request body). The
 * button is busy and disabled while the call runs; a 401 (or a malformed-body 400) shows one generic inline alert
 * that never says which field was wrong.
 */
export function LoginForm({ returnTo, error, login, redirect }: LoginFormProps) {
  const t = useT();
  const titleId = useId();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);

  const alert =
    failure === 'invalidCredentials'
      ? t('common.authError.invalidCredentials')
      : failure === 'unknown'
        ? t('common.authError.unknown')
        : error;

  const submit = async () => {
    setSubmitting(true);
    setFailure(null);
    try {
      const session = await login({ username, password });
      // Stays busy while the browser leaves for the landing route.
      redirect(landingRoute(session, returnTo));
    } catch (cause) {
      setSubmitting(false);
      const rejected = isApiError(cause) && (cause.status === 401 || cause.status === 400);
      setFailure(rejected ? 'invalidCredentials' : 'unknown');
    }
  };

  return (
    <form
      aria-labelledby={titleId}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (submitting) return;
        void submit();
      }}
      data-testid={loginPageTestIds.form}
      className="flex flex-col rounded-login-card border border-dark-glass-border bg-dark-glass-card p-9 shadow-login-card backdrop-blur-md"
    >
      <div className="mb-26 flex flex-col items-center text-center">
        <span
          aria-hidden="true"
          className="mb-18 flex size-13 items-center justify-center rounded-card bg-brand-indigo text-text-inverse"
        >
          <UserIcon size={24} />
        </span>
        <h2 id={titleId} className="mb-4 text-22 font-bold text-text-on-dark-heading">
          {t('login.card.title')}
        </h2>
        <p className="text-13 text-text-on-dark-lead">{t('login.card.subtitle')}</p>
      </div>

      {alert === null ? null : (
        <p
          role="alert"
          data-testid={loginPageTestIds.error}
          className="mb-16 rounded-md border border-status-danger-base bg-status-danger-bg px-12 py-10 text-13 text-status-danger-text"
        >
          {alert}
        </p>
      )}

      <TextField
        label={t('login.form.usernameLabel')}
        placeholder={t('login.form.usernamePlaceholder')}
        autoComplete="username"
        name="username"
        value={username}
        onValueChange={setUsername}
        testId={loginPageTestIds.username}
        className={cn('mb-16', ON_DARK_FIELD)}
      />

      <TextField
        type="password"
        label={t('login.form.passwordLabel')}
        placeholder={t('login.form.passwordPlaceholder')}
        autoComplete="current-password"
        name="password"
        value={password}
        onValueChange={setPassword}
        testId={loginPageTestIds.password}
        className={cn('mb-22', ON_DARK_FIELD)}
      />

      <Button
        type="submit"
        variant="gradient"
        size="lg"
        fullWidth
        loading={submitting}
        disabled={submitting}
        className="rounded-nav py-14 text-15"
      >
        {t('login.form.submit')}
      </Button>

      <p className="mt-20 flex gap-10 rounded-md border border-dark-input-border bg-dark-input-bg px-14 py-12 text-12 text-text-on-dark-note">
        <span aria-hidden="true" className="mt-2 shrink-0 text-ai-accent">
          <InfoIcon size={16} />
        </span>
        <span>{withBold(t('login.info.access'))}</span>
      </p>
    </form>
  );
}
