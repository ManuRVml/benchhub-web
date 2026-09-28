import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useServices } from '@/shared/api';

import { presentationQueryKeys } from './presentation-views';
import { presentationBuilderQueryKeys } from './use-presentation-builder-view';

import type { PresentationBuilder, PresentationTemplateId } from './use-presentation-builder-view';
import type { C31Response, PresentationCommands } from '@/shared/api';

/**
 * What the builder UI patches (C-28, "PATCH merges only the provided keys"): `meta` may carry any subset of its
 * fields, because the form sends the one field the analyst just edited.
 */
export interface UpdatePresentationBuilderBody {
  meta?: Partial<{
    title: string;
    date: string | null;
    language: 'es' | 'en';
    templateId: PresentationTemplateId | null;
  }>;
  includeCover?: boolean;
  includeClosing?: boolean;
  modules?: { id: string; charts: { id: string; isSelected: boolean }[] }[];
  /** Per-slide notes keyed `moduleId|chartId` ("Comentarios por slide"); the whole map is sent. */
  notes?: Record<string, string>;
}

type UpdatePresentationRequest = Parameters<PresentationCommands['updatePresentation']>[1];

/**
 * C-28 — PATCH the builder (autosave, or the reorder `modules[]` patch of OVL-06, CF-109), through the typed port.
 * Two differences between what the UI patches and what the vendored 0.1.0 request type allows, both handled here:
 * - `meta` is a complete object in the contract (title, date, language, templateId), while the form patches one field
 *   at a time: a partial `meta` is completed from the cached V-41 builder (fetched if it is not cached yet), which is
 *   what the BFF's own merge would produce.
 * - `modules[].id` is the contract's closed enum, but V-41 ids are widened to any string (response-schemas.ts), so the
 *   ids read back from V-41 are passed through as they are and the BFF stays the authority on unknown ones.
 * The response is the full saved builder subset (meta, modules, includeCover, includeClosing, notes) and is merged into
 * the cached builder.
 */
export function useUpdatePresentationBuilder(presentationId: string) {
  const { presentations, presentationViews } = useServices();
  const queryClient = useQueryClient();
  const builderKey = presentationBuilderQueryKeys.builder(presentationId);
  return useMutation({
    mutationFn: async (body: UpdatePresentationBuilderBody) => {
      const { meta: patchMeta, modules, ...rest } = body;
      let meta: UpdatePresentationRequest['meta'];
      if (patchMeta !== undefined) {
        const builder = await queryClient.query({
          queryKey: builderKey,
          queryFn: () => presentationViews.getPresentationBuilderView(presentationId),
          staleTime: Infinity,
        });
        meta = { ...builder.meta, ...patchMeta };
      }
      const request: UpdatePresentationRequest = {
        ...rest,
        ...(meta === undefined ? {} : { meta }),
        ...(modules === undefined
          ? {}
          : { modules: modules as NonNullable<UpdatePresentationRequest['modules']> }),
      };
      return presentations.updatePresentation(presentationId, request);
    },
    onSuccess: (saved) => {
      // The response carries ids and selection only (no labels, no slideCount): merge it into the cached builder by id
      // so the labels V-41 gave survive the save.
      queryClient.setQueryData<PresentationBuilder>(builderKey, (prev) =>
        prev
          ? {
              ...prev,
              meta: saved.meta,
              includeCover: saved.includeCover,
              includeClosing: saved.includeClosing,
              notes: saved.notes,
              modules: saved.modules.map((module_) => {
                const original = prev.modules.find((candidate) => candidate.id === module_.id);
                return {
                  id: module_.id,
                  label: original?.label ?? module_.id,
                  charts: module_.charts.map((chart) => ({
                    id: chart.id,
                    label:
                      original?.charts.find((candidate) => candidate.id === chart.id)?.label ??
                      chart.id,
                    isSelected: chart.isSelected,
                  })),
                };
              }),
            }
          : prev,
      );
    },
  });
}

/** C-29 — publish the presentation. */
export function usePublishPresentation(presentationId: string) {
  const { presentations } = useServices();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => presentations.publishPresentation(presentationId, {}),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: presentationBuilderQueryKeys.builder(presentationId),
        }),
        queryClient.invalidateQueries({ queryKey: presentationQueryKeys.detail(presentationId) }),
      ]),
  });
}

/** C-31 — remove the uploaded PPT version ("Quitar"), reverting to the generated slides. */
export function useRemoveUploadedVersion(presentationId: string) {
  const { presentations } = useServices();
  const queryClient = useQueryClient();
  return useMutation<C31Response, unknown>({
    mutationFn: () => presentations.deletePresentationVersion(presentationId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: presentationBuilderQueryKeys.builder(presentationId),
      }),
  });
}
