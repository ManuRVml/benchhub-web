import { expect, test } from '@playwright/test';

import { AccessGatePage } from '../pages/AccessGatePage';

// SCR-02 "Acceso" is gated on hasAdminAccess (ACCESS.accessGate, src/app/router/access.ts): the default mock session
// (analyst_creator, no admin access) must never see it, only redirect to Inicio. A positive render of the gate needs a
// session with hasAdminAccess=true, which this project's server does not carry — out of scope here.
test('opening /acceso without the admin flag redirects to Inicio, never rendering the gate', async ({
  page,
}) => {
  const gate = new AccessGatePage(page);
  await gate.goto();

  await expect(page).toHaveURL(/\/inicio$/);
  await expect(gate.root).toHaveCount(0);
});
