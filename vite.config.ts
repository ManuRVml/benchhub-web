import { rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath, URL } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import type { Plugin } from 'vite';

/**
 * `public/mockServiceWorker.js` (the MSW worker of mock mode) is copied into every build by Vite; an `http` build
 * (VITE_API_MODE=http, production) never starts MSW, so it removes the file. `pnpm check:http-bundle` checks it.
 */
function dropMockWorkerFromHttpBuild(): Plugin {
  let outDir = '';
  let httpMode = false;
  return {
    name: 'eco:drop-mock-worker-from-http-build',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
      httpMode = config.env.VITE_API_MODE === 'http';
    },
    closeBundle() {
      if (httpMode) rmSync(join(outDir, 'mockServiceWorker.js'), { force: true });
    },
  };
}

// Local development (brief §2.3): the browser always calls relative /api/... paths; Vite proxies them to the BFF,
// which runs `pnpm dev` on :3001. With VITE_API_MODE=mock the app does not need the BFF at all.
export default defineConfig({
  plugins: [react(), tailwindcss(), dropMockWorkerFromHttpBuild()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
