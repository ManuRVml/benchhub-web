import { usePublishPresentation } from '@/entities/presentation';
import { useT } from '@/shared/i18n';
import { Modal } from '@/shared/ui/composites/modal';
import { useToast } from '@/shared/ui/composites/toast';
import { Button } from '@/shared/ui/primitives/button';

import type { ReactNode } from 'react';

export interface PresentationPublishConfirmProps {
  presentationId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  /** Called after a successful publish (C-29), once the success Toast has already been shown. */
  onPublished?: () => void;
  testId?: string;
}

/** C-29: a confirmation step (publishing notifies invited viewers, C-29 doc "Side effects") before publishing, then a success Toast — "✓ Presentación publicada correctamente." (`presentations.banners.publishSuccess`, already used elsewhere for the same event). */
export function PresentationPublishConfirm({
  presentationId,
  open,
  onOpenChange,
  trigger,
  onPublished,
  testId = 'presentation-publish',
}: PresentationPublishConfirmProps) {
  const t = useT();
  const toast = useToast();
  const publishMutation = usePublishPresentation(presentationId);

  const controlled = open === undefined ? {} : { open };

  const handleConfirm = () => {
    publishMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success(t('presentations.banners.publishSuccess'));
        onOpenChange?.(false);
        onPublished?.();
      },
      onError: () => {
        toast.error(t('presentations.publish.error'));
      },
    });
  };

  return (
    <Modal
      {...controlled}
      {...(onOpenChange ? { onOpenChange } : {})}
      {...(trigger === undefined ? {} : { trigger })}
      title={t('presentations.publish.confirmTitle')}
      description={t('presentations.publish.confirmDescription')}
      width={440}
      testId={testId}
      footer={
        <>
          <Button
            variant="outline"
            testId={`${testId}-cancel`}
            onClick={() => {
              onOpenChange?.(false);
            }}
          >
            {t('presentations.publish.cancelButton')}
          </Button>
          <Button
            testId={`${testId}-confirm`}
            loading={publishMutation.isPending}
            onClick={handleConfirm}
          >
            {t('presentations.publish.confirmButton')}
          </Button>
        </>
      }
    />
  );
}
