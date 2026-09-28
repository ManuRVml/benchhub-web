import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import { API_BASE_URL, queryKeys } from '@/shared/api';

import { server } from '../../test/msw/server';
import { createQueryHarness } from '../../test/query-wrapper';

import { AddKviModal } from './AddKviModal';
import { testIds } from './test-ids';

const CANDIDATES_PATH = `${API_BASE_URL}/views/kvi-candidates`;
const ADD_KVIS_PATH = `${API_BASE_URL}/value-monitor-kvis`;

const CANDIDATES = {
  source: 'pares',
  items: [
    {
      indicatorId: 'ind_score_esg',
      label: 'Score ESG',
      categoryLabel: 'Transversal',
      isAlreadyIncluded: false,
    },
    {
      indicatorId: 'ind_irr',
      label: 'IRR',
      categoryLabel: 'Estratégico',
      isAlreadyIncluded: false,
    },
  ],
  permissions: { canConfigure: true },
};

const TBG_CANDIDATES = {
  source: 'tbg',
  items: [
    {
      indicatorId: 'ind_tbg_fcl',
      label: 'Flujo de Caja Libre',
      categoryLabel: 'Financiero',
      isAlreadyIncluded: false,
    },
  ],
  permissions: { canConfigure: true },
};

/** V-34 with one candidate the monitor already has (`isAlreadyIncluded`): shown disabled, never checkable. */
const WITH_INCLUDED = {
  source: 'pares',
  items: [
    {
      indicatorId: 'ind_score_esg',
      label: 'Score ESG',
      categoryLabel: 'Transversal',
      isAlreadyIncluded: false,
    },
    {
      indicatorId: 'ind_roace',
      label: 'ROACE',
      categoryLabel: 'Financiero',
      isAlreadyIncluded: true,
    },
  ],
  permissions: { canConfigure: true },
};
const INCLUDED_NAME = 'ROACE (Financiero) · Ya está en el monitor';

function serveCandidates(view: typeof CANDIDATES = CANDIDATES) {
  server.use(http.get(CANDIDATES_PATH, () => HttpResponse.json(view)));
}

/** Answers V-34 per `?source=`: the TBG tab gets its own list, every other tab (and no source) the pares one. */
function serveCandidatesBySource() {
  server.use(
    http.get(CANDIDATES_PATH, ({ request }) =>
      HttpResponse.json(
        new URL(request.url).searchParams.get('source') === 'tbg' ? TBG_CANDIDATES : CANDIDATES,
      ),
    ),
  );
}

function serveAddKvis() {
  const requests: unknown[] = [];
  server.use(
    http.post(ADD_KVIS_PATH, async ({ request }) => {
      requests.push(await request.json());
      return HttpResponse.json({ added: true, monitorCount: 23 });
    }),
  );
  return requests;
}

function renderModal(onOpenChange = vi.fn()) {
  const { wrapper: Providers, queryClient } = createQueryHarness();
  render(
    <Providers>
      <AddKviModal open onOpenChange={onOpenChange} snapshot="2026-04" />
    </Providers>,
  );
  return { onOpenChange, queryClient };
}

