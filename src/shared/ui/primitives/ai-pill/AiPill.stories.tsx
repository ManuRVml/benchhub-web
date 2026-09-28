import { t } from '@/shared/i18n';

import { AiPill } from './AiPill';

import type { Meta, StoryObj } from '@storybook/react-vite';

// Labels come from the i18n catalogue (no hard-coded UI copy); any existing common key works as sample text. The
// "✦" glyph is added by the component.
const meta = {
  title: 'Primitives/AiPill',
  component: AiPill,
  args: { children: t('common.analysisTabs.results'), size: 'md' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
} satisfies Meta<typeof AiPill>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Action row pill ("✦ Generar narrativa ejecutiva"). */
export const Medium: Story = {};

/** Module header pill ("✦ Narrativa"). */
export const Small: Story = { args: { size: 'sm' } };

/** "✦ Recomendaciones de Yarbis (n)". */
export const WithCount: Story = { args: { count: 3 } };

/** Pulses (`motion.duration.aiPulse`); no pulse when the OS asks for reduced motion. */
export const Pulse: Story = { args: { pulse: true } };

export const Loading: Story = { args: { loading: true } };

/** Hover: moves the pointer over the pill (a static screenshot shows :hover only with a real pointer). */
export const Hover: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.hover(canvas.getByRole('button'));
  },
};

/** Focus-visible: tabs to the pill, so the `focus.color` ring shows. */
export const FocusVisible: Story = {
  play: async ({ userEvent }) => {
    await userEvent.tab();
  },
};

export const Disabled: Story = { args: { disabled: true } };
