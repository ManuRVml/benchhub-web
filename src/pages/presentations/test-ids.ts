export const presentationsPageTestIds = {
  root: 'presentations-page',
  error: 'presentations-page-error',
  retry: 'presentations-page-retry',
  createButton: 'presentations-page-create-button',
  empty: 'presentations-page-empty',
  infoToggle: 'presentations-page-info-toggle',
  infoPanel: 'presentations-page-info-panel',
  table: 'presentations-table',
  row: (id: string) => `presentations-row-${id}`,
  editAction: (id: string) => `presentations-row-${id}-edit`,
  viewAction: (id: string) => `presentations-row-${id}-view-detail`,
};
