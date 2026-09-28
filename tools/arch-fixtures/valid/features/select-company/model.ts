import type { Company } from '../../entities/company';

export function selectCompany(companies: readonly Company[], id: string): Company | undefined {
  return companies.find((company) => company.id === id);
}
