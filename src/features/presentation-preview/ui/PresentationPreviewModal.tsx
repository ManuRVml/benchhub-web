import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';

import {
  COVER_KEY,
  CLOSING_KEY,
  flattenBuilderOrder,
  moveOrderItem,
  reorderModules,
  usePresentationBuilderView,
  usePresentationDetail,
  usePresentationSlides,
  useUpdatePresentationBuilder,
  SlideRenderer,
  slideKey,
  slideLabel,
  slideModuleLabel,
} from '@/entities/presentation';
import { useT } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { ArrowDownIcon, ArrowUpIcon } from '@/shared/ui/icons';
import { Button } from '@/shared/ui/primitives/button';
import { IconButton } from '@/shared/ui/primitives/icon-button';

import type { Slide } from '@/entities/presentation';
import type { ReactNode } from 'react';

export interface PresentationPreviewModalProps {
  presentationId: string;
  /** Controlled open state; omit together with `onOpenChange` for an uncontrolled trigger-driven modal. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Element that opens the modal (rendered through `Dialog.Trigger asChild`). */
  trigger?: ReactNode;
  /** "↓ Descargar con este orden" (OVL-06); omitted, the button is not shown — the composing page wires it to the download feature. */
  onDownload?: () => void;
  testId?: string;
}

function orderLabel(slides: readonly Slide[] | undefined, key: string): Slide | undefined {
  return slides?.find((slide) => slideKey(slide) === key);
}

/** `note` only exists on non-`empty` slide kinds; `EmptySlide` carries none. */
function slideNote(slide: Slide | undefined): string | undefined {
  return slide && 'note' in slide ? slide.note : undefined;
}

/**
 * OVL-06 preview & reorder: a 1180px two-pane dialog (wider than the shared `Modal`'s 640px cap, so it is built
 * directly on Radix Dialog rather than editing `shared/ui`). Left pane lists the deck's flat slide-key order with
 * ▲▼ reorder controls; right pane shows the current slide via the shared `SlideRenderer`. A move updates the local
 * order immediately (optimistic), PATCHes the builder via C-28, and rolls the order back if the PATCH fails.
 */
