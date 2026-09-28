import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { API_BASE_URL } from '@/shared/api';

import { server } from '../../test/msw/server';
import { createQueryHarness } from '../../test/query-wrapper';

import { SettingsPage } from './SettingsPage';

const VIEW_PATH = `${API_BASE_URL}/views/user-settings`;
const UPDATE_PATH = `${API_BASE_URL}/user-settings`;

const VIEW = {
  profile: {
    displayName: 'Camila Bravo',
    roleLabel: 'Analista creador',
    area: 'VP Tecnología e Innovación',
  },
  accessibility: { fontScale: 1, fontScaleOptions: [0.9, 1, 1.1], highContrast: false },
  emailNotifications: true,
  permissions: {},
};

function serveView(view: typeof VIEW = VIEW) {
  server.use(http.get(VIEW_PATH, () => HttpResponse.json(view)));
}

function serveUpdate() {
  const requests: unknown[] = [];
  server.use(
    http.patch(UPDATE_PATH, async ({ request }) => {
      requests.push(await request.json());
      return HttpResponse.json({ fontScale: 1.1, highContrast: false, emailNotifications: true });
    }),
  );
  return requests;
}

function renderPage() {
  const { wrapper: Wrapper } = createQueryHarness();
  return render(
    <Wrapper>
      <SettingsPage />
    </Wrapper>,
  );
}

describe('SettingsPage', () => {
  it('renders V-45 data through the form', async () => {
    serveView();
    renderPage();

    // The name is the avatar's accessible name; the card shows the role and the unit (SCR-16 prototype).
    expect(await screen.findByRole('img', { name: 'Camila Bravo' })).toBeInTheDocument();
    expect(screen.getByText('Analista creador')).toBeInTheDocument();
    expect(screen.getByText('VP Tecnología e Innovación')).toBeInTheDocument();
  });

  it('renders no page heading of its own when V-45 loads (the shell header is the h1)', async () => {
    serveView();
    renderPage();

    await screen.findByRole('img', { name: 'Camila Bravo' });

    expect(screen.queryAllByRole('heading', { level: 1 })).toHaveLength(0);
    expect(screen.queryByText('Configuración')).toBeNull();
  });

  it('saving an edited field sends it to C-37 (updateUserSettings)', async () => {
    serveView();
    const requests = serveUpdate();
    const user = userEvent.setup({ delay: null });
    renderPage();

    await user.click(await screen.findByRole('tab', { name: 'A+' }));

    expect(requests).toEqual([{ fontScale: 1.1 }]);
  });

  it('a V-45 error does not crash the page', async () => {
    server.use(
      http.get(VIEW_PATH, () =>
        HttpResponse.json(
          { code: 'INTERNAL_ERROR', message: 'Fallo', traceId: 't' },
          { status: 500 },
        ),
      ),
    );
    renderPage();

    expect(await screen.findByTestId('settings-section-error')).toBeInTheDocument();
  });

  it('shows the error panel and no heading of its own when the view request fails with 500', async () => {
    server.use(
      http.get(VIEW_PATH, () =>
        HttpResponse.json(
          { code: 'INTERNAL_ERROR', message: 'Fallo', traceId: 't' },
          { status: 500 },
        ),
      ),
    );
    renderPage();

    expect(await screen.findByTestId('settings-section-error')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 1 })).toBeNull();
  });
});
