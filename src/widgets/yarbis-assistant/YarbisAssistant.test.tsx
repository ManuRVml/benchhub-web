import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createAssistantChatPort, useAssistantStore } from '@/features/assistant';
import {
  API_BASE_URL,
  createCsrfTokenStore,
  createHttpClient,
  createHttpPorts,
  createSseClient,
  ServiceContext,
} from '@/shared/api';
import { createMockPorts } from '@/shared/api/mock';

import { server } from '../../test/msw/server';
import { createQueryHarness } from '../../test/query-wrapper';

import { yarbisTestIds } from './test-ids';
import { YarbisAssistant } from './YarbisAssistant';

import type { YarbisAssistantProps } from './YarbisAssistant';
import type { AssistantStreamEvent } from '@/features/assistant';
import type { ServiceContainer } from '@/shared/api';

const encoder = new TextEncoder();

/**
 * MSW handler of C-33 whose SSE body the test writes event by event, so each step of the stream is observable. Every
 * POST gets a fresh stream; `requests` keeps the bodies.
 */
function streamingAssistant() {
  const streams: ReadableStreamDefaultController<Uint8Array>[] = [];
  const requests: unknown[] = [];
  server.use(
    http.post(`${API_BASE_URL}/assistant/messages`, async ({ request }) => {
      requests.push(await request.json());
      const body = new ReadableStream<Uint8Array>({
        start(controller) {
          streams.push(controller);
        },
      });
      return new HttpResponse(body, { headers: { 'Content-Type': 'text/event-stream' } });
    }),
  );
  const current = async () => {
    await waitFor(() => {
      expect(streams.length).toBe(requests.length);
      expect(streams.length).toBeGreaterThan(0);
    });
    const stream = streams.at(-1);
    if (!stream) throw new Error('no stream');
    return stream;
  };
  return {
    requests,
    emit: async (event: AssistantStreamEvent) => {
      (await current()).enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
    },
    end: async () => {
      (await current()).close();
    },
  };
}

/** C-34 feedback handler that records its bodies. */
function feedbackRecorder() {
  const bodies: unknown[] = [];
  server.use(
    http.post(`${API_BASE_URL}/assistant/feedback`, async ({ request }) => {
      bodies.push(await request.json());
      return HttpResponse.json({ feedbackId: 'fbk_1', ratedAt: '2026-09-25T10:00:00-05:00' });
    }),
  );
  return bodies;
}

const port = () =>
  createAssistantChatPort({
    sse: createSseClient({
      csrf: createCsrfTokenStore(async () => Promise.resolve('mock-csrf-token')),
    }),
    commands: createHttpPorts(createHttpClient()).assistant,
  });

const V46_PATH = `${API_BASE_URL}/views/assistant-context`;
const INICIO_TIP = {
  id: 'tip_inicio',
  text: 'Hola, soy Yarbis. Detecté 3 cambios relevantes en el sector durante las últimas 24 horas — pregúntame por cualquier cifra, indicador o compañía.',
};
const ANALISIS_TIP = { id: 'tip_analisis', text: 'Tienes 2 análisis en revisión.' };
const SUGGESTIONS = ['¿Qué análisis tengo pendiente?', '¿Cómo está Ecopetrol vs. pares?'];

interface ScreenContext {
  tip: { id: string; text: string } | null;
  suggestions: string[];
}
const INICIO_CONTEXT: ScreenContext = { tip: INICIO_TIP, suggestions: SUGGESTIONS };

/** V-46 served by MSW per `screen` (unknown screens have no tip and no chips); returns the query strings it saw. */
function serveContext(byScreen: Record<string, ScreenContext> = { inicio: INICIO_CONTEXT }) {
  const searches: string[] = [];
  server.use(
    http.get(V46_PATH, ({ request }) => {
      const url = new URL(request.url);
      searches.push(url.search);
      const context = byScreen[url.searchParams.get('screen') ?? ''] ?? {
        tip: null,
        suggestions: [],
      };
      return HttpResponse.json({
        proactiveTip: context.tip === null ? null : { ...context.tip, aiStatus: 'suggestion' },
        suggestions: context.suggestions,
        permissions: { canUseAssistant: true },
      });
    }),
  );
  return searches;
}

