export interface ReportSummaryRow {
  rowId: string;
  category: string;
  tier: 1 | 2 | 3 | 4;
  kpi: string;
  unit: string;
  geValue: number;
  peerAvg: number;
}
