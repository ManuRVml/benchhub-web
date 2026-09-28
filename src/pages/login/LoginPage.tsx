import { useSearchParams } from 'react-router';

import { usePasswordLogin } from '@/entities/session';
import { assignLocation } from '@/shared/api/auth-redirect';
import { routes } from '@/shared/config';
import { useT } from '@/shared/i18n';
import { BarChartIcon, ClockIcon, TrendUpIcon } from '@/shared/ui/icons';

import benchudLogo from './assets/benchud-logo.png';
import loginBackground from './assets/login-bg.webp';
import ecopetrolLogo from './assets/logo-ecopetrol.png';
import { LoginForm } from './LoginForm';
import { loginPageTestIds } from './test-ids';

import type { ReactNode } from 'react';

export interface LoginPageProps {
  /** Full-page navigation after a successful login; the browser's `location.assign` by default (tests inject a spy). */
  redirect?: (url: string) => void;
}

function Feature({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle: string }) {
  return (
    <li className="flex items-start gap-14">
      <span
        aria-hidden="true"
        className="flex size-9 shrink-0 items-center justify-center rounded-nav border border-ai-accent/35 bg-ai-accent/18 text-ai-accent"
      >
        {icon}
      </span>
      <span className="flex flex-col">
        <span className="text-14 font-semibold text-text-on-dark-heading">{title}</span>
        <span className="text-13 text-text-on-dark-caption">{subtitle}</span>
      </span>
    </li>
  );
}

/** `?error=<code>` of /login → the banner copy (A-02 maps IdP errors to these codes; any other code is generic). */
function useLoginError(code: string | null): string | null {
  const t = useT();
  switch (code) {
    case null:
    case '':
      return null;
    case 'access_denied':
      return t('common.authError.accessDenied');
    case 'session_expired':
      return t('common.authError.sessionExpired');
    case 'idp_error':
      return t('common.authError.idpError');
    default:
      return t('common.authError.unknown');
  }
}

/**
 * SCR-01 Iniciar sesión, outside the app shell: over the refinery photo (`login-bg.webp`, re-encoded from the
 * prototype's 3.3 MB PNG) and the login overlay gradient, the brand panel (logos, eyebrow, the page's only h1, body,
 * three feature rows) sits left of the 420 px glass login card from `laptop` up, both vertically centred (prototype
 * L38-L91). The card signs in with username and password through the BFF (A-05, owner decision 2026-09-28), then
 * opens the `returnTo` of the URL (set by the 401 handler); it shows `?error=` as an alert.
 */
export function LoginPage({ redirect = assignLocation }: LoginPageProps) {
  const t = useT();
  const [search] = useSearchParams();
  const error = useLoginError(search.get('error'));
  const login = usePasswordLogin();

  return (
    <main
      data-testid={loginPageTestIds.root}
      data-scr={routes.login.scr}
      className="relative isolate flex min-h-screen items-center overflow-hidden bg-dark-bg px-24 py-48 laptop:p-64"
    >
      <img
        src={loginBackground}
        alt=""
        aria-hidden="true"
        data-testid={loginPageTestIds.background}
        className="absolute inset-0 -z-10 size-full object-cover"
      />
      <div
        aria-hidden="true"
        data-testid={loginPageTestIds.overlay}
        className="absolute inset-0 -z-10 bg-(image:--gradient-login-overlay)"
      />
      <div
        data-testid={loginPageTestIds.layout}
        className="mx-auto flex w-full max-w-310 flex-col-reverse items-center gap-48 laptop:flex-row laptop:gap-64"
      >
        <section
          data-testid={loginPageTestIds.brand}
          className="flex w-full min-w-0 flex-1 flex-col"
        >
          <div className="mb-28 flex items-center gap-16">
            <img src={benchudLogo} alt={t('login.brand.logoAlt')} className="h-32" />
            <span aria-hidden="true" className="h-28 w-px bg-dark-glass-border" />
            <img src={ecopetrolLogo} alt={t('login.brand.partnerLogoAlt')} className="h-9" />
          </div>
          <p className="mb-16 text-13 font-semibold tracking-wide text-ai-accent">
            {t('login.brand.eyebrow')}
          </p>
          <h1 className="mb-20 text-display-login text-text-on-dark-heading">
            {t('login.brand.title')}
          </h1>
          <p className="mb-32 max-w-120 text-16 leading-relaxed text-text-on-dark-lead">
            {t('login.brand.body')}
          </p>
          <ul className="flex flex-col gap-16">
            <Feature
              icon={<TrendUpIcon size={18} />}
              title={t('login.features.performance.title')}
              subtitle={t('login.features.performance.subtitle')}
            />
            <Feature
              icon={<BarChartIcon size={18} />}
              title={t('login.features.strategic.title')}
              subtitle={t('login.features.strategic.subtitle')}
            />
            <Feature
              icon={<ClockIcon size={18} />}
              title={t('login.features.value.title')}
              subtitle={t('login.features.value.subtitle')}
            />
          </ul>
        </section>

        <div
          data-testid={loginPageTestIds.card}
          className="flex w-full max-w-105 shrink-0 flex-col gap-18"
        >
          <LoginForm
            returnTo={search.get('returnTo')}
            error={error}
            login={login}
            redirect={redirect}
          />
          <p className="text-center text-12 text-text-on-dark-caption">{t('login.footer')}</p>
        </div>
      </div>
    </main>
  );
}
