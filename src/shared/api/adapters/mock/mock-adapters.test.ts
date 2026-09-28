import { describe, expect, it } from 'vitest';

import { loadFixture, mockResponse } from './mock-data';
import { MOCK_GAPS } from './mock-gaps';
import { createMockPorts } from './mock-ports';
import { MOCK_OPERATIONS } from './operations';

import type { MockOperationId } from './operations';
import type * as R from '../../ports/responses';

const OPERATION_IDS = Object.keys(MOCK_OPERATIONS) as MockOperationId[];
const BODY = {} as never;

describe('mock data', () => {
  it('covers the 94 operations of contract 0.2.0', () => {
    expect(OPERATION_IDS).toHaveLength(94);
  });

  // Loads all 94 fixture chunks; generous timeout for a busy full-suite run.
  it(
    'MOCK_GAPS is exactly the set of fixtures that fail the 0.1.0 schema',
    { timeout: 30_000 },
    async () => {
      const fixtures = await Promise.all(OPERATION_IDS.map((id) => loadFixture(id)));
      const failing = OPERATION_IDS.filter(
        (id, index) => !MOCK_OPERATIONS[id].schema.safeParse(fixtures[index]).success,
      );
      expect(failing.sort()).toEqual(Object.keys(MOCK_GAPS).sort());
    },
  );

  it('every gap names its reason, and its payload (when there is one) is valid for 0.1.0', () => {
    const gaps = Object.entries(MOCK_GAPS);
    for (const [, gap] of gaps) expect(gap.reason.length).toBeGreaterThan(10);
    const invalid = gaps
      .filter(([, gap]) => gap.payload !== undefined)
      .filter(
        ([id, gap]) =>
          !MOCK_OPERATIONS[id as MockOperationId].schema.safeParse(gap.payload).success,
      )
      .map(([id]) => id);
    expect(invalid).toEqual([]);
  });

  it.each(OPERATION_IDS.filter((id) => MOCK_GAPS[id]?.payload !== undefined || !MOCK_GAPS[id]))(
    '%s resolves with a payload its generated schema validates',
    async (id) => {
      const data = await mockResponse(id);
      expect(MOCK_OPERATIONS[id].schema.safeParse(data).success).toBe(true);
    },
  );

  it('returns a fresh copy on every call', async () => {
    const first = await mockResponse('getAnalysesView');
    first.items.length = 0;
    expect((await mockResponse('getAnalysesView')).items.length).toBeGreaterThan(0);
  });
});

