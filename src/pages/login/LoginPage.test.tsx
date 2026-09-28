import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { API_BASE_URL, CSRF_HEADER } from '@/shared/api';
import { MOCK_LOGIN_CREDENTIALS, mockPayload } from '@/shared/api/mock';

import { server } from '../../test/msw/server';
import { createQueryHarness } from '../../test/query-wrapper';

import { LoginPage } from './LoginPage';
import { loginPageTestIds } from './test-ids';

const PASSWORD_LOGIN = `${API_BASE_URL}/auth/password-login`;

/** Renders /login with the given query (http ports against MSW); returns the injected redirect spy. */
function renderLogin(search = '') {
  const redirect = vi.fn<(url: string) => void>();
  const { wrapper: Wrapper } = createQueryHarness();
  render(
    <Wrapper>
      <MemoryRouter initialEntries={[`/login${search}`]}>
        <LoginPage redirect={redirect} />
      </MemoryRouter>
    </Wrapper>,
  );
  return redirect;
}

interface SeenRequest {
  url: string;
  method: string;
  csrf: string | null;
  body: unknown;
}

/** Records every A-05 request (URL, method, CSRF header, JSON body) and answers with the given response. */
function recordPasswordLogin(respond: () => Response | Promise<Response>): SeenRequest[] {
  const seen: SeenRequest[] = [];
  server.use(
    http.post(PASSWORD_LOGIN, async ({ request }) => {
      seen.push({
        url: request.url,
        method: request.method,
        csrf: request.headers.get(CSRF_HEADER),
        body: await request.clone().json(),
      });
      return respond();
    }),
  );
  return seen;
}

async function sessionBody(overrides: Record<string, unknown> = {}): Promise<Response> {
  const session = (await mockPayload('getSession')) as Record<string, unknown>;
  return HttpResponse.json({ ...session, ...overrides });
}

const invalidCredentials = () =>
  HttpResponse.json(
    {
      code: 'INVALID_CREDENTIALS',
      message: 'The username or password is incorrect',
      traceId: 'trace-401',
    },
    { status: 401 },
  );

async function signIn(username: string, password: string) {
  const user = userEvent.setup({ delay: null });
  if (username !== '') await user.type(screen.getByTestId(loginPageTestIds.username), username);
  if (password !== '') await user.type(screen.getByTestId(loginPageTestIds.password), password);
  await user.click(screen.getByRole('button', { name: 'Ingresar' }));
  return user;
}

