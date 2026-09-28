import { useCallback, useState } from 'react';

import { useRemoveUploadedVersion } from '@/entities/presentation';
import { useT } from '@/shared/i18n';
import { formatDate } from '@/shared/lib/format';
import { Modal } from '@/shared/ui/composites/modal';
import { useToast } from '@/shared/ui/composites/toast';
import { Button } from '@/shared/ui/primitives/button';

import type { PresentationBuilder } from '@/entities/presentation';

export interface PresentationVersionBoxProps {
  presentationId: string;
  /** V-41's `uploadedVersion` field ({fileName, sizeLabel, uploadedAt} | null) — not the C-30 upload response. */
  uploadedVersion: PresentationBuilder['uploadedVersion'];
  /** V-41 `permissions.canUpload`: "Cargar" / "Reemplazar" / "Quitar". */
  canUpload: boolean;
  /**
   * Opens the upload flow (OVL-07a, `PresentationUploadModal` → C-30 `use-presentation-upload.ts`). The composing widget
   * owns that modal: a feature may not import another feature.
   */
  onUpload: () => void;
  testId?: string;
}

/**
 * SCR-13 builder "Versión PPT cargada" (HTML L2537-2558): without an upload, a dashed panel with the hint and
 * "↑ Cargar versión PPT"; with one, the green file panel (PPT tile, name, "Reemplaza la versión generada · size ·
 * cargada date") with "Reemplazar" (upload flow again) and "Quitar" (C-31 after a confirmation Modal).
 */
export function PresentationVersionBox({
  presentationId,
  uploadedVersion,
  canUpload,
  onUpload,
  testId = 'presentation-version',
}: PresentationVersionBoxProps) {
  const t = useT();
  const toast = useToast();
  const headingId = `${testId}-title`;
  const [confirmRemove, setConfirmRemove] = useState(false);
  const remove = useRemoveUploadedVersion(presentationId);

  const handleRemove = useCallback(() => {
    remove.mutate(undefined, {
      onSuccess: () => {
        setConfirmRemove(false);
        toast.success(t('presentations.builder.ppt.remove'));
      },
      onError: () => {
        toast.error(t('presentations.upload.errors.uploadError'));
      },
    });
  }, [remove, toast, t]);

  return (
    <section aria-labelledby={headingId} className="grid gap-8" data-testid={testId}>
      <h3 id={headingId} className="text-small-medium text-text-body">
        {t('presentations.builder.ppt.title')}
      </h3>
      {uploadedVersion ? (
        <div
          className="flex flex-wrap items-center gap-12 rounded-md border border-status-success-uploaded-border bg-status-success-uploaded-bg px-16 py-12"
          data-testid={`${testId}-uploaded`}
        >
          <span
            aria-hidden="true"
            className="flex size-32 shrink-0 items-center justify-center rounded-control bg-file-ppt-tile text-micro-strong text-text-inverse"
          >
            {t('presentations.builder.ppt.fileTag')}
          </span>
          <div className="min-w-0 flex-1">
            <p className="m-0 text-13 font-semibold text-text-heading">
              {uploadedVersion.fileName}
            </p>
            <p className="m-0 text-11 text-status-success-text">
              {t('presentations.builder.ppt.uploadedLine', {
                size: uploadedVersion.sizeLabel,
                date: formatDate(uploadedVersion.uploadedAt),
              })}
            </p>
          </div>
          {canUpload ? (
            <>
              <Button variant="link" size="sm" onClick={onUpload} testId={`${testId}-replace`}>
                {t('presentations.builder.ppt.replace')}
              </Button>
              <Button
                variant="link"
                size="sm"
                className="text-text-secondary"
                onClick={() => {
                  setConfirmRemove(true);
                }}
                disabled={remove.isPending}
                testId={`${testId}-remove`}
              >
                {t('presentations.builder.ppt.remove')}
              </Button>
            </>
          ) : null}
        </div>
      ) : (
        <div
          className="flex flex-wrap items-center gap-12 rounded-md border-2 border-dashed border-border-default px-16 py-14"
          data-testid={`${testId}-empty`}
        >
          <p className="m-0 min-w-0 flex-1 text-small text-text-secondary">
            {t('presentations.builder.ppt.emptyHint')}
          </p>
          {canUpload ? (
            <Button
              variant="outline"
              size="sm"
              className="border-brand-primary text-brand-primary"
              onClick={onUpload}
              testId={`${testId}-upload`}
            >
              {t('presentations.builder.ppt.upload')}
            </Button>
          ) : null}
        </div>
      )}

      <Modal
        open={confirmRemove}
        onOpenChange={setConfirmRemove}
        title={t('presentations.builder.ppt.remove')}
        description={t('presentations.upload.confirmWarning')}
        width={440}
        testId={`${testId}-remove-confirm`}
        footer={
          <>
            <Button
              variant="outline"
              testId={`${testId}-remove-cancel`}
              onClick={() => {
                setConfirmRemove(false);
              }}
            >
              {t('presentations.list.buttons.cancel')}
            </Button>
            <Button
              variant="primary"
              testId={`${testId}-remove-confirm-button`}
              onClick={handleRemove}
              loading={remove.isPending}
            >
              {t('presentations.builder.ppt.remove')}
            </Button>
          </>
        }
      />
    </section>
  );
}