function renderAssistant(props: Partial<YarbisAssistantProps> = {}) {
  const { wrapper: Providers } = createQueryHarness();
  const base: YarbisAssistantProps = {
    screen: 'inicio',
    screenTitle: 'Inicio',
    canUseAssistant: true,
    port: port(),
    ...props,
  };
  const view = render(
    <Providers>
      <YarbisAssistant {...base} />
    </Providers>,
  );
  return {
    ...view,
    rerenderWith: (next: Partial<YarbisAssistantProps>) => {
      view.rerender(
        <Providers>
          <YarbisAssistant {...base} {...next} />
        </Providers>,
      );
    },
  };
}

const fab = () => screen.getByRole('button', { name: 'Abrir Yarbis' });
const log = () => screen.getByRole('log', { name: 'Conversación con Yarbis' });
const composer = () => screen.getByRole('textbox', { name: 'Mensaje para Yarbis' });

async function ask(user: ReturnType<typeof userEvent.setup>, text: string) {
  await user.type(composer(), text);
  await user.keyboard('{Enter}');
}

describe('YarbisAssistant', () => {
  beforeEach(() => {
    useAssistantStore.setState({ panelOpen: false, tipsSeen: {} });
    serveContext();
  });

  afterEach(() => {
    useAssistantStore.setState({ panelOpen: false, tipsSeen: {} });
  });

  it('renders nothing without canUseAssistant (CF-40)', () => {
    const { container } = renderAssistant({ canUseAssistant: false });
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole('button', { name: 'Abrir Yarbis' })).toBeNull();
  });

  it('opens a dialog named by its header with the composer focused; Esc closes it and returns the focus to the FAB', async () => {
    const user = userEvent.setup({ delay: null });
    renderAssistant();
    expect(fab()).toHaveAttribute('aria-expanded', 'false');
    await user.click(fab());
    const panel = screen.getByRole('dialog', { name: '✦ Yarbis · Inicio' });
    expect(fab()).toHaveAttribute('aria-expanded', 'true');
    expect(fab()).toHaveAttribute('aria-controls', panel.id);
    expect(composer()).toHaveFocus();
    expect(composer()).toHaveAttribute('placeholder', 'Pregunta sobre este análisis...');

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(fab()).toHaveFocus();
    expect(fab()).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes with "✕" and returns the focus to the FAB', async () => {
    const user = userEvent.setup({ delay: null });
    renderAssistant();
    await user.click(fab());
    await user.click(screen.getByRole('button', { name: 'Cerrar Yarbis' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(fab()).toHaveFocus();
  });

  it('renders the answer token by token; done stores the messageId and enables feedback (C-34)', async () => {
    const user = userEvent.setup({ delay: null });
    const assistant = streamingAssistant();
    const feedback = feedbackRecorder();
    renderAssistant({ analysisId: 'ana_01' });
    await user.click(fab());
    await ask(user, '¿Cómo va el ROACE?');

    expect(within(log()).getByText('¿Cómo va el ROACE?')).toBeInTheDocument();
    expect(within(log()).getByText('Yarbis está escribiendo…')).toBeInTheDocument();
    await waitFor(() => {
      expect(assistant.requests).toEqual([
        {
          message: '¿Cómo va el ROACE?',
          context: { screen: 'inicio', analysisId: 'ana_01' },
        },
      ]);
    });

    await assistant.emit({ type: 'token', content: 'El ROACE de Ecopetrol' });
    expect(await within(log()).findByText('El ROACE de Ecopetrol')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Respuesta útil' })).toBeNull();
    expect(composer()).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Enviar mensaje' })).toBeDisabled();

    await assistant.emit({ type: 'token', content: ' es 7,4 %.' });
    expect(await within(log()).findByText('El ROACE de Ecopetrol es 7,4 %.')).toBeInTheDocument();
    await assistant.emit({ type: 'citation', content: 'Capital IQ · T4 2025' });
    expect(await within(log()).findByText('Capital IQ · T4 2025')).toBeInTheDocument();

    await assistant.emit({ type: 'done', messageId: 'msg_42' });
    await assistant.end();
    const helpful = await screen.findByRole('button', { name: 'Respuesta útil' });
    const answer = within(log()).getByText('El ROACE de Ecopetrol es 7,4 %.').closest('li');
    expect(answer).toHaveAttribute('data-message-id', 'msg_42');
    expect(answer).toHaveAttribute('data-status', 'done');

    await user.click(helpful);
    await waitFor(() => {
      expect(feedback).toEqual([{ messageId: 'msg_42', rating: 'up' }]);
    });
    expect(helpful).toHaveAttribute('aria-pressed', 'true');
    expect(helpful).toHaveAttribute('aria-disabled', 'true');
    expect(helpful).toHaveFocus();
    const notHelpful = screen.getByRole('button', { name: 'Respuesta no útil' });
    expect(notHelpful).toHaveAttribute('aria-disabled', 'true');
    await user.click(notHelpful);
    expect(feedback).toHaveLength(1);

    // The focus stayed in the panel, so Esc still closes it.
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(fab()).toHaveFocus();
  });

  it('shows an error bubble on an error event, and retry sends the question again', async () => {
    const user = userEvent.setup({ delay: null });
    const assistant = streamingAssistant();
    renderAssistant();
    await user.click(fab());
    await ask(user, 'Resume el análisis');
    await assistant.emit({ type: 'error', errorCode: 'ASSISTANT_UNAVAILABLE' });
    await assistant.end();

    expect(
      await within(log()).findByText('Yarbis no pudo responder. Intenta de nuevo.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Respuesta útil' })).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Reintentar' }));
    await assistant.emit({ type: 'token', content: 'Resumen listo.' });
    await assistant.emit({ type: 'done', messageId: 'msg_7' });
    await assistant.end();
    expect(await within(log()).findByText('Resumen listo.')).toBeInTheDocument();
    expect(within(log()).queryByText('Yarbis no pudo responder. Intenta de nuevo.')).toBeNull();
    expect(assistant.requests).toHaveLength(2);
    expect(assistant.requests[1]).toEqual(assistant.requests[0]);
  });

  it('shows an error bubble when the request fails', async () => {
    const user = userEvent.setup({ delay: null });
    server.use(
      http.post(`${API_BASE_URL}/assistant/messages`, () =>
        HttpResponse.json({ code: 'FORBIDDEN', message: 'no', traceId: 't' }, { status: 403 }),
      ),
    );
    renderAssistant();
    await user.click(fab());
    await ask(user, 'Hola');
    expect(
      await within(log()).findByText('Yarbis no pudo responder. Intenta de nuevo.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeEnabled();
  });

  it('sends a suggestion chip as the question', async () => {
    const user = userEvent.setup({ delay: null });
    const assistant = streamingAssistant();
    renderAssistant();
    await user.click(fab());
    const chips = await screen.findByRole('group', { name: 'Preguntas sugeridas' });
    await user.click(
      within(chips).getByRole('button', { name: '¿Cómo está Ecopetrol vs. pares?' }),
    );
    await waitFor(() => {
      expect(assistant.requests).toEqual([
        { message: '¿Cómo está Ecopetrol vs. pares?', context: { screen: 'inicio' } },
      ]);
    });
    expect(
      within(chips).getByRole('button', { name: '¿Qué análisis tengo pendiente?' }),
    ).toBeDisabled();
    expect(composer()).toHaveFocus();
  });

  it('hides the suggestion row when the screen has none', async () => {
    const user = userEvent.setup({ delay: null });
    serveContext({ inicio: { tip: INICIO_TIP, suggestions: [] } });
    renderAssistant();
    await user.click(fab());
    await waitFor(() => {
      expect(screen.queryByTestId(yarbisTestIds.contextLoading)).toBeNull();
    });
    expect(screen.queryByRole('group', { name: 'Preguntas sugeridas' })).toBeNull();
  });

  it('shows each screen proactive tip once per session', async () => {
    const user = userEvent.setup({ delay: null });
    serveContext({
      inicio: INICIO_CONTEXT,
      analisis: { tip: ANALISIS_TIP, suggestions: [] },
    });
    const { rerenderWith } = renderAssistant();
    await waitFor(() => {
      expect(useAssistantStore.getState().tipsSeen).toEqual({ inicio: true });
    });
    rerenderWith({ screen: 'analisis', screenTitle: 'Análisis' });
    await waitFor(() => {
      expect(useAssistantStore.getState().tipsSeen).toEqual({ inicio: true, analisis: true });
    });
    rerenderWith({ screen: 'inicio', screenTitle: 'Inicio' });

    await user.click(fab());
    expect(within(log()).getAllByText(INICIO_TIP.text)).toHaveLength(1);
    expect(within(log()).getAllByText(ANALISIS_TIP.text)).toHaveLength(1);
    expect(useAssistantStore.getState().tipsSeen).toEqual({ inicio: true, analisis: true });
    expect(
      screen.getByTestId(yarbisTestIds.log).querySelectorAll('li[data-role="tip"]'),
    ).toHaveLength(2);
  });

  it('does not repeat a tip already shown in this session after a remount', async () => {
    useAssistantStore.setState({ panelOpen: true, tipsSeen: { inicio: true } });
    renderAssistant();
    // The chips prove V-46 has arrived; the tip was seen already, so it is not appended again.
    await screen.findByRole('group', { name: 'Preguntas sugeridas' });
    expect(within(log()).queryByText(INICIO_TIP.text)).toBeNull();
  });
});

describe('YarbisAssistant · V-46 assistant context', () => {
  beforeEach(() => {
    useAssistantStore.setState({ panelOpen: false, tipsSeen: {} });
  });

  afterEach(() => {
    useAssistantStore.setState({ panelOpen: false, tipsSeen: {} });
  });

  it('asks V-46 for the current screen, adding the analysis only when the screen has one', async () => {
    const searches = serveContext();
    renderAssistant();
    await waitFor(() => {
      expect(searches).toEqual(['?screen=inicio']);
    });

    renderAssistant({ screen: 'resultados', screenTitle: 'Resultados', analysisId: 'ana_01' });
    await waitFor(() => {
      expect(searches).toContain('?screen=resultados&analysisId=ana_01');
    });
  });

  it('asks V-46 with its own screen name where C-33 names it differently', async () => {
    const searches = serveContext();
    renderAssistant({ screen: 'detalle-indicador', screenTitle: 'Detalle', analysisId: 'ana_01' });
    renderAssistant({ screen: 'monitor-valor', screenTitle: 'Monitor de Valor' });
    await waitFor(() => {
      expect(searches).toContain('?screen=detalle&analysisId=ana_01');
      expect(searches).toContain('?screen=valor');
    });
  });

  it('shows the V-46 tip and chips, and a loading line until they arrive', async () => {
    const user = userEvent.setup({ delay: null });
    let release = (): void => undefined;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    server.use(
      http.get(V46_PATH, async () => {
        await gate;
        return HttpResponse.json({
          proactiveTip: { ...INICIO_TIP, aiStatus: 'suggestion' },
          suggestions: SUGGESTIONS,
          permissions: { canUseAssistant: true },
        });
      }),
    );
    renderAssistant();
    await user.click(fab());
    expect(screen.getByTestId(yarbisTestIds.contextLoading)).toHaveTextContent(
      'Cargando sugerencias…',
    );
    expect(screen.queryByRole('group', { name: 'Preguntas sugeridas' })).toBeNull();

    release();
    const chips = await screen.findByRole('group', { name: 'Preguntas sugeridas' });
    expect(
      within(chips)
        .getAllByRole('button')
        .map((chip) => chip.textContent),
    ).toEqual(SUGGESTIONS);
    expect(within(log()).getByText(INICIO_TIP.text)).toBeInTheDocument();
    expect(screen.queryByTestId(yarbisTestIds.contextLoading)).toBeNull();
  });

  it('shows an error bubble when V-46 fails, keeps the chat usable, and retry refetches it', async () => {
    const user = userEvent.setup({ delay: null });
    const searches: string[] = [];
    let failing = true;
    server.use(
      http.get(V46_PATH, ({ request }) => {
        searches.push(new URL(request.url).search);
        return failing
          ? HttpResponse.json(
              { code: 'INTERNAL_ERROR', message: 'x', traceId: 't' },
              { status: 500 },
            )
          : HttpResponse.json({
              proactiveTip: { ...INICIO_TIP, aiStatus: 'suggestion' },
              suggestions: SUGGESTIONS,
              permissions: { canUseAssistant: true },
            });
      }),
    );
    renderAssistant();
    await user.click(fab());

    const bubble = await screen.findByTestId(yarbisTestIds.contextError);
    expect(within(bubble).getByRole('alert')).toHaveTextContent(
      'Yarbis no pudo cargar las sugerencias de esta pantalla.',
    );
    expect(screen.queryByRole('group', { name: 'Preguntas sugeridas' })).toBeNull();
    // The panel is otherwise usable: the composer takes text.
    await user.type(composer(), 'Hola');
    expect(composer()).toHaveValue('Hola');

    const before = searches.length;
    failing = false;
    await user.click(screen.getByTestId(yarbisTestIds.contextRetry));
    expect(await screen.findByRole('group', { name: 'Preguntas sugeridas' })).toBeInTheDocument();
    expect(searches.length).toBeGreaterThan(before);
    expect(screen.queryByTestId(yarbisTestIds.contextError)).toBeNull();
    expect(within(log()).getByText(INICIO_TIP.text)).toBeInTheDocument();
  });
});

// The mock-mode regression class: with `VITE_API_MODE=mock` there is no BFF, so V-46 must come through the typed mock
// port. MSW answers EVERY raw network request with an error, so a read through the raw client would fail here.
describe('YarbisAssistant in mock mode (V-46 from the real mock adapter, no network)', () => {
  beforeEach(() => {
    useAssistantStore.setState({ panelOpen: false, tipsSeen: {} });
  });

  afterEach(() => {
    useAssistantStore.setState({ panelOpen: false, tipsSeen: {} });
  });

  it('renders the V-46 fixture tip and chips with every raw http request rejected', async () => {
    server.use(http.all('*', () => HttpResponse.error()));
    const services: ServiceContainer = {
      ...createMockPorts(),
      http: createHttpClient({
        fetch: () => Promise.reject(new TypeError('mock mode has no network')),
      }),
      mode: 'mock',
    };
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const user = userEvent.setup({ delay: null });
    render(
      <ServiceContext.Provider value={services}>
        <QueryClientProvider client={queryClient}>
          <YarbisAssistant screen="inicio" screenTitle="Inicio" canUseAssistant port={port()} />
        </QueryClientProvider>
      </ServiceContext.Provider>,
    );
    await user.click(fab());

    const chips = await screen.findByRole('group', { name: 'Preguntas sugeridas' });
    expect(within(chips).getAllByRole('button').length).toBeGreaterThan(0);
    expect(within(log()).getByText(/^Hola, soy Yarbis\./)).toBeInTheDocument();
    expect(screen.queryByTestId(yarbisTestIds.contextError)).toBeNull();
  });
});
