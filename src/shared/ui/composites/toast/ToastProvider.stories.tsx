import { useEffect } from 'react';
import { fn } from 'storybook/test';

import { t } from '@/shared/i18n';
import { Button } from '@/shared/ui/primitives/button';

import { ToastProvider } from './ToastProvider';
import { useToast } from './use-toast';

import type { ToastVariant } from './toast-store';
import type { Meta, StoryObj } from '@storybook/react-vite';

// Copy comes from the i18n catalogue (no hard-coded UI copy); any existing key works as sample text.
const onUndo = fn();
const onExpire = fn();

function Launcher({ initial }: { initial: readonly ToastVariant[] }) {
  const toast = useToast();

  useEffect(() => {
    // Sticky copies of the requested variants so the story (and its a11y check) shows them at rest.
    for (const variant of initial) {
      if (variant === 'undo') {
        toast.undo({ message: t('analyses.status.draft'), onUndo, onExpire, durationMs: null });
      } else {
        toast.show({ variant, message: t('common.section.empty'), durationMs: null });
      }
    }
  }, [initial, toast]);

  return (
    <div className="flex flex-wrap gap-8">
      <Button variant="outline" onClick={() => toast.autosave(t('analyses.status.inProgress'))}>
        {t('analyses.status.inProgress')}
      </Button>
      <Button
        variant="outline"
        onClick={() => toast.undo({ message: t('analyses.status.draft'), onUndo, onExpire })}
      >
        {t('common.toast.undo')}
      </Button>
      <Button variant="outline" onClick={() => toast.success(t('analyses.status.published'))}>
        {t('analyses.status.published')}
      </Button>
      <Button variant="outline" onClick={() => toast.error(t('common.section.error.title'))}>
        {t('common.section.error.retry')}
      </Button>
    </div>
  );
}

const meta = {
  title: 'Composites/Toast',
  component: ToastProvider,
  args: { maxVisible: 3 },
  render: (args, { parameters }) => (
    <ToastProvider {...args}>
      <Launcher initial={(parameters.initialToasts as readonly ToastVariant[] | undefined) ?? []} />
    </ToastProvider>
  ),
} satisfies Meta<typeof ToastProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Buttons fire each variant with its default placement and duration. */
export const Playground: Story = {};

export const Autosave: Story = { parameters: { initialToasts: ['autosave'] } };

export const Undo: Story = { parameters: { initialToasts: ['undo'] } };

export const Success: Story = { parameters: { initialToasts: ['success'] } };

export const ErrorBanner: Story = { parameters: { initialToasts: ['error'] } };

export const AllVariants: Story = {
  parameters: { initialToasts: ['autosave', 'undo', 'success', 'error'] },
};
