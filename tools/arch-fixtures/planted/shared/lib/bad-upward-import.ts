// Violates the FSD layer order: shared must not import features.
import { selectCompanyFeature } from '../../features/select-company';

export const upward = selectCompanyFeature;
