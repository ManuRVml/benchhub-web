/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** `mock` = in-memory adapters, no BFF needed; `http` = relative `/api/...` calls proxied to the BFF (brief §2.3). */
  readonly VITE_API_MODE: 'mock' | 'http';
  /** Mock session role until P5-01 (`analyst_creator` … `executive_integral`, or `none` = signed out). */
  readonly VITE_MOCK_ROLE?: string;
  /** `true` gives the mock session `hasAdminAccess` (SCR-02 / SCR-03). */
  readonly VITE_MOCK_ADMIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
