import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fn } from 'storybook/test';

import { useAssistantStore } from '@/features/assistant';
import { ApiError, createHttpClient, ServiceContext } from '@/shared/api';
import { createMockPorts } from '@/shared/api/mock';

import { YarbisAssistant } from './YarbisAssistant';
import { YarbisPanel } from './YarbisPanel';

import type { AssistantChatPort, AssistantStreamEvent, ChatMessage } from '@/features/assistant';
import type { ServiceContainer } from '@/shared/api';
import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';

// SCR-04 Yarbis (HTML L3176–3207): the inicio proactive tip (L3225) and suggestion chips (L5159) come from V-46 through
// the mock ports (the canned fixture, no network). Answers are sample data streamed by a fake C-33 port, word by word.
const INICIO_TIP_TEXT =
  'Hola, soy Yarbis. Detecté 3 cambios relevantes en el sector durante las últimas 24 horas — pregúntame por cualquier cifra, indicador o compañía.';
const SUGGESTIONS = ['¿Qué análisis tengo pending?', '¿Cómo está Ecopetrol vs. pares?'];

const mockServices: ServiceContainer = {
  ...createMockPorts(),
  http: createHttpClient(),
  mode: 'mock',
};
/** Services whose V-46 always fails: the panel shows the error bubble with retry. */
const failingContextServices: ServiceContainer = {
  ...mockServices,
  assistantContext: {
    getAssistantContextView: () =>
      Promise.reject(
        new ApiError({ code: 'INTERNAL_ERROR', message: 'V-46 down', traceId: 't', status: 500 }),
      ),
  },
};

/** Each story gets its own QueryClient (no retries) over the given services. */
function withServices(services: ServiceContainer): Decorator {
  return function Services(Story) {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return (
      <ServiceContext.Provider value={services}>
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      </ServiceContext.Provider>
    );
  };
}
const ANSWER =
  'Ecopetrol cerró el T4 2025 con un ROACE de 7,4 %, por encima del promedio de pares (5,5 %) y en la posición 1 del ranking.';

const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

/** Fake C-33 / C-34 port: streams ANSWER word by word, then a citation and `done`. */
const streamingPort: AssistantChatPort = {
  async *streamMessage(): AsyncGenerator<AssistantStreamEvent> {
    for (const word of ANSWER.split(' ')) {
      await wait(60);
      yield { type: 'token', content: `${word} ` };
    }
    yield { type: 'citation', content: 'Capital IQ · T4 2025' };
    yield { type: 'done', messageId: 'msg_story' };
  },
  sendFeedback: async () => {
    await wait(100);
  },
};

/** Fake port whose answers always fail with an error event. */
const failingPort: AssistantChatPort = {
  async *streamMessage(): AsyncGenerator<AssistantStreamEvent> {
    await wait(300);
    yield { type: 'error', errorCode: 'ASSISTANT_UNAVAILABLE' };
  },
  sendFeedback: async () => Promise.resolve(),
};

/** Resets the assistant store per story: panel open or closed, no tip seen yet. */
function withStore(panelOpen: boolean): Decorator {
  return function StoreReset(Story) {
    useAssistantStore.setState({ panelOpen, tipsSeen: {} });
    return <Story />;
  };
}

const meta = {
  title: 'Widgets/YarbisAssistant',
  component: YarbisAssistant,
  parameters: { layout: 'fullscreen' },
  args: {
    screen: 'inicio',
    screenTitle: 'Inicio',
    canUseAssistant: true,
    port: streamingPort,
  },
} satisfies Meta<typeof YarbisAssistant>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The FAB only; click it to open the panel with the inicio tip. */
export const Closed: Story = { decorators: [withStore(false), withServices(mockServices)] };

/** Open on Inicio with the proactive tip and the chips; asking streams a fake answer you can rate. */
export const Open: Story = { decorators: [withStore(true), withServices(mockServices)] };

/** Every answer fails: the error bubble offers "Reintentar". */
export const AnswerFails: Story = {
  decorators: [withStore(true), withServices(mockServices)],
  args: { port: failingPort },
};

/** V-46 fails: an error bubble with "Reintentar" in the panel, which stays usable for chat. */
export const ContextFails: Story = {
  decorators: [withStore(true), withServices(failingContextServices)],
};

const CONVERSATION: ChatMessage[] = [
  { id: 'm1', role: 'tip', text: INICIO_TIP_TEXT, status: 'done', citations: [] },
  {
    id: 'm2',
    role: 'user',
    text: '¿Cómo está Ecopetrol vs. pares?',
    status: 'done',
    citations: [],
  },
  {
    id: 'm3',
    role: 'assistant',
    text: ANSWER,
    status: 'done',
    citations: ['Capital IQ · T4 2025'],
    messageId: 'msg_1',
    rating: 'up',
    prompt: '¿Cómo está Ecopetrol vs. pares?',
  },
  { id: 'm4', role: 'user', text: '¿Y el margen EBITDA?', status: 'done', citations: [] },
  {
    id: 'm5',
    role: 'assistant',
    text: 'El margen EBITDA de Ecopetrol',
    status: 'streaming',
    citations: [],
    prompt: '¿Y el margen EBITDA?',
  },
];

/** The panel alone with every bubble kind: tip, question, rated answer with a citation, answer still streaming. */
export const PanelConversation: StoryObj<typeof YarbisPanel> = {
  render: () => (
    <YarbisPanel
      id="yarbis-panel-story"
      screenTitle="Resultados · Desempeño comparativo — 4T 2025"
      messages={CONVERSATION}
      suggestions={[]}
      busy
      onSend={fn()}
      onRetry={fn()}
      onRate={fn()}
      onClose={fn()}
    />
  ),
};

/** The panel with an error bubble and the retry button. */
export const PanelError: StoryObj<typeof YarbisPanel> = {
  render: () => (
    <YarbisPanel
      id="yarbis-panel-story"
      screenTitle="Inicio"
      messages={[
        { id: 'm1', role: 'user', text: 'Resume el análisis', status: 'done', citations: [] },
        {
          id: 'm2',
          role: 'assistant',
          text: '',
          status: 'error',
          errorCode: 'ASSISTANT_UNAVAILABLE',
          citations: [],
          prompt: 'Resume el análisis',
        },
      ]}
      suggestions={SUGGESTIONS}
      busy={false}
      onSend={fn()}
      onRetry={fn()}
      onRate={fn()}
      onClose={fn()}
    />
  ),
};