describe('AddKviModal (SCR-11 OVL-05)', () => {
  it('lists the V-34 candidates and disables confirm until one is checked', async () => {
    serveCandidates();
    renderModal();

    expect(await screen.findByText('Score ESG (Transversal)')).toBeInTheDocument();
    expect(screen.getByText('IRR (Estratégico)')).toBeInTheDocument();
    expect(screen.getByTestId(testIds.addKviModalConfirm)).toBeDisabled();
  });

  it('confirming sends AddValueMonitorKvis with source: custom and the checked ids, then closes', async () => {
    serveCandidates();
    const requests = serveAddKvis();
    const user = userEvent.setup({ delay: null });
    const { onOpenChange } = renderModal();

    await user.click(await screen.findByRole('button', { name: 'Score ESG (Transversal)' }));
    await user.click(screen.getByTestId(testIds.addKviModalConfirm));

    expect(requests).toEqual([{ source: 'custom', indicatorIds: ['ind_score_esg'] }]);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('keeps a checked candidate checked across the source tabs and saves the ids of every tab', async () => {
    serveCandidatesBySource();
    const requests = serveAddKvis();
    const user = userEvent.setup({ delay: null });
    renderModal();

    await user.click(await screen.findByRole('button', { name: 'Score ESG (Transversal)' }));
    expect(screen.getByRole('button', { name: 'Score ESG (Transversal)' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await user.click(screen.getByTestId('value-monitor-config-source-tabs-tab-tbg'));
    await user.click(
      await screen.findByRole('button', { name: 'Flujo de Caja Libre (Financiero)' }),
    );
    expect(
      screen.queryByRole('button', { name: 'Score ESG (Transversal)' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('2 seleccionados')).toBeInTheDocument();

    await user.click(screen.getByTestId('value-monitor-config-source-tabs-tab-pares'));
    expect(await screen.findByRole('button', { name: 'Score ESG (Transversal)' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await user.click(screen.getByTestId(testIds.addKviModalConfirm));
    expect(requests).toEqual([
      { source: 'custom', indicatorIds: ['ind_score_esg', 'ind_tbg_fcl'] },
    ]);
  });

  it('shows an already-included candidate disabled with its reason, and it cannot be checked by click or keyboard', async () => {
    serveCandidates(WITH_INCLUDED);
    const user = userEvent.setup({ delay: null });
    renderModal();

    const included = await screen.findByRole('button', { name: INCLUDED_NAME });
    expect(included).toBeDisabled();

    await user.click(included);
    included.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    // Tabbing on from the chip just before it never lands on the disabled one (a native disabled button is not focusable).
    screen.getByRole('button', { name: 'Score ESG (Transversal)' }).focus();
    await user.tab();
    expect(included).not.toHaveFocus();

    expect(included).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('0 seleccionados')).toBeInTheDocument();
    expect(screen.getByTestId(testIds.addKviModalConfirm)).toBeDisabled();
  });

  it('counts and saves only the checkable candidates, never the already-included one', async () => {
    serveCandidates(WITH_INCLUDED);
    const requests = serveAddKvis();
    const user = userEvent.setup({ delay: null });
    renderModal();

    await user.click(await screen.findByRole('button', { name: 'Score ESG (Transversal)' }));
    await user.click(screen.getByRole('button', { name: INCLUDED_NAME }));
    expect(screen.getByText('1 seleccionados')).toBeInTheDocument();

    await user.click(screen.getByTestId(testIds.addKviModalConfirm));
    expect(requests).toEqual([{ source: 'custom', indicatorIds: ['ind_score_esg'] }]);
  });

  it('drops a ticked candidate from the count and the request when a refetch marks it already included', async () => {
    serveCandidates();
    const requests = serveAddKvis();
    const user = userEvent.setup({ delay: null });
    const { queryClient } = renderModal();

    await user.click(await screen.findByRole('button', { name: 'Score ESG (Transversal)' }));
    expect(screen.getByText('1 seleccionados')).toBeInTheDocument();

    serveCandidates({
      ...CANDIDATES,
      items: CANDIDATES.items.map((item) => ({ ...item, isAlreadyIncluded: true })),
    });
    await act(async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.valueMonitorKviCandidates('2026-04'),
      });
    });

    await waitFor(() => {
      expect(screen.getByText('0 seleccionados')).toBeInTheDocument();
    });
    expect(screen.getByTestId(testIds.addKviModalConfirm)).toBeDisabled();
    expect(requests).toEqual([]);
  });

  it('confirming after a refetch flipped one of two ticked candidates to included sends only the other id', async () => {
    serveCandidates();
    const requests = serveAddKvis();
    const user = userEvent.setup({ delay: null });
    const { queryClient } = renderModal();

    await user.click(await screen.findByRole('button', { name: 'Score ESG (Transversal)' }));
    await user.click(screen.getByRole('button', { name: 'IRR (Estratégico)' }));
    expect(screen.getByText('2 seleccionados')).toBeInTheDocument();

    serveCandidates({
      ...CANDIDATES,
      items: CANDIDATES.items.map((item) =>
        item.indicatorId === 'ind_score_esg' ? { ...item, isAlreadyIncluded: true } : item,
      ),
    });
    await act(async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.valueMonitorKviCandidates('2026-04'),
      });
    });

    await waitFor(() => {
      expect(screen.getByText('1 seleccionados')).toBeInTheDocument();
    });
    await user.click(screen.getByTestId(testIds.addKviModalConfirm));
    expect(requests).toEqual([{ source: 'custom', indicatorIds: ['ind_irr'] }]);
  });
});
