// Violates the FSD layer order: entities must not import features.
import { exportReportFeature } from '../../features/export-report';

export const upward = exportReportFeature;
