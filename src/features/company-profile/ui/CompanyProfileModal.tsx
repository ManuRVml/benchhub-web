import { useT } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { CompanyLogoChip } from '@/shared/ui/composites/company-logo-chip';
import { EmptyState } from '@/shared/ui/composites/empty-state';
import { Modal } from '@/shared/ui/composites/modal';
import { Eyebrow } from '@/shared/ui/composites/section-card';
import { Skeleton } from '@/shared/ui/composites/skeleton';

import type { ReactNode } from 'react';

export interface CompanyProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: CompanyProfile;
  isLoading?: boolean;
  error?: ReactNode;
}

export interface CompanyProfile {
  company: {
    id: string;
    name: string;
    colorKey: string;
  };
  country: string | null;
  category: string | null;
  business: string | null;
  segments: string[];
  news: {
    id: string;
    headline: string;
    impact: 'up' | 'down' | 'neutral';
  }[];
}

export function CompanyProfileModal({
  open,
  onOpenChange,
  profile,
  isLoading,
  error,
}: CompanyProfileModalProps) {
  const t = useT();

  if (isLoading) {
    return (
      <Modal
        open={open}
        onOpenChange={onOpenChange}
        title={<Skeleton className="h-20 w-64" />}
        description={<Skeleton className="h-16 w-48" />}
      >
        <div className="grid gap-16 tablet:grid-cols-2">
          <div className="space-y-8">
            <Eyebrow>{t('common.companyProfile.country')}</Eyebrow>
            <Skeleton className="h-16 w-full" />
          </div>
          <div className="space-y-8">
            <Eyebrow>{t('common.companyProfile.category')}</Eyebrow>
            <Skeleton className="h-16 w-full" />
          </div>
          <div className="col-span-2 space-y-8">
            <Eyebrow>{t('common.companyProfile.business')}</Eyebrow>
            <Skeleton className="h-16 w-full" />
          </div>
          <div className="col-span-2 space-y-8">
            <Eyebrow>{t('common.companyProfile.segments')}</Eyebrow>
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
        <div className="mt-16">
          <Eyebrow>{t('common.companyProfile.news')}</Eyebrow>
          <div className="mt-8 space-y-8">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal
        open={open}
        onOpenChange={onOpenChange}
        title={profile.company.name}
        description={profile.category ?? t('common.companyProfile.category')}
      >
        <div className="mt-16">{error}</div>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={
        <div className="flex items-center gap-12">
          <CompanyLogoChip slug={profile.company.colorKey} name={profile.company.name} showName />
        </div>
      }
      description={profile.category ?? t('common.companyProfile.category')}
    >
      <div className="grid gap-16 tablet:grid-cols-2">
        <div className="space-y-8">
          <Eyebrow>{t('common.companyProfile.country')}</Eyebrow>
          <p className="text-body text-text-body">{profile.country ?? '—'}</p>
        </div>
        <div className="space-y-8">
          <Eyebrow>{t('common.companyProfile.category')}</Eyebrow>
          <p className="text-body text-text-body">{profile.category ?? '—'}</p>
        </div>
        <div className="col-span-2 space-y-8">
          <Eyebrow>{t('common.companyProfile.business')}</Eyebrow>
          <p className="text-body text-text-body">{profile.business ?? '—'}</p>
        </div>
        <div className="col-span-2 space-y-8">
          <Eyebrow>{t('common.companyProfile.segments')}</Eyebrow>
          <p className="text-body text-text-body">
            {profile.segments.length > 0 ? profile.segments.join(', ') : '—'}
          </p>
        </div>
      </div>

      {profile.news.length > 0 && (
        <div className="mt-16">
          <Eyebrow>{t('common.companyProfile.news')}</Eyebrow>
          <div className="mt-8 space-y-8">
            {profile.news.map((item) => {
              let borderClass = 'border-border-default';
              if (item.impact === 'up') {
                borderClass = 'border-status-success-base';
              } else if (item.impact === 'down') {
                borderClass = 'border-status-danger-base';
              }

              return (
                <div
                  key={item.id}
                  className={cn(
                    'relative pl-8',
                    'rounded-sm border-l-4 bg-surface-card p-16',
                    borderClass,
                  )}
                >
                  <p className="text-body text-text-body">{item.headline}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {profile.news.length === 0 && (
        <div className="mt-16">
          <Eyebrow>{t('common.companyProfile.news')}</Eyebrow>
          <div className="mt-8">
            <EmptyState title={t('common.companyProfile.noNews')} />
          </div>
        </div>
      )}
    </Modal>
  );
}