export function PresentationPreviewModal({
  presentationId,
  open,
  onOpenChange,
  trigger,
  onDownload,
  testId = 'presentation-preview',
}: PresentationPreviewModalProps) {
  const t = useT();
  const detailQuery = usePresentationDetail(presentationId);
  const builderQuery = usePresentationBuilderView(presentationId);
  const [order, setOrder] = useState<readonly string[] | undefined>(undefined);
  const [stageIndex, setStageIndex] = useState(0);
  const slidesQuery = usePresentationSlides(
    presentationId,
    detailQuery.data?.slideRef.path,
    order ?? [],
  );
  const updateBuilder = useUpdatePresentationBuilder(presentationId);

  const builder = builderQuery.data;
  if (order === undefined && builder) {
    setOrder(flattenBuilderOrder(builder.modules, builder.includeCover, builder.includeClosing));
  }

  const controlled = open === undefined ? {} : { open };

  const handleMove = (index: number, direction: -1 | 1) => {
    if (order === undefined || !builder) return;
    const previous = order;
    const next = moveOrderItem(order, index, direction);
    setOrder(next);
    const modules = reorderModules(builder.modules, next).map((module_) => ({
      id: module_.id,
      charts: module_.charts.map((chart) => ({ id: chart.id, isSelected: chart.isSelected })),
    }));
    updateBuilder.mutate(
      { modules },
      {
        onError: () => {
          setOrder(previous);
        },
      },
    );
  };

  const handleReset = () => {
    if (!builder) return;
    setOrder(flattenBuilderOrder(builder.modules, builder.includeCover, builder.includeClosing));
  };

  const slides = slidesQuery.data?.slides;
  const total = order?.length ?? 0;
  const currentSlide = slides?.[stageIndex];
  const arrowClass =
    'grid size-(--size-control-icon-button-md) place-items-center rounded-pill bg-surface-page text-17 text-text-secondary hover:bg-border-default disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <Dialog.Root {...controlled} {...(onOpenChange ? { onOpenChange } : {})}>
      {trigger === undefined ? null : <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
      <Dialog.Portal>
        <Dialog.Overlay
          data-testid={`${testId}-overlay`}
          className="fixed inset-0 z-(--z-modal) grid place-items-center overflow-y-auto bg-overlay-scrim p-16"
        >
          <Dialog.Content
            data-testid={testId}
            className="relative grid max-h-[90vh] w-full max-w-[1180px] grid-cols-[360px_1fr] gap-24 overflow-hidden rounded-modal bg-surface-card p-24 shadow-modal"
          >
            <Dialog.Title className="sr-only">{t('presentations.preview.orderTitle')}</Dialog.Title>
            <Dialog.Description className="sr-only">
              {t('presentations.preview.hint')}
            </Dialog.Description>
            <Dialog.Close
              data-testid={`${testId}-close`}
              aria-label={t('common.a11y.closeDialog')}
              className="absolute top-16 right-16 grid size-28 place-items-center rounded-sm text-17 text-text-muted hover:text-text-secondary"
            >
              <span aria-hidden="true">✕</span>
            </Dialog.Close>

            <div className="flex min-w-0 flex-col overflow-hidden">
              <div className="flex items-center justify-between gap-8 pr-32">
                <h2 className="m-0 text-title-modal text-text-heading">
                  {t('presentations.preview.orderTitle')}
                </h2>
                <Button variant="link" testId={`${testId}-reset`} onClick={handleReset}>
                  {t('presentations.preview.reset')}
                </Button>
              </div>
              <p className="mt-4 text-small text-text-secondary">
                {t('presentations.preview.hint')}
              </p>
              <ol className="mt-16 flex-1 space-y-4 overflow-y-auto">
                {(order ?? []).map((key, index) => {
                  const slide = orderLabel(slides, key);
                  const fixed = key === COVER_KEY || key === CLOSING_KEY;
                  const canMoveUp = !fixed && index > 0 && order?.[index - 1] !== COVER_KEY;
                  const canMoveDown =
                    !fixed && index < total - 1 && order?.[index + 1] !== CLOSING_KEY;
                  const label = slideLabel(slide) ?? key;
                  return (
                    <li
                      key={key}
                      data-testid={`${testId}-row-${String(index + 1)}`}
                      className="flex items-center gap-8 rounded-sm border border-border-default p-8"
                    >
                      <span className="w-16 shrink-0 text-12 text-text-muted">{index + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-body text-text-body">{label}</p>
                        {slideNote(slide) ? (
                          <p className="truncate text-small text-text-secondary">
                            {t('presentations.preview.hasComment')}
                          </p>
                        ) : (
                          <p className="truncate text-small text-text-secondary">
                            {slideModuleLabel(slide)}
                          </p>
                        )}
                      </div>
                      <IconButton
                        aria-label={t('presentations.preview.moveUp', { label })}
                        icon={ArrowUpIcon}
                        variant="ghost"
                        size="sm"
                        disabled={!canMoveUp}
                        onClick={() => {
                          handleMove(index, -1);
                        }}
                      />
                      <IconButton
                        aria-label={t('presentations.preview.moveDown', { label })}
                        icon={ArrowDownIcon}
                        variant="ghost"
                        size="sm"
                        disabled={!canMoveDown}
                        onClick={() => {
                          handleMove(index, 1);
                        }}
                      />
                    </li>
                  );
                })}
              </ol>
              {onDownload === undefined ? null : (
                <Button
                  variant="outline"
                  fullWidth
                  className="mt-16"
                  testId={`${testId}-download`}
                  onClick={onDownload}
                >
                  {t('presentations.preview.downloadWithOrder')}
                </Button>
              )}
            </div>

            <div className="flex min-w-0 flex-col items-center overflow-hidden">
              <h3 className="m-0 self-start text-body font-medium text-text-heading">
                {t('presentations.preview.stageTitle', {
                  module: slideModuleLabel(currentSlide) ?? '',
                  n: stageIndex + 1,
                  total,
                })}
              </h3>
              <div className="mt-16 w-full">
                {detailQuery.data && currentSlide ? (
                  <SlideRenderer
                    slide={currentSlide}
                    template={{
                      templateId: detailQuery.data.meta.templateId,
                      templateName: detailQuery.data.meta.templateName,
                    }}
                    index={stageIndex}
                    total={total}
                    variant="preview"
                    testId={`${testId}-slide`}
                  />
                ) : null}
              </div>
              <div className="mt-16 flex items-center gap-6">
                <button
                  type="button"
                  data-testid={`${testId}-previous`}
                  aria-label={t('common.a11y.previousSlide')}
                  disabled={stageIndex <= 0}
                  className={arrowClass}
                  onClick={() => {
                    setStageIndex((index) => Math.max(index - 1, 0));
                  }}
                >
                  <span aria-hidden="true">{t('presentations.preview.previous')}</span>
                </button>
                <div className="flex items-center gap-6">
                  {(order ?? []).map((key, index) => (
                    <button
                      key={key}
                      type="button"
                      data-testid={`${testId}-dot-${String(index + 1)}`}
                      aria-label={slideLabel(orderLabel(slides, key)) ?? key}
                      aria-current={index === stageIndex}
                      className="grid size-20 place-items-center rounded-pill"
                      onClick={() => {
                        setStageIndex(index);
                      }}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          'size-8 rounded-pill',
                          index === stageIndex ? 'bg-brand-primary' : 'bg-border-default',
                        )}
                      />
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  data-testid={`${testId}-next`}
                  aria-label={t('common.a11y.nextSlide')}
                  disabled={stageIndex >= total - 1}
                  className={arrowClass}
                  onClick={() => {
                    setStageIndex((index) => Math.min(index + 1, total - 1));
                  }}
                >
                  <span aria-hidden="true">{t('presentations.preview.next')}</span>
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
