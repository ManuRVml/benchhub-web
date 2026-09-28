import { useRef, useState } from 'react';

import {
  useUploadPresentationVersion,
  UPLOAD_EXTENSIONS,
  validateUploadFile,
} from '@/entities/presentation';
import { useT } from '@/shared/i18n';
import { Modal } from '@/shared/ui/composites/modal';
import { useToast } from '@/shared/ui/composites/toast';
import { Button } from '@/shared/ui/primitives/button';

import type { ChangeEvent } from 'react';

export interface PresentationUploadModalProps {
  presentationId: string;
  /** `true` when a version is already uploaded (SCR-13 "Reemplazar" vs. "Cargar"); only changes the title copy. */
  replacing?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  testId?: string;
}

type Step = 'select' | 'confirm' | 'loading' | 'done';

/**
 * OVL-07a: pick a .ppt/.pptx file (client-side extension + 50 MB check, defense in depth — the BFF still validates),
 * confirm the replacement, then C-30 (multipart). Wrong type and over-size are reported as Toasts, per the task; the
 * file picker never advances past `select` for either.
 */
export function PresentationUploadModal({
  presentationId,
  replacing = false,
  open,
  onOpenChange,
  trigger,
  testId = 'presentation-upload',
}: PresentationUploadModalProps) {
  const t = useT();
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>('select');
  const [file, setFile] = useState<File | null>(null);
  const uploadMutation = useUploadPresentationVersion(presentationId);

  const reset = () => {
    setStep('select');
    setFile(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange?.(next);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0];
    if (!picked) return;
    const rejection = validateUploadFile(picked);
    if (rejection === 'invalid-type') {
      toast.error(t('presentations.upload.errors.invalidType'));
      event.target.value = '';
      return;
    }
    if (rejection === 'too-large') {
      toast.error(t('presentations.upload.errors.tooLarge'));
      event.target.value = '';
      return;
    }
    setFile(picked);
    setStep('confirm');
  };

  const handleConfirm = () => {
    if (!file) return;
    setStep('loading');
    uploadMutation.mutate(file, {
      onSuccess: () => {
        setStep('done');
      },
      onError: () => {
        toast.error(t('presentations.upload.errors.uploadError'));
        setStep('confirm');
      },
    });
  };

  const controlled = open === undefined ? {} : { open };
  const fileName = file?.name ?? '';

  return (
    <Modal
      {...controlled}
      onOpenChange={handleOpenChange}
      {...(trigger === undefined ? {} : { trigger })}
      title={t(replacing ? 'presentations.upload.replaceTitle' : 'presentations.upload.title')}
      description={t('presentations.upload.subtitle')}
      testId={testId}
      closeOnEscape={step !== 'loading'}
      closeOnOverlayClick={step !== 'loading'}
      footer={
        step === 'select' ? null : (
          <>
            {step === 'confirm' ? (
              <Button
                variant="outline"
                testId={`${testId}-choose-another`}
                onClick={() => {
                  reset();
                }}
              >
                {t('presentations.upload.chooseAnother')}
              </Button>
            ) : null}
            {step === 'confirm' ? (
              <Button testId={`${testId}-confirm`} onClick={handleConfirm}>
                {t('presentations.upload.confirmButton')}
              </Button>
            ) : null}
            {step === 'done' ? (
              <Button
                variant="outline"
                testId={`${testId}-close`}
                onClick={() => {
                  handleOpenChange(false);
                }}
              >
                {t('presentations.upload.close')}
              </Button>
            ) : null}
          </>
        )
      }
    >
      {step === 'select' ? (
        <div>
          <p className="text-small text-text-secondary">{t('presentations.upload.maxSize')}</p>
          <input
            ref={inputRef}
            data-testid={`${testId}-input`}
            type="file"
            accept={UPLOAD_EXTENSIONS.join(',')}
            aria-label={t('presentations.upload.dropzoneLabel')}
            className="sr-only"
            onChange={handleFileChange}
          />
          <Button
            variant="outline"
            className="mt-8"
            testId={`${testId}-select`}
            onClick={() => {
              inputRef.current?.click();
            }}
          >
            {t('presentations.upload.selectButton')}
          </Button>
        </div>
      ) : null}

      {step === 'confirm' ? (
        <div>
          <p className="text-body text-text-body">{fileName}</p>
          <p className="mt-8 text-small text-text-secondary">
            {t('presentations.upload.confirmWarning')}
          </p>
        </div>
      ) : null}

      {step === 'loading' ? (
        <p data-testid={`${testId}-progress`} className="text-body text-text-body" aria-busy="true">
          {t('presentations.upload.loading', { fileName })}
        </p>
      ) : null}

      {step === 'done' ? (
        <p data-testid={`${testId}-done`} className="text-body text-text-body">
          {t('presentations.upload.done', { fileName })}
        </p>
      ) : null}
    </Modal>
  );
}
