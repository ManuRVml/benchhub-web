import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { createApp } from '@/app';

import './app/styles/global.css';

const container = document.getElementById('root');
if (!container) throw new Error('Missing #root element in index.html');

async function enableMocking() {
  if (import.meta.env.VITE_API_MODE !== 'mock') return;
  const { startMockWorker } = await import('@/test/msw/browser');
  await startMockWorker();
}

void enableMocking()
  .then(() => createApp())
  .then((App) => {
    createRoot(container).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  });