describe('LoginPage (SCR-01)', () => {
  it('renders the SCR-01 copy with one h1 and a labelled form', () => {
    renderLogin();
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent('Inteligencia financiera para decisiones estratégicas');
    expect(screen.getByText('Comparador financiero')).toBeInTheDocument();
    expect(
      screen.getByText(/Plataforma corporativa de análisis y comparación financiera/),
    ).toBeInTheDocument();
    for (const title of [
      'Desempeño comparativo',
      'Referentes estratégicos',
      'Generación de valor',
    ]) {
      expect(screen.getByText(title)).toBeInTheDocument();
    }
    const form = screen.getByRole('form', { name: 'Iniciar sesión' });
    expect(
      within(form).getByText('Acceso mediante Directorio Activo corporativo'),
    ).toBeInTheDocument();
    expect(within(form).getByRole('button', { name: 'Ingresar' })).toBeInTheDocument();
    expect(within(form).getByText('Directorio Activo').tagName).toBe('STRONG');
    expect(
      screen.getByText('Acceso corporativo · Ecopetrol S.A. · Uso interno'),
    ).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'BencHUD' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Ecopetrol' })).toBeInTheDocument();
  });

  it('has the username field and the prototype password field (HTML L80-L83)', () => {
    renderLogin();
    const username = screen.getByRole('textbox', { name: 'Usuario o correo corporativo' });
    expect(username).toHaveAttribute('autocomplete', 'username');
    expect(username).toHaveAttribute('placeholder', 'usuario@ecopetrol.com.co');
    const password = screen.getByLabelText('Contraseña');
    expect(password).toBe(screen.getByTestId(loginPageTestIds.password));
    expect(password).toHaveAttribute('type', 'password');
    expect(password).toHaveAttribute('autocomplete', 'current-password');
    expect(password).toHaveAttribute('placeholder', '••••••••');
    expect(password).toHaveAttribute('name', 'password');
  });

  it('posts both fields to A-05 in a JSON body, without CSRF, then opens returnTo', async () => {
    const seen = recordPasswordLogin(() => sessionBody());
    const returnTo = '/analisis/ana 01/resultados?horizonte=tbg-ilp';
    const redirect = renderLogin(`?returnTo=${encodeURIComponent(returnTo)}`);

    await signIn('  Ecopetrol@Ecopetrol.com ', 'ecopetrol');

    await waitFor(() => {
      expect(redirect).toHaveBeenCalledWith(returnTo);
    });
    expect(seen).toEqual([
      {
        url: `${window.location.origin}${PASSWORD_LOGIN}`,
        method: 'POST',
        csrf: null,
        body: { username: 'Ecopetrol@Ecopetrol.com', password: 'ecopetrol' },
      },
    ]);
    expect(redirect).toHaveBeenCalledTimes(1);
  });

  it('never puts the password in a URL: not in the request URL, not in the landing route', async () => {
    const seen = recordPasswordLogin(() => sessionBody());
    const redirect = renderLogin('?returnTo=%2Finicio');
    const password = 'S3cret-Pass#';

    await signIn(MOCK_LOGIN_CREDENTIALS.username, password);

    await waitFor(() => {
      expect(redirect).toHaveBeenCalledTimes(1);
    });
    const [request] = seen;
    expect(new URL(request?.url ?? '').search).toBe('');
    expect(request?.url).not.toContain(encodeURIComponent(password));
    expect(request?.url).not.toContain(password);
    expect(String(redirect.mock.calls[0]?.[0])).not.toContain(password);
    expect(window.location.href).not.toContain(password);
  });

  it('signs in with the mock credential pair of the default MSW handler and lands on Inicio', async () => {
    const redirect = renderLogin();
    await signIn(MOCK_LOGIN_CREDENTIALS.username, MOCK_LOGIN_CREDENTIALS.password);
    await waitFor(() => {
      expect(redirect).toHaveBeenCalledWith('/inicio');
    });
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('shows the generic inline error on 401 and lets the user retry', async () => {
    const seen = recordPasswordLogin(invalidCredentials);
    const redirect = renderLogin();

    await signIn(MOCK_LOGIN_CREDENTIALS.username, 'wrong');

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Usuario o contraseña incorrectos.');
    expect(alert).toBe(screen.getByTestId(loginPageTestIds.error));
    expect(redirect).not.toHaveBeenCalled();
    expect(seen).toHaveLength(1);
    const button = screen.getByRole('button', { name: 'Ingresar' });
    expect(button).toBeEnabled();
    expect(button).not.toHaveAttribute('aria-busy');
  });

  it('with the default MSW handler, an unknown user gets the same message as a wrong password', async () => {
    renderLogin();
    await signIn('nobody@ecopetrol.com', MOCK_LOGIN_CREDENTIALS.password);
    expect(await screen.findByRole('alert')).toHaveTextContent('Usuario o contraseña incorrectos.');
  });

  it('disables the button while the call runs', async () => {
    let release: () => void = () => undefined;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    recordPasswordLogin(async () => {
      await gate;
      return invalidCredentials();
    });
    renderLogin();

    await signIn(MOCK_LOGIN_CREDENTIALS.username, 'wrong');

    const button = screen.getByRole('button', { name: 'Ingresar' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    release();
    await screen.findByRole('alert');
    expect(button).toBeEnabled();
  });

  it('shows the generic sign-in failure when the BFF is down', async () => {
    recordPasswordLogin(async () => {
      await delay(1);
      return HttpResponse.json(
        { code: 'INTERNAL_ERROR', message: 'boom', traceId: 't' },
        { status: 500 },
      );
    });
    const redirect = renderLogin();
    await signIn(MOCK_LOGIN_CREDENTIALS.username, MOCK_LOGIN_CREDENTIALS.password);
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se pudo iniciar sesión. Intenta de nuevo.',
    );
    expect(redirect).not.toHaveBeenCalled();
  });

  it('submits with Enter in the password field', async () => {
    const seen = recordPasswordLogin(() => sessionBody());
    const redirect = renderLogin();
    const user = userEvent.setup({ delay: null });
    await user.type(screen.getByTestId(loginPageTestIds.username), 'camila@ecopetrol.com');
    await user.type(screen.getByTestId(loginPageTestIds.password), 'pw{Enter}');
    await waitFor(() => {
      expect(redirect).toHaveBeenCalledWith('/inicio');
    });
    expect(seen[0]?.body).toEqual({ username: 'camila@ecopetrol.com', password: 'pw' });
  });

  it('never opens a returnTo that leaves the app', async () => {
    recordPasswordLogin(() => sessionBody());
    const redirect = renderLogin(`?returnTo=${encodeURIComponent('//evil.example/x')}`);
    await signIn(MOCK_LOGIN_CREDENTIALS.username, MOCK_LOGIN_CREDENTIALS.password);
    await waitFor(() => {
      expect(redirect).toHaveBeenCalledWith('/inicio');
    });
  });

  it('sends an admin session to the access gate, as the login guard does', async () => {
    recordPasswordLogin(() => sessionBody({ hasAdminAccess: true, requiresGate: true }));
    const redirect = renderLogin('?returnTo=%2Finicio');
    await signIn(MOCK_LOGIN_CREDENTIALS.username, MOCK_LOGIN_CREDENTIALS.password);
    await waitFor(() => {
      expect(redirect).toHaveBeenCalledWith('/acceso');
    });
  });

  it.each([
    ['session_expired', 'Tu sesión expiró. Ingresa de nuevo para continuar.'],
    [
      'access_denied',
      'Tu cuenta no tiene acceso al Comparador. Solicita acceso a tu administrador.',
    ],
    ['idp_error', 'No se pudo completar el ingreso con el Directorio Activo. Intenta de nuevo.'],
    ['something_else', 'No se pudo iniciar sesión. Intenta de nuevo.'],
  ])('?error=%s shows the error banner as an alert', (code, message) => {
    renderLogin(`?error=${code}`);
    expect(screen.getByRole('alert')).toHaveTextContent(message);
  });

  it('paints the refinery photo under the login overlay gradient, hidden from assistive tech', () => {
    renderLogin();
    const background = screen.getByTestId(loginPageTestIds.background);
    expect(background.tagName).toBe('IMG');
    expect(background).toHaveAttribute('src', expect.stringMatching(/login-bg\.webp$/));
    expect(background).toHaveAttribute('alt', '');
    expect(background).toHaveClass('absolute', 'inset-0', 'object-cover');
    expect(screen.getByTestId(loginPageTestIds.overlay)).toHaveClass(
      'bg-(image:--gradient-login-overlay)',
    );
  });

  it('lays brand and card side by side from laptop up, vertically centred (prototype L38-L41)', () => {
    renderLogin();
    expect(screen.getByTestId(loginPageTestIds.root)).toHaveClass(
      'flex',
      'min-h-screen',
      'items-center',
      'laptop:p-64',
    );
    const layout = screen.getByTestId(loginPageTestIds.layout);
    expect(layout).toHaveClass('max-w-310', 'laptop:flex-row', 'laptop:gap-64', 'items-center');
    expect(screen.getByTestId(loginPageTestIds.card)).toHaveClass('max-w-105', 'shrink-0');
    expect(screen.getByTestId(loginPageTestIds.brand)).toHaveClass('flex-1', 'min-w-0');
  });

  it('spaces the card as the prototype (L75-L83): 18 / 4 / 26 under the header, 16 then 22 before the CTA', () => {
    renderLogin();
    const form = screen.getByTestId(loginPageTestIds.form);
    expect(form).toHaveClass('p-9');
    expect(form).not.toHaveClass('gap-18');
    expect(within(form).getByRole('heading', { level: 2 })).toHaveClass('mb-4');
    expect(within(form).getByRole('heading', { level: 2 }).parentElement).toHaveClass('mb-26');
    expect(screen.getByTestId(`${loginPageTestIds.username}-field`)).toHaveClass('mb-16');
    expect(screen.getByTestId(`${loginPageTestIds.password}-field`)).toHaveClass('mb-22');
  });

  it('shows no banner without ?error=', () => {
    renderLogin();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
