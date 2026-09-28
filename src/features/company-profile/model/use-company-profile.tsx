import { useState } from 'react';

import { isApiError } from '@/shared/api';
import { useT } from '@/shared/i18n';
import { SectionErrorPanel } from '@/shared/ui/layout/section-boundary';

import { useCompanyProfileView } from '../api/use-company-profile-view';
import { CompanyProfileModal } from '../ui/CompanyProfileModal';

import type { CompanyProfile } from '../ui/CompanyProfileModal';
import type { ReactNode } from 'react';

interface Target {
  companyId: string;
  /** Name at the moment the trigger was clicked, shown while V-25 loads. */
  name: string;
}

export interface UseCompanyProfile {
  /** Opens the modal for `companyId`, showing `name` immediately while V-25 loads. */
  open: (companyId: string, name: string) => void;
  /** Always render this once, near the trigger; it stays mounted (Radix returns focus to the trigger on close only
   * while the dialog was mounted when it opened). */
  modal: ReactNode;
}

/**
 * OVL-13 opener: owns the V-25 query and the modal's open state, so a click handler only needs `open(companyId,
 * name)`. One instance per trigger surface (heatmap, ranking) — each opens its own modal instance.
 */
export function useCompanyProfile(): UseCompanyProfile {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<Target | null>(null);
  const query = useCompanyProfileView(open ? (target?.companyId ?? '') : '');
  const data = query.data;

  const profile: CompanyProfile = {
    company: {
      id: target?.companyId ?? '',
      name: data?.company.name ?? target?.name ?? '',
      colorKey: data?.company.colorKey ?? '',
    },
    country: data?.country ?? null,
    category: data?.category ?? null,
    business: data?.business ?? null,
    segments: data?.segments ?? [],
    news: data?.news ?? [],
  };

  return {
    open: (companyId, name) => {
      setTarget({ companyId, name });
      setOpen(true);
    },
    modal: (
      <CompanyProfileModal
        open={open}
        onOpenChange={setOpen}
        profile={profile}
        isLoading={query.isFetching && data === undefined}
        error={
          query.isError ? (
            <SectionErrorPanel
              testId="company-profile-error"
              retryTestId="company-profile-retry"
              errorCode={isApiError(query.error) ? query.error.code : 'UNKNOWN'}
              title={t('common.section.error.title')}
              retryLabel={t('common.section.error.retry')}
              onRetry={() => {
                void query.refetch();
              }}
            />
          ) : undefined
        }
      />
    ),
  };
}
