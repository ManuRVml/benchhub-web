import { isRole, mockSession } from '@/entities/session';

import type { SessionSource } from '@/entities/session';

// Stub session source until P5-01 wires `GET /api/v1/session`. Development can pick the mock identity with
// VITE_MOCK_ROLE (one of the five roles; `none` = signed out) and VITE_MOCK_ADMIN=true.
const role = import.meta.env.VITE_MOCK_ROLE;
const session =
  role === 'none'
    ? null
    : mockSession(
        isRole(role) ? role : 'analyst_creator',
        import.meta.env.VITE_MOCK_ADMIN === 'true',
      );

export const getMockSession: SessionSource = () => session;
