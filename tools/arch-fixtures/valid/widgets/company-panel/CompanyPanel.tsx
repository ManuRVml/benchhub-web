import { formatPercent } from '../../shared/lib';

import type { Company } from '../../entities/company';

interface CompanyPanelProps {
  readonly company: Company;
  readonly compliance: number;
}

export function CompanyPanel({ company, compliance }: CompanyPanelProps) {
  return (
    <section aria-label={company.name}>
      <h2>{company.name}</h2>
      <p>{formatPercent(compliance)}</p>
    </section>
  );
}
