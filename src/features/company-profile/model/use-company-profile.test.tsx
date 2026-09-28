import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { API_BASE_URL } from '@/shared/api';

import { server } from '../../../test/msw/server';
import { createQueryHarness } from '../../../test/query-wrapper';

import { useCompanyProfile } from './use-company-profile';

const PROFILE_PATH = `${API_BASE_URL}/views/company-profile/:companyId`;

function Trigger({ companyId, name }: { companyId: string; name: string }) {
  const { open, modal } = useCompanyProfile();
  return (
    <>
      <button
        type="button"
        onClick={() => {
          open(companyId, name);
        }}
      >
        {`open-${name}`}
      </button>
      {modal}
    </>
  );
}

function renderTrigger(companyId = 'cmp_bp', name = 'BP') {
  const { wrapper: Wrapper } = createQueryHarness();
  return render(
    <Wrapper>
      <Trigger companyId={companyId} name={name} />
    </Wrapper>,
  );
}

describe('useCompanyProfile', () => {
  it('shows the clicked name immediately, then the fetched profile once V-25 resolves', async () => {
    server.use(
      http.get(PROFILE_PATH, () =>
        HttpResponse.json({
          company: { id: 'cmp_bp', name: 'BP', colorKey: 'bp' },
          country: 'Reino Unido',
          category: 'Integrada',
          business: 'Upstream y downstream',
          segments: ['Upstream', 'Downstream'],
          news: [{ id: 'n1', headline: 'BP anuncia resultados', impact: 'up' }],
          permissions: {},
        }),
      ),
    );
    renderTrigger();
    await userEvent.click(screen.getByRole('button', { name: 'open-BP' }));
    // The clicked name shows up right away, before the fetch settles.
    expect(await screen.findByRole('dialog')).toHaveTextContent('BP');
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toHaveTextContent('Reino Unido');
    });
    expect(screen.getByRole('dialog')).toHaveTextContent('Upstream, Downstream');
    expect(screen.getByRole('dialog')).toHaveTextContent('BP anuncia resultados');
  });

  it('renders null news/empty segments as their empty state, not a crash', async () => {
    server.use(
      http.get(PROFILE_PATH, () =>
        HttpResponse.json({
          company: { id: 'cmp_bp', name: 'BP', colorKey: 'bp' },
          country: null,
          category: null,
          business: null,
          segments: [],
          news: null,
          permissions: {},
        }),
      ),
    );
    renderTrigger();
    await userEvent.click(screen.getByRole('button', { name: 'open-BP' }));
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toHaveTextContent('—');
    });
  });

  it('shows a retry inside the modal on a V-25 error, and refetches on retry', async () => {
    server.use(
      http.get(PROFILE_PATH, () =>
        HttpResponse.json(
          { code: 'INTERNAL_ERROR', message: 'boom', traceId: 't1' },
          { status: 500 },
        ),
      ),
    );
    renderTrigger();
    await userEvent.click(screen.getByRole('button', { name: 'open-BP' }));
    const retry = await screen.findByTestId('company-profile-retry', {}, { timeout: 3000 });
    server.use(
      http.get(PROFILE_PATH, () =>
        HttpResponse.json({
          company: { id: 'cmp_bp', name: 'BP', colorKey: 'bp' },
          country: 'Reino Unido',
          category: null,
          business: null,
          segments: [],
          news: null,
          permissions: {},
        }),
      ),
    );
    await userEvent.click(retry);
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toHaveTextContent('Reino Unido');
    });
  });

  it('closing the modal returns focus to the trigger', async () => {
    server.use(
      http.get(PROFILE_PATH, () =>
        HttpResponse.json({
          company: { id: 'cmp_bp', name: 'BP', colorKey: 'bp' },
          country: null,
          category: null,
          business: null,
          segments: [],
          news: null,
          permissions: {},
        }),
      ),
    );
    renderTrigger();
    const trigger = screen.getByRole('button', { name: 'open-BP' });
    await userEvent.click(trigger);
    const dialog = await screen.findByRole('dialog');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(dialog).not.toBeInTheDocument();
    });
    expect(trigger).toHaveFocus();
  });
});
