import { useEffect, useState } from 'react';

import {
  useExportPresentation,
  useMediatedDownload,
  useOperationStatus,
} from '@/entities/presentation';
import { useT } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { ProgressBar } from '@/shared/ui/charts/primitives';
import { Modal } from '@/shared/ui/composites/modal';
import { Button } from '@/shared/ui/primitives/button';

import type { PresentationExportKind } from '@/entities/presentation';
import type { ReactNode } from 'react';

export interface PresentationDownloadModalProps {
  presentationId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  testId?: string;
}

type Step = 'pick' | 'generating' | 'done' | 'error';

const FORMATS: readonly { kind: PresentationExportKind }[] = [
  { kind: 'presentation-pptx' },
  { kind: 'presentation-pdf' },
];

/**
 * OVL-07b: pick a format → C-14 export → poll O-01 until it settles → download the result via the mediated O-03
 * endpoint only (never a raw storage URL). Resets to the picker every time it (re)opens.
 */
export function PresentationDownloadModal({
  presentationId,
  open,
  onOpenChange,
  trigger,
  testId = 'presentation-download',
}: PresentationDownloadModalProps) {
  const t = useT();
  const [step, setStep] = useState<Step>('pick');
  const [kind, setKind] = useState<PresentationExportKind>('presentation-pptx');
  const [operationId, setOperationId] = useState<string | undefined>(undefined);

  const exportMutation = useExportPresentation(presentationId);
  const operationQuery = useOperationStatus(operationId);
  const downloadMutation = useMediatedDownload();

  const status = operationQuery.data;
  // O-01's `result` is `{targetRoute}` or `{fileId, fileName}` (generated union, no discriminant tag): a download
  // only ever settles into the file shape, never the redirect one (that belongs to other operation kinds).
  const fileResult = status?.result && 'fileId' in status.result ? status.result : undefined;

  useEffect(() => {
    if (status?.status !== 'succeeded') return;
    if (!fileResult) return;
    const { fileId, fileName } = fileResult;
    downloadMutation.mutate(
      { fileId, fileName },
      {
        onSuccess: () => {
          setStep('done');
        },
        onError: () => {
          setStep('error');
        },
      },
    );
    // Runs once per settled operation id (the mutation is not idempotent-safe to repeat on re-render).
    // A named react-hooks/exhaustive-deps disable fails `pnpm check:architecture`, which never registers that
    // plugin ("Definition for rule ... was not found") — this bare disable is exempted from the architecture
    // config's unused-directive check for this file instead (tools/architecture/eslint.architecture.config.js).
    // eslint-disable-next-line
  }, [status?.status, fileResult]);

  // Derived, not stored: "failed" is a property of the polled status, not a separate transition to track in state.
  const effectiveStep: Step = status?.status === 'failed' ? 'error' : step;

  const reset = () => {
    setStep('pick');
    setOperationId(undefined);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange?.(next);
  };

  const handleGenerate = () => {
    setStep('generating');
    exportMutation.mutate(kind, {
      onSuccess: (accepted) => {
        setOperationId(accepted.operationId);
      },
      onError: () => {
        setStep('error');
      },
    });
  };

  const controlled = open === undefined ? {} : { open };
  const fileName = fileResult?.fileName ?? '';

  return (
    <Modal
      {...controlled}
      onOpenChange={handleOpenChange}
      {...(trigger === undefined ? {} : { trigger })}
      title={t('presentations.download.title')}
      description={t('presentations.download.subtitle')}
      testId={testId}
      closeOnEscape={effectiveStep !== 'generating'}
      closeOnOverlayClick={effectiveStep !== 'generating'}
      footer={
        effectiveStep === 'pick' ? (
          <>
            <Button
              variant="outline"
              testId={`${testId}-cancel`}
              onClick={() => {
                handleOpenChange(false);
              }}
            >
              {t('presentations.download.cancel')}
            </Button>
            <Button testId={`${testId}-generate`} onClick={handleGenerate}>
              {t('presentations.download.generate')}
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            testId={`${testId}-close`}
            disabled={effectiveStep === 'generating'}
            onClick={() => {
              handleOpenChange(false);
            }}
          >
            {t('presentations.download.close')}
          </Button>
        )
      }
    >
      {effectiveStep === 'pick' ? (
        <div className="grid grid-cols-2 gap-12">
          {FORMATS.map((format) => {
            const selected = format.kind === kind;
            const isPptx = format.kind === 'presentation-pptx';
            return (
              <button
                key={format.kind}
                type="button"
                data-testid={`${testId}-format-${format.kind}`}
                aria-pressed={selected}
                className={cn(
                  'rounded-control border p-16 text-left',
                  selected ? 'border-brand-primary bg-surface-page' : 'border-border-default',
                )}
                onClick={() => {
                  setKind(format.kind);
                }}
              >
                <p className="m-0 text-body font-medium text-text-heading">
                  {isPptx
                    ? t('presentations.download.formatPptx')
                    : t('presentations.download.formatPdf')}
                </p>
                <p className="mt-4 text-small text-text-secondary">
                  {isPptx
                    ? t('presentations.download.formatPptxDescription')
                    : t('presentations.download.formatPdfDescription')}
                </p>
              </button>
            );
          })}
        </div>
      ) : null}

      {effectiveStep === 'generating' ? (
        <div data-testid={`${testId}-progress`}>
          <p className="text-body text-text-body">
            {t('presentations.download.loading', { fileName })}
          </p>
          <ProgressBar
            className="mt-8"
            value={status?.progressPct ?? null}
            aria-label={t('presentations.download.progressLabel')}
          />
        </div>
      ) : null}

      {effectiveStep === 'done' ? (
        <p data-testid={`${testId}-done`} className="text-body text-text-body">
          {t('presentations.download.done', { fileName })}
        </p>
      ) : null}

      {effectiveStep === 'error' ? (
        <p data-testid={`${testId}-error`} className="text-body text-status-danger-base">
          {t('presentations.download.error')}
        </p>
      ) : null}
    </Modal>
  );
}
