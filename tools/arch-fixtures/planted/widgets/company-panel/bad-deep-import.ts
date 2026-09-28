// Violates the public-API rule: other slices are imported through their index.ts only.
import type { Company } from '../../entities/company/model';

export type DeepCompany = Company;
