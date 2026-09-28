import { useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import {
  runSlideCommentBatch,
  TEMPLATE_ACCENT,
  useGenerateSlideCommentDraft,
  usePresentationBuilderView,
  useUpdatePresentationBuilder,
} from '@/entities/presentation';
import { PresentationComments, PresentationVersionBox } from '@/features/presentation-comments';
import { PresentationDownloadModal } from '@/features/presentation-download';
import { PresentationPreviewModal } from '@/features/presentation-preview';
import { PresentationPublishConfirm } from '@/features/presentation-publish';
import { PresentationUploadModal } from '@/features/presentation-upload';
import { SlideNotes } from '@/features/slide-notes';
import { routes } from '@/shared/config';
import { useT } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { useDebouncedAutosave } from '@/shared/lib/autosave';
import { Alert } from '@/shared/ui/composites/alert';
import { InfoToggle, InlineInfoPanel } from '@/shared/ui/composites/section-card';
import { useToast } from '@/shared/ui/composites/toast';
import { AiPill } from '@/shared/ui/primitives/ai-pill';
import { Badge } from '@/shared/ui/primitives/badge';
import { Button } from '@/shared/ui/primitives/button';
import { Chip } from '@/shared/ui/primitives/chip';
import {
  groupSelectionState,
  GroupSelectToggle,
  toggleGroupSelection,
} from '@/shared/ui/primitives/group-select-toggle';
import { DateInput, TextField } from '@/shared/ui/primitives/inputs';

import { TemplatePreview } from './TemplatePreview';
import { presentationBuilderTestIds } from './test-ids';

import type {
  BuilderModule,
  PresentationBuilder,
  PresentationTemplateId,
  UpdatePresentationBuilderBody,
} from '@/entities/presentation';

export interface PresentationBuilderFormProps {
  presentationId: string;
}

/** `moduleId|chartId`, the same composite key the builder's `notes` map and C-32 `slideKey` use. */
const chartKey = (moduleId: string, chartId: string) => `${moduleId}|${chartId}`;

/** Every chart of every module as `moduleId|chartId` keys, in module/chart order. */
function allChartKeys(modules: readonly BuilderModule[]): string[] {
  return modules.flatMap((module) => module.charts.map((chart) => chartKey(module.id, chart.id)));
}

/** The full `modules[]` patch (C-28 shape) from the current selection. */
function modulesPatch(
  modules: readonly BuilderModule[],
  selectedKeys: ReadonlySet<string>,
): NonNullable<UpdatePresentationBuilderBody['modules']> {
  return modules.map((module) => ({
    id: module.id,
    charts: module.charts.map((chart) => ({
      id: chart.id,
      isSelected: selectedKeys.has(chartKey(module.id, chart.id)),
    })),
  }));
}

interface BuilderFormState {
  title: string;
  date: string;
  language: 'es' | 'en';
  templateId: PresentationTemplateId | null;
  includeCover: boolean;
  includeClosing: boolean;
  selectedChartKeys: string[];
}

function initialFormState(builder: PresentationBuilder): BuilderFormState {
  return {
    title: builder.meta.title,
    date: builder.meta.date ?? '',
    language: builder.meta.language,
    templateId: builder.meta.templateId,
    includeCover: builder.includeCover,
    includeClosing: builder.includeClosing,
    selectedChartKeys: builder.modules.flatMap((module) =>
      module.charts
        .filter((chart) => chart.isSelected)
        .map((chart) => chartKey(module.id, chart.id)),
    ),
  };
}

const LANGUAGES = [
  { id: 'es', labelKey: 'presentations.builder.languageOptions.spanish' },
  { id: 'en', labelKey: 'presentations.builder.languageOptions.english' },
] as const satisfies readonly { id: 'es' | 'en'; labelKey: string }[];

/** Sentence-case field label of the builder (HTML L2397: 500 12px, `text.body`). */
const LABEL_CLASS = 'text-small-medium text-text-body';

/**
 * SCR-13 builder (V-41) as the prototype's "Nueva presentación" card (HTML L2392-2591), on its own route
 * (`/presentaciones/:id/editar`, CF-145): Título + Fecha, Idioma, the three "Tipo de presentación" cards, "Tipos de
 * slides a incluir" (slide count, "✦ Redactar comentarios con Yarbis (n)", Seleccionar todo · Limpiar, Portada /
 * Cierre, one card per slide group with its "Comentarios por slide"), "Versión PPT cargada", the V-26 "Comentarios"
 * thread and the footer (Previsualizar y ordenar · ↑ Cargar PPT · ↓ Descargar · Publicar presentación). Every field
 * autosaves through C-28 (500 ms debounce, one PATCH per burst, `useDebouncedAutosave`); drafts are C-32. The slide
 * count and the pending-note count re-count locally from the selection (V-41 "Front-only").
 */
export function PresentationBuilderForm({ presentationId }: PresentationBuilderFormProps) {
  const t = useT();
  const navigate = useNavigate();
  const toast = useToast();
  const { data, isLoading, error } = usePresentationBuilderView(presentationId);
  const updateBuilder = useUpdatePresentationBuilder(presentationId);
  const generateDraft = useGenerateSlideCommentDraft();

  // Seeded once from the first successful load; later refetches never overwrite the analyst's own edits (the
  // "adjusting state when a prop changes" pattern — a conditional setState during render, not in an effect).
  const [form, setForm] = useState<BuilderFormState | null>(null);
  const [notes, setNotes] = useState<Record<string, string> | null>(null);
  if (form === null && data) {
    setForm(initialFormState(data));
    setNotes({ ...data.notes });
  }

  const [draftingKeys, setDraftingKeys] = useState<ReadonlySet<string>>(new Set());
  const [draftError, setDraftError] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const pending = useRef<UpdatePresentationBuilderBody>({});
  const autosave = useDebouncedAutosave<UpdatePresentationBuilderBody>(
    async (body) => {
      pending.current = {};
      await updateBuilder.mutateAsync(body);
    },
    {
      onError: () => {
        toast.error(t('common.draftWizard.autosaveError'));
      },
    },
  );

  const schedule = (patch: UpdatePresentationBuilderBody) => {
    const meta = { ...pending.current.meta, ...patch.meta };
    pending.current = {
      ...pending.current,
      ...patch,
      ...(Object.keys(meta).length > 0 ? { meta } : {}),
    };
    autosave.schedule(pending.current);
  };

  const templateInfoId = useId();
  const templateToggleId = useId();
  const slidesInfoId = useId();
  const slidesTitleId = useId();
  const headingId = useId();
  const [templateInfoOpen, setTemplateInfoOpen] = useState(false);
  const [slidesInfoOpen, setSlidesInfoOpen] = useState(false);

  if (error) {
    return (
      <p role="alert" className="rounded-card bg-status-danger-bg p-16 text-status-danger-text">
        {t('common.section.error.title')}
      </p>
    );
  }

  if (isLoading || form === null || notes === null || !data) {
    return (
      <div
        data-testid={`${presentationBuilderTestIds.root}-loading`}
        className="h-320 animate-pulse rounded-card bg-surface-page motion-reduce:animate-none"
      />
    );
  }

  const canEdit = data.permissions.canEdit === true;
  const canUpload = data.permissions.canUpload === true;
  const canPublish = data.permissions.canPublish === true;
  const canDraftWithAssistant = data.permissions.canDraftWithAssistant === true;
  const selectedKeys = new Set(form.selectedChartKeys);
  const slideCount =
    form.selectedChartKeys.length + (form.includeCover ? 1 : 0) + (form.includeClosing ? 1 : 0);
  const pendingNoteKeys = form.selectedChartKeys.filter((key) => !notes[key]);

  const setModules = (nextKeys: string[]) => {
    setForm({ ...form, selectedChartKeys: nextKeys });
    schedule({ modules: modulesPatch(data.modules, new Set(nextKeys)) });
  };

  const writeNotes = (next: Record<string, string>) => {
    setNotes(next);
    schedule({ notes: next });
  };
  const saveNote = (slideKey: string, text: string) => {
    writeNotes({ ...notes, [slideKey]: text });
  };
  const removeNote = (slideKey: string) => {
    const { [slideKey]: _removed, ...rest } = notes;
    writeNotes(rest);
  };
  const markDrafting = (keys: readonly string[], on: boolean) => {
    setDraftingKeys((previous) => {
      const next = new Set(previous);
      for (const key of keys) {
        if (on) next.add(key);
        else next.delete(key);
      }
      return next;
    });
  };
  const requestDraft = (slideKey: string) =>
    generateDraft.mutateAsync({ presentationId, slideKey, language: form.language });

  const draftOne = async (slideKey: string): Promise<string | undefined> => {
    setDraftError(false);
    markDrafting([slideKey], true);
    try {
      return (await requestDraft(slideKey)).text;
    } catch {
      setDraftError(true);
      return undefined;
    } finally {
      markDrafting([slideKey], false);
    }
  };

  const draftAll = async () => {
    const keys = pendingNoteKeys;
    // Drafts accumulate on the notes as they were when the batch started (one C-28 autosave per burst).
    let drafted: Record<string, string> = { ...notes };
    setDraftError(false);
    markDrafting(keys, true);
    const { aggregateError } = await runSlideCommentBatch({
      slideKeys: keys,
      generateDraft: async (slideKey) => {
        const draft = await requestDraft(slideKey);
        drafted = { ...drafted, [slideKey]: draft.text };
        writeNotes(drafted);
        markDrafting([slideKey], false);
        return draft;
      },
    });
    markDrafting(keys, false);
    if (aggregateError !== undefined) setDraftError(true);
  };

  return (
    <div className="grid gap-20">
      {/* The prototype's toggle above the card (HTML L2389): back to the list. */}
      <Button
        variant="primary"
        className="justify-self-start"
        onClick={() => {
          void navigate(routes.presentations.build());
        }}
        testId={presentationBuilderTestIds.cancel}
      >
        {t('presentations.list.buttons.cancel')}
      </Button>

      <section
        aria-labelledby={headingId}
        data-testid={presentationBuilderTestIds.root}
        className="grid gap-20 rounded-card border border-border-default bg-surface-card p-24"
      >
        <h2 id={headingId} className="text-title-card text-text-heading">
          {data.meta.title === ''
            ? t('presentations.builder.heading.new')
            : t('presentations.builder.heading.edit')}
        </h2>

        <div
          className="grid grid-cols-1 gap-16 laptop:grid-cols-[2fr_1fr]"
          data-testid={presentationBuilderTestIds.titleRow}
        >
          <TextField
            label={t('presentations.builder.title')}
            value={form.title}
            placeholder={t('presentations.builder.titlePlaceholder')}
            disabled={!canEdit}
            onValueChange={(title) => {
              setForm({ ...form, title });
              schedule({ meta: { title } });
            }}
            testId={presentationBuilderTestIds.title}
          />
          <DateInput
            label={t('presentations.builder.date')}
            value={form.date}
            disabled={!canEdit}
            onValueChange={(date) => {
              setForm({ ...form, date });
              schedule({ meta: { date: date === '' ? null : date } });
            }}
            testId={presentationBuilderTestIds.date}
          />
        </div>

        <div className="flex flex-col gap-8">
          <p className={cn('m-0', LABEL_CLASS)}>{t('presentations.builder.language')}</p>
          <div role="group" aria-label={t('presentations.builder.language')} className="flex gap-8">
            {LANGUAGES.map((language) => (
              <Chip
                key={language.id}
                variant="choice"
                selected={form.language === language.id}
                disabled={!canEdit}
                onPressedChange={(pressed) => {
                  if (!pressed) return;
                  setForm({ ...form, language: language.id });
                  schedule({ meta: { language: language.id } });
                }}
                data-testid={presentationBuilderTestIds.languageChip(language.id)}
              >
                {t(language.labelKey)}
              </Chip>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-6">
            <p className={cn('m-0', LABEL_CLASS)}>{t('presentations.builder.template')}</p>
            <InfoToggle
              id={templateToggleId}
              expanded={templateInfoOpen}
              controls={templateInfoId}
              onToggle={() => {
                setTemplateInfoOpen((open) => !open);
              }}
              testId="presentation-builder-template-info-toggle"
            />
          </div>
          <InlineInfoPanel
            id={templateInfoId}
            labelledBy={templateToggleId}
            open={templateInfoOpen}
          >
            {t('presentations.builder.templateInfo')}
          </InlineInfoPanel>
          <div
            className="grid grid-cols-1 gap-16 tablet:grid-cols-3"
            data-testid={presentationBuilderTestIds.templates}
          >
            {data.templates.map((template) => {
              // V-41 `templateId: null` renders as Directorio.
              const selected = (form.templateId ?? 'directorio') === template.id;
              const accent = TEMPLATE_ACCENT[template.id];
              return (
                <button
                  key={template.id}
                  type="button"
                  aria-pressed={selected}
                  disabled={!canEdit}
                  onClick={() => {
                    setForm({ ...form, templateId: template.id });
                    schedule({ meta: { templateId: template.id } });
                  }}
                  style={selected ? { borderColor: `var(${accent.glowVar})` } : undefined}
                  className={cn(
                    'flex cursor-pointer flex-col overflow-hidden rounded-card border-2 bg-surface-card text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus disabled:cursor-not-allowed disabled:opacity-50',
                    selected ? '' : 'border-border-default hover:border-text-secondary',
                  )}
                  data-testid={presentationBuilderTestIds.template(template.id)}
                >
                  <TemplatePreview templateId={template.id} />
                  <span className="grid gap-4 p-14">
                    <span className="text-13 font-semibold text-text-heading">{template.name}</span>
                    <span className="text-small text-text-muted">{template.description}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <section aria-labelledby={slidesTitleId} className="grid gap-10">
          <div className="flex flex-wrap items-center justify-between gap-12">
            <div className="flex items-center gap-6">
              <h3 id={slidesTitleId} className={LABEL_CLASS}>
                {t('presentations.builder.slides.title')}
              </h3>
              <InfoToggle
                expanded={slidesInfoOpen}
                controls={slidesInfoId}
                describedBy={slidesTitleId}
                onToggle={() => {
                  setSlidesInfoOpen((open) => !open);
                }}
                testId="presentation-builder-slides-info-toggle"
              />
              <Badge
                kind="count"
                countTone="brand"
                data-testid={presentationBuilderTestIds.slideCountBadge}
              >
                {t('presentations.builder.slides.badge', { count: slideCount })}
              </Badge>
            </div>
            <div className="flex items-center gap-12">
              {canEdit && canDraftWithAssistant && pendingNoteKeys.length > 0 ? (
                draftingKeys.size > 0 ? (
                  <span className="text-11 font-semibold text-ai-text" aria-live="polite">
                    {t('presentations.yarbis.draft.drafting')}
                  </span>
                ) : (
                  <AiPill
                    size="sm"
                    count={pendingNoteKeys.length}
                    onClick={() => void draftAll()}
                    testId={presentationBuilderTestIds.draftAll}
                  >
                    {t('presentations.yarbis.draft.batchLabel')}
                  </AiPill>
                )
              ) : null}
              <Button
                variant="link"
                size="sm"
                disabled={!canEdit}
                onClick={() => {
                  setModules(allChartKeys(data.modules));
                }}
                testId={presentationBuilderTestIds.selectAll}
              >
                {t('presentations.builder.slides.selectAll')}
              </Button>
              <Button
                variant="link"
                size="sm"
                className="text-text-secondary"
                disabled={!canEdit}
                onClick={() => {
                  setModules([]);
                }}
                testId={presentationBuilderTestIds.clear}
              >
                {t('presentations.builder.slides.clear')}
              </Button>
            </div>
          </div>
          {draftError ? (
            <Alert
              variant="danger"
              onClose={() => {
                setDraftError(false);
              }}
              data-testid={presentationBuilderTestIds.draftError}
            >
              {t('presentations.banners.yarbisError')}
            </Alert>
          ) : null}
          <InlineInfoPanel id={slidesInfoId} labelledBy={slidesTitleId} open={slidesInfoOpen}>
            {t('presentations.builder.slides.info')}
          </InlineInfoPanel>

          <div className="flex gap-8">
            <Chip
              variant="soft"
              selected={form.includeCover}
              disabled={!canEdit}
              onPressedChange={(pressed) => {
                setForm({ ...form, includeCover: pressed });
                schedule({ includeCover: pressed });
              }}
              data-testid={presentationBuilderTestIds.cover}
            >
              {t('presentations.builder.cover')}
            </Chip>
            <Chip
              variant="soft"
              selected={form.includeClosing}
              disabled={!canEdit}
              onPressedChange={(pressed) => {
                setForm({ ...form, includeClosing: pressed });
                schedule({ includeClosing: pressed });
              }}
              data-testid={presentationBuilderTestIds.closing}
            >
              {t('presentations.builder.closing')}
            </Chip>
          </div>

          <div className="grid gap-8">
            {data.modules.map((module) => {
              const memberIds = module.charts.map((chart) => chartKey(module.id, chart.id));
              const state = groupSelectionState(memberIds, form.selectedChartKeys);
              const selectedCharts = module.charts.filter((chart) =>
                selectedKeys.has(chartKey(module.id, chart.id)),
              );
              const on = selectedCharts.length > 0;
              return (
                <div
                  key={module.id}
                  data-testid={presentationBuilderTestIds.group(module.id)}
                  data-selected={on}
                  className={cn(
                    'grid gap-10 rounded-md border px-14 py-12',
                    on
                      ? 'border-brand-primary-border bg-brand-primary-faint'
                      : 'border-border-default bg-surface-card',
                  )}
                >
                  <div className="flex items-center gap-10">
                    <GroupSelectToggle
                      state={state}
                      disabled={!canEdit}
                      onToggle={() => {
                        setModules(toggleGroupSelection(memberIds, form.selectedChartKeys));
                      }}
                      aria-label={t('presentations.builder.module.toggleGroup', {
                        module: module.label,
                      })}
                      testId={presentationBuilderTestIds.moduleToggle(module.id)}
                    />
                    <span className="min-w-0 flex-1 text-13 font-semibold text-text-heading">
                      {module.label}
                    </span>
                    <span className="shrink-0 text-11 font-medium text-text-muted">
                      {t('presentations.builder.module.charts', {
                        on: selectedCharts.length,
                        total: module.charts.length,
                      })}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-6 pl-28">
                    {module.charts.map((chart) => {
                      const key = chartKey(module.id, chart.id);
                      const selected = selectedKeys.has(key);
                      return (
                        <Chip
                          key={chart.id}
                          variant="soft"
                          size="sm"
                          selected={selected}
                          disabled={!canEdit}
                          onPressedChange={(pressed) => {
                            setModules(
                              pressed
                                ? [...form.selectedChartKeys, key]
                                : form.selectedChartKeys.filter((k) => k !== key),
                            );
                          }}
                          data-testid={presentationBuilderTestIds.chart(module.id, chart.id)}
                        >
                          <span aria-hidden="true">{selected ? '✓' : '+'}</span>
                          {chart.label}
                        </Chip>
                      );
                    })}
                  </div>
                  <div className="pl-28">
                    <SlideNotes
                      rows={selectedCharts.map((chart) => ({
                        slideKey: chartKey(module.id, chart.id),
                        label: chart.label,
                      }))}
                      notes={notes}
                      draftingKeys={draftingKeys}
                      canEdit={canEdit}
                      canDraft={canDraftWithAssistant}
                      onSave={saveNote}
                      onRemove={removeNote}
                      onDraft={draftOne}
                      testId={presentationBuilderTestIds.notes(module.id)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <PresentationVersionBox
          presentationId={presentationId}
          uploadedVersion={data.uploadedVersion}
          canUpload={canUpload}
          onUpload={() => {
            setUploadOpen(true);
          }}
        />

        <PresentationComments
          presentationId={presentationId}
          canComment={canEdit}
          count={data.commentCount}
          variant="builder"
          testId={presentationBuilderTestIds.comments}
        />

        <div
          className="flex flex-wrap items-center justify-end gap-8 border-t border-border-subtle pt-18"
          data-testid={presentationBuilderTestIds.footer}
        >
          <Button
            variant="outline"
            onClick={() => {
              setPreviewOpen(true);
            }}
            testId={presentationBuilderTestIds.preview}
          >
            {t('presentations.builder.footer.previewAndOrder')}
          </Button>
          {/* Mounted only while open: OVL-06 reads V-43 / V-42, which the builder itself never needs. */}
          {previewOpen ? (
            <PresentationPreviewModal
              presentationId={presentationId}
              open
              onOpenChange={setPreviewOpen}
              onDownload={() => {
                setPreviewOpen(false);
                setDownloadOpen(true);
              }}
            />
          ) : null}
          {canUpload ? (
            <Button
              variant="outline"
              onClick={() => {
                setUploadOpen(true);
              }}
              testId={presentationBuilderTestIds.upload}
            >
              {t('presentations.builder.footer.upload')}
            </Button>
          ) : null}
          <PresentationDownloadModal
            presentationId={presentationId}
            open={downloadOpen}
            onOpenChange={setDownloadOpen}
            trigger={
              <Button variant="outline" testId={presentationBuilderTestIds.download}>
                {t('presentations.builder.footer.download')}
              </Button>
            }
          />
          {canPublish ? (
            <PresentationPublishConfirm
              presentationId={presentationId}
              trigger={
                <Button variant="cyan" testId={presentationBuilderTestIds.publish}>
                  {t('presentations.builder.footer.publish')}
                </Button>
              }
            />
          ) : null}
        </div>
      </section>

      {canUpload ? (
        <PresentationUploadModal
          presentationId={presentationId}
          replacing={data.uploadedVersion !== null}
          open={uploadOpen}
          onOpenChange={setUploadOpen}
        />
      ) : null}
    </div>
  );
}
