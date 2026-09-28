import { useMutation, useQueryClient } from '@tanstack/react-query';

import { patchQueries, queryKeys, restoreQueries, useServices } from '@/shared/api';

import { applyValueOverrides, applyWeightOverrides } from './optimistic-patches';

import type { AnalysisDraftCommands, AnalysisEditCommands, QuerySnapshot } from '@/shared/api';

// Mutation hooks of the analysis commands (C-01..C-09). Each invalidates the views it changes: the draft views after a
// draft command, the whole per-analysis prefix (`queryKeys.analysis(id)`) after an analysis command. C-06 and C-07 also
// patch the cached views optimistically and roll back when the command fails.

type Body<F extends (...args: never[]) => unknown> = Parameters<F>[1];

/** Every analyses-list key, whatever its query (`['eco', 'analyses', …]`). */
const analysesListPrefix = queryKeys.analyses().slice(0, 2);

/** C-01 create a draft (list changes). */
export function useCreateAnalysisDraft() {
  const { analysisDrafts } = useServices();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<AnalysisDraftCommands['createAnalysisDraft']>[0]) =>
      analysisDrafts.createAnalysisDraft(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: analysesListPrefix }),
  });
}

/** C-02 autosave a wizard step (definition and validation of the draft change). */
export function useUpdateAnalysisDraft() {
  const { analysisDrafts } = useServices();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      draftId,
      body,
    }: {
      draftId: string;
      body: Body<AnalysisDraftCommands['updateAnalysisDraft']>;
    }) => analysisDrafts.updateAnalysisDraft(draftId, body),
    onSuccess: (_data, { draftId }) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.analysisDefinition(draftId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.analysisValidation(draftId) }),
      ]),
  });
}

/** C-03 generate the analysis of a valid draft (a new analysis appears in the list). */
export function useGenerateAnalysis() {
  const { analysisDrafts } = useServices();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      draftId,
      body,
    }: {
      draftId: string;
      body: Body<AnalysisDraftCommands['generateAnalysis']>;
    }) => analysisDrafts.generateAnalysis(draftId, body),
    onSuccess: (_data, { draftId }) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: analysesListPrefix }),
        queryClient.invalidateQueries({ queryKey: queryKeys.analysisDefinition(draftId) }),
      ]),
  });
}

/** C-04 add a company to the analysis set. */
export function useAddAnalysisCompany() {
  const { analysisEdits } = useServices();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      analysisId,
      body,
    }: {
      analysisId: string;
      body: Body<AnalysisEditCommands['addAnalysisCompany']>;
    }) => analysisEdits.addAnalysisCompany(analysisId, body),
    onSuccess: (_data, { analysisId }) =>
      queryClient.invalidateQueries({ queryKey: queryKeys.analysis(analysisId) }),
  });
}

/** C-05 remove a company from the analysis set. */
export function useRemoveAnalysisCompany() {
  const { analysisEdits } = useServices();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ analysisId, companyId }: { analysisId: string; companyId: string }) =>
      analysisEdits.removeAnalysisCompany(analysisId, companyId),
    onSuccess: (_data, { analysisId }) =>
      queryClient.invalidateQueries({ queryKey: queryKeys.analysis(analysisId) }),
  });
}

/**
 * C-06 batch value overrides. Optimistic: the cached coverage (V-10) and company comparison (V-12) views show the new
 * values at once; on error every patched view is restored; either way the analysis views are refetched.
 */
export function useUpdateValueOverrides() {
  const { analysisEdits } = useServices();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      analysisId,
      body,
    }: {
      analysisId: string;
      body: Body<AnalysisEditCommands['updateValueOverrides']>;
    }) => analysisEdits.updateValueOverrides(analysisId, body),
    onMutate: ({ analysisId, body }): Promise<QuerySnapshot> =>
      patchQueries(queryClient, queryKeys.analysis(analysisId), (data, queryKey) =>
        applyValueOverrides(data, queryKey, body.overrides),
      ),
    onError: (_error, _variables, snapshot) => {
      restoreQueries(queryClient, snapshot);
    },
    onSettled: (_data, _error, { analysisId }) =>
      queryClient.invalidateQueries({ queryKey: queryKeys.analysis(analysisId) }),
  });
}

/** C-07 batch weight overrides; optimistic on any cached `{ indicatorId, weight }` row, rolled back on error. */
export function useUpdateWeightOverrides() {
  const { analysisEdits } = useServices();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      analysisId,
      body,
    }: {
      analysisId: string;
      body: Body<AnalysisEditCommands['updateWeightOverrides']>;
    }) => analysisEdits.updateWeightOverrides(analysisId, body),
    onMutate: ({ analysisId, body }): Promise<QuerySnapshot> =>
      patchQueries(queryClient, queryKeys.analysis(analysisId), (data) =>
        applyWeightOverrides(data, body.weights),
      ),
    onError: (_error, _variables, snapshot) => {
      restoreQueries(queryClient, snapshot);
    },
    onSettled: (_data, _error, { analysisId }) =>
      queryClient.invalidateQueries({ queryKey: queryKeys.analysis(analysisId) }),
  });
}

/** C-08 start a recalculation; callers following O-02 defer the refresh until the terminal event. */
export function useCreateRecalculation({ invalidateOnSuccess = true }: { invalidateOnSuccess?: boolean } = {}) {
  const { analysisEdits } = useServices();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<AnalysisEditCommands['createRecalculation']>[0]) =>
      analysisEdits.createRecalculation(body),
    onSuccess: (_data, body) =>
      !invalidateOnSuccess || body.analysisId === undefined
        ? undefined
        : queryClient.invalidateQueries({ queryKey: queryKeys.analysis(body.analysisId) }),
  });
}

/** C-09 publish an analysis (its status changes in the list and in the results header). */
export function usePublishAnalysis() {
  const { analysisEdits } = useServices();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<AnalysisEditCommands['publishAnalysis']>[0]) =>
      analysisEdits.publishAnalysis(body),
    onSuccess: (_data, body) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.analysis(body.analysisId) }),
        queryClient.invalidateQueries({ queryKey: analysesListPrefix }),
      ]),
  });
}
