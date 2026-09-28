import { useMemo } from 'react';

import { selectCompany } from '../../features/select-company';
import { CompanyPanel } from '../../widgets/company-panel';

import type { Company } from '../../entities/company';

interface ComparisonPageProps {
  readonly companies: readonly Company[];
  readonly selectedId: string;
}

export function ComparisonPage({ companies, selectedId }: ComparisonPageProps) {
  const company = useMemo(() => selectCompany(companies, selectedId), [companies, selectedId]);
  return company ? <CompanyPanel company={company} compliance={96} /> : null;
}