describe('mock adapters: typed data, one operation per port', () => {
  const ports = createMockPorts();

  it('home', async () => {
    const data: R.V03Response = await ports.home.getHomeView();
    expect(data.banner.status).toBe('ok');
  });

  it('analyses', async () => {
    const data: R.V04Response = await ports.analyses.getAnalysesView();
    expect(data.totalItems).toBeGreaterThanOrEqual(data.items.length);
  });

  it('analysisDefinition', async () => {
    const data: R.V06Response = await ports.analysisDefinition.getCompetitorCatalogView();
    expect(data.groups.length).toBeGreaterThan(0);
  });

  it('results', async () => {
    const data: R.V09Response = await ports.results.getResultsHeaderView('ana_01');
    expect(data.analysis.lifecycleState).toBe('preparation');
  });

  it('results accepts the horizon option (V-09 / V-14 `?horizon=`)', async () => {
    const header = await ports.results.getResultsHeaderView('ana_01', { horizon: 'union' });
    const findings = await ports.results.getAiFindingsView('ana_01', { horizon: 'ilp' });
    expect(header.modules.length).toBeGreaterThan(0);
    expect(findings.status).toBe('suggestion');
  });

  it('analysisDrafts', async () => {
    const data: R.C02Response = await ports.analysisDrafts.updateAnalysisDraft('drf_01', BODY);
    expect(typeof data.validationState.isValid).toBe('boolean');
  });

  it('analysisEdits', async () => {
    const data: R.C09Response = await ports.analysisEdits.publishAnalysis(BODY);
    expect(data.publicationManifest.status).toBe('published');
  });

  it('review', async () => {
    const data: R.C10Response = await ports.review.createReviewComment(BODY);
    expect(data.status).toBe('pending');
  });

  it('reports', async () => {
    const data: R.C14Response = await ports.reports.createExport(BODY);
    expect(data.status).toBe('accepted');
  });

  it('valueMonitor', async () => {
    const data: R.C16Response = await ports.valueMonitor.updateKviTargets('kvi_fcl', BODY);
    expect(data.targets.meta).toBeTypeOf('number');
  });

  it('savedViews', async () => {
    const data: R.C20Response = await ports.savedViews.deleteSavedView('view_01');
    expect(typeof data.deleted).toBe('boolean');
  });

  it('sensitivities', async () => {
    const data: R.C24Response = await ports.sensitivities.evaluateWeightSimulation(BODY);
    expect(data.mode).toBe('weights');
    if (data.mode !== 'weights') return;
    expect(data.categories.operating_costs.after).toBeTypeOf('number');
  });

  it('presentations', async () => {
    const data: R.C28Response = await ports.presentations.updatePresentation('prs_01', BODY);
    expect(data.meta.title).toBe('presentation-title');
    expect(data.modules).toBeDefined();
    expect(data.includeCover).toBe(true);
    expect(data.includeClosing).toBe(true);
    expect(data.notes).toBeDefined();
  });

  it('assistant', async () => {
    const data: R.C33Response = await ports.assistant.sendAssistantMessage(BODY);
    expect(data).toBeTruthy();
  });

  it('notifications', async () => {
    const data: R.C36Response = await ports.notifications.markAllNotificationsRead(BODY);
    expect(data).toBeTruthy();
  });

  it('visualization', async () => {
    const data: R.V20Response = await ports.visualization.getVisualizationView('ana_01');
    expect(data.lifecycleState).toBe('preview');
    expect(data.position.tierId).toBe(2);
  });

  it('companyProfile', async () => {
    const data: R.V25Response = await ports.companyProfile.getCompanyProfileView('cmp_chevron');
    expect(data.company.name).toBe('Chevron');
    expect(data.country).toBe('Estados Unidos');
  });

  it('comparisonProfiles', async () => {
    const data: R.V19Response = await ports.comparisonProfiles.getComparisonProfilesView('ana_01');
    expect(data.profiles.length).toBeGreaterThan(0);
    expect(data.config.profileId).toBe('prf_descarbonizacion');
  });

  it('comparisonProfileCommands', async () => {
    const created: R.C38Response = await ports.comparisonProfileCommands.createComparisonProfile(
      'ana_01',
      BODY,
    );
    expect(created.saved).toBe(true);
    const updated: R.C39Response = await ports.comparisonProfileCommands.updateComparisonProfile(
      'ana_01',
      'prf_01',
      BODY,
    );
    expect(updated.saved).toBe(true);
    const deleted: R.C40Response = await ports.comparisonProfileCommands.deleteComparisonProfile(
      'ana_01',
      'prf_01',
    );
    expect(deleted.deleted).toBe(true);
  });

  it('auth', async () => {
    const data: R.A04Response = await ports.auth.getSession();
    expect(data.role).toBe('analyst_creator');
    expect(data.navigation.length).toBeGreaterThan(0);
  });

  it('auth: A-05 accepts only the mock credential pair (username case-insensitive after trim)', async () => {
    const data: R.A05Response = await ports.auth.passwordLogin({
      username: ' EcoPetrol@Ecopetrol.com ',
      password: 'ecopetrol',
    });
    expect(data.role).toBe('analyst_creator');
    for (const body of [
      { username: 'ecopetrol@ecopetrol.com', password: 'Ecopetrol' },
      { username: 'nobody@ecopetrol.com', password: 'ecopetrol' },
    ]) {
      await expect(ports.auth.passwordLogin(body)).rejects.toMatchObject({
        code: 'INVALID_CREDENTIALS',
        status: 401,
      });
    }
  });

  it('presentationViews', async () => {
    const list: R.V40Response = await ports.presentationViews.getPresentationsView();
    expect(list.items.length).toBeGreaterThan(0);
    const builder: R.V41Response = await ports.presentationViews.getPresentationBuilderView('p1');
    expect(builder.modules.length).toBeGreaterThan(0);
    const slides: R.V42Response = await ports.presentationViews.getPresentationSlidesView('p1');
    expect(slides.slides.length).toBeGreaterThan(0);
    const detail: R.V43Response = await ports.presentationViews.getPresentationDetailView('p1');
    expect(detail.slideRef.view).toBe('V-42');
  });

  it('previewInvitations', async () => {
    const data: R.C41Response = await ports.previewInvitations.createPreviewInvitations(
      'ana_01',
      BODY,
    );
    expect(data.invited).toBe(true);
  });

  it('operations', async () => {
    const status: R.O01Response = await ports.operations.getOperationStatus('op_01');
    expect(status.status).toBe('running');
    const file = await ports.operations.downloadFile('file_01');
    expect(file).toBeInstanceOf(Blob);
  });
});
