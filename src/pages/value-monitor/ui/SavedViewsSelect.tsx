import { useEffect, useRef } from 'react';

import { useDeleteSavedView, useSavedViewsView } from '@/entities/saved-view';
import { useSession } from '@/entities/session';
import { useT } from '@/shared/i18n';
import { Button } from '@/shared/ui/primitives/button';
import { Select } from '@/shared/ui/primitives/inputs';

import type { SavedView } from '@/entities/saved-view';

export interface SavedViewsSelectProps {
  /** The `vista` URL param: the saved view the page is showing; empty = "Vista actual". */
  activeViewId: string;
  /** Applies a saved view: writes `vista` and its stored `state` to the page's URL filters. */
  onChoose: (view: SavedView) => void;
  /** "Vista actual" (or the active view was deleted): clears `vista`, leaving the filters as they are. */
  onClear: () => void;
}

/**
 * "Mis vistas" (SCR-11 snapshot row, M-07): the user's saved views of this screen (V-47) plus "Vista actual", and a
 * delete (C-20) for the selected view. The native select cannot host a "✕" per option, so the delete button acts on the
 * view the select shows. Hidden with no saved views, when V-47 fails, and for executive_viewer (§1.19: no saved views,
 * V-47 answers 403, so it is not even requested). A `vista` already in the URL (a reopened link) applies its view once
 * the list arrives.
 */
export function SavedViewsSelect({ activeViewId, onChoose, onClear }: SavedViewsSelectProps) {
  const t = useT();
  const session = useSession();
  const allowed = session?.role !== 'executive_viewer';
  const views = useSavedViewsView('value-monitor', { enabled: allowed });
  const deleteView = useDeleteSavedView();
  const appliedRef = useRef('');
  const items = views.data?.items ?? [];
  const active = items.find((view) => view.id === activeViewId);

  useEffect(() => {
    if (active === undefined || appliedRef.current === active.id) return;
    appliedRef.current = active.id;
    onChoose(active);
  }, [active, onChoose]);

  if (!allowed || items.length === 0) return null;

  const handleChange = (value: string) => {
    const chosen = items.find((view) => view.id === value);
    if (chosen === undefined) {
      appliedRef.current = '';
      onClear();
      return;
    }
    appliedRef.current = chosen.id;
    onChoose(chosen);
  };

  return (
    <>
      <span className="text-11 font-semibold text-text-secondary uppercase">
        {t('value-monitor.header.savedViews.label')}
      </span>
      <Select
        label={t('value-monitor.header.savedViews.label')}
        hideLabel
        options={[
          { value: '', label: t('value-monitor.header.savedViews.current') },
          ...items.map((view) => ({ value: view.id, label: view.name })),
        ]}
        value={active?.id ?? ''}
        testId="value-monitor-saved-views-select"
        onValueChange={handleChange}
      />
      {active !== undefined && views.data?.permissions.canDeleteView === true ? (
        <Button
          variant="outline"
          size="sm"
          testId="value-monitor-saved-views-delete"
          aria-label={t('value-monitor.header.savedViews.delete', { name: active.name })}
          loading={deleteView.isPending}
          onClick={() => {
            deleteView.mutate(active.id, {
              onSuccess: () => {
                appliedRef.current = '';
                onClear();
              },
            });
          }}
        >
          ✕
        </Button>
      ) : null}
    </>
  );
}
