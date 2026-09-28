import { testId } from '@/shared/config/test-ids';

/** `value-monitor-benchmark-radar-{element}[-{qualifier}]` (SCR-11 section 10, gated). */
export const valueMonitorBenchmarkRadarTestIds = {
  root: 'value-monitor-benchmark-radar',
  radar: 'value-monitor-benchmark-radar-radar',
  companyToggle: (companyId: string) =>
    testId('value-monitor-benchmark-radar', 'company-toggle', companyId),
  exportPng: 'value-monitor-benchmark-radar-export-png',
  exportPdf: 'value-monitor-benchmark-radar-export-pdf',
  exportPpt: 'value-monitor-benchmark-radar-export-ppt',
  strengths: 'value-monitor-benchmark-radar-strengths',
  opportunities: 'value-monitor-benchmark-radar-opportunities',
};
