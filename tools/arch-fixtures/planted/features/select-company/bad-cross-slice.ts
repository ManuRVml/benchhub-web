// Violates FSD slice isolation: a feature must not import another feature.
import { exportReportFeature } from '../export-report';

export const crossSlice = exportReportFeature;
