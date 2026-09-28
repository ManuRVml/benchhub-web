import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import { server } from './msw/server';

// Proves the test runner wiring: jsdom DOM, jest-dom matchers, user-event and the MSW node server.
function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button
      type="button"
      onClick={() => {
        setCount((c) => c + 1);
      }}
    >
      {`count ${String(count)}`}
    </button>
  );
}

describe('test runner setup', () => {
  it('renders into jsdom and supports jest-dom matchers and user-event', async () => {
    render(<Counter />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('count 0');
    await userEvent.click(button);
    expect(button).toHaveTextContent('count 1');
  });

  it('serves a mocked /api/v1/health through MSW', async () => {
    server.use(
      http.get('*/api/v1/health', () => HttpResponse.json({ status: 'ok' }, { status: 200 })),
    );
    const response = await fetch(new URL('/api/v1/health', window.location.origin));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'ok' });
  });

  it('rejects requests that no handler mocks', async () => {
    await expect(fetch(new URL('/api/v1/unmocked', window.location.origin))).rejects.toThrow();
  });
});
