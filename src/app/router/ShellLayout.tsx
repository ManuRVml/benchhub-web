import { useMemo, useState } from 'react';
import { Outlet, useLoaderData, useLocation, useMatches, useParams } from 'react-router';

import { useResultsHeaderView } from '@/entities/analysis';
import { SessionContext, useLogout } from '@/entities/session';
import { useShellStatusView } from '@/entities/shell';
import { createAssistantChatPort } from '@/features/assistant';
import {
  API_BASE_URL,
  ApiError,
  createCsrfTokenStore,
  createSseClient,
  sessionCsrfSchema,
  SESSION_ENDPOINT,
  useServices,
} from '@/shared/api';
import {
  AppShell,
  HelpDialog,
  shellNavigationFromSession,
  useHeaderTitle,
} from '@/widgets/app-shell';
import { YarbisAssistant } from '@/widgets/yarbis-assistant';

import { assistantContextForPath } from './assistant-screen';

import type { Session } from '@/entities/session';

export interface ShellLayoutData {
  readonly session: Session | null;
}

// One SSE client for the Yarbis C-33 stream. Every stream is a POST, so it needs the session's CSRF token, fetched the
// same way the app's http client does (`GET /session`, ADR-0004 §6) but in its own closure, since that token lives
// inside `createHttpClient` and is not exposed (same approach as use-presentation-upload.ts).
const assistantSse = createSseClient({
  csrf: createCsrfTokenStore(async () => {
    const response = await fetch(`${API_BASE_URL}${SESSION_ENDPOINT}`, { credentials: 'include' });
    if (!response.ok) {
      throw new ApiError({
        code: 'HTTP_ERROR',
        message: 'Could not load the CSRF token',
        traceId: '',
        status: response.status,
      });
    }
    return sessionCsrfSchema.parse(await response.json()).csrfToken;
  }),
});

// Pathless layout route of SCR-04. With a session the pages render inside the app shell; without one (only the
// public error pages can be reached) they render standalone (OQ-40 default). Pages read the session with `useSession()`.
// The sidebar renders the session's A-04 `navigation[]`; `unreadNotifications` comes from the real V-01 shell status
// query (P5-62c). Logout calls A-03 (P5-04b) — best-effort: "Salir" always ends on /login even if the call fails,
// matching the BFF's own idempotent 204 (A-03 doc).
// The Yarbis widget (P5-31) goes into the `assistant` slot on every route that has an assistant screen, and only for a
// session with A-04 `permissions.canUseAssistant` (CF-40). The header "?" opens the OVL-12 help dialog.
export function ShellLayout() {
  const { session } = useLoaderData<ShellLayoutData>();
  const logout = useLogout();
  const shellStatus = useShellStatusView(session !== null);
  const { pathname } = useLocation();
  const matches = useMatches();
  const { analysisId = '' } = useParams();
  const isResultsRoute = matches.some((match) => match.id === 'analysisResults');
  const resultsHeader = useResultsHeaderView(isResultsRoute ? analysisId : '');
  const analysisName = resultsHeader.data?.analysis.title;
  const screenTitle = useHeaderTitle(analysisName);
  const { assistant } = useServices();
  const port = useMemo(
    () => createAssistantChatPort({ sse: assistantSse, commands: assistant }),
    [assistant],
  );
  const assistantContext = assistantContextForPath(pathname);
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <SessionContext.Provider value={session}>
      {session ? (
        <AppShell
          user={{
            displayName: session.displayName,
            ...(session.avatarUrl === undefined ? {} : { avatarUrl: session.avatarUrl }),
          }}
          navigation={shellNavigationFromSession(session)}
          unreadNotifications={shellStatus.data?.unreadNotifications}
          analysisName={analysisName}
          onLogout={() => {
            void logout();
          }}
          onHelp={() => {
            setHelpOpen(true);
          }}
          assistant={
            assistantContext ? (
              <YarbisAssistant
                screen={assistantContext.screen}
                screenTitle={screenTitle}
                canUseAssistant={session.canUseAssistant}
                port={port}
                {...(assistantContext.analysisId === undefined
                  ? {}
                  : { analysisId: assistantContext.analysisId })}
              />
            ) : undefined
          }
        >
          <Outlet />
          <HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
        </AppShell>
      ) : (
        <Outlet />
      )}
    </SessionContext.Provider>
  );
}
