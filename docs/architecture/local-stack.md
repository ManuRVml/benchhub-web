# Local Full-Stack Setup with Podman

This document describes how to run Eco-Comparador locally using Podman containers (web SPA + BFF mock).

## Prerequisites

- **Podman 5.8+**: The `docker` CLI on this machine is aliased to Podman.
- **Windows users**: Ensure a podman machine is running. If not, create one:
  ```powershell
  podman machine init
  podman machine start
  ```

## Quick Start

```bash
# Start the full stack (web + BFF mock) in detached mode
pnpm stack:up

# Run e2e tests against the stack
pnpm test:e2e:stack

# View container logs (follow mode)
pnpm stack:logs

# Stop and remove containers
pnpm stack:down
```

## Signing in

Open `http://127.0.0.1:8088/login` (or your `WEB_PORT`) and sign in with the mock credential pair:

| Field | Value |
|-------|-------|
| Usuario o correo corporativo | `ecopetrol@ecopetrol.com` (case-insensitive, surrounding spaces ignored) |
| Contraseña | `ecopetrol` |

"Ingresar" posts both fields to the BFF's A-05 `POST /api/v1/auth/password-login` (JSON body; the password is never in
a URL). On success the BFF sets the `eco_mock_session` cookie and the app opens `returnTo` (or `/inicio`) and loads the
session (A-04). A wrong password or an unknown user shows "Usuario o contraseña incorrectos." (401
`INVALID_CREDENTIALS`, one message for both).

- The pair is the BFF default of `MOCK_LOGIN_USERNAME` / `MOCK_LOGIN_PASSWORD` (the BFF env config, eco-comparator-bff src/config/env.ts). `compose.yaml`
  does not override them, because the stack e2e (`e2e/stack/auth.setup.ts`) signs in with the defaults.
- The role of the session comes from `MOCK_ROLE` (default `analyst_creator`), not from the username.
- Mock-only (owner decision 2026-09-28, `docs/design/conflicts.md` CF-29): production auth is Entra ID / OIDC through
  the BFF token handler (A-01/A-02).
- `pnpm dev` with `VITE_API_MODE=mock` (no BFF) accepts the same pair: the in-memory mock adapter and the MSW handler
  check it too (`src/shared/api/adapters/mock/mock-credentials.ts`). There the session itself still comes from
  `VITE_MOCK_ROLE`.

## Isolated branch stacks

To test a web branch against a BFF branch without touching the shared stack on port 8088, use isolated compose projects.

Set environment variables and run with a distinct project name:

```powershell
$env:BFF_CONTEXT = 'D:\path\to\bff-worktree'; $env:WEB_PORT = '8089'; podman compose -p eco-b2 up --build -d
```

Then run the stack e2e tests against the isolated endpoint:

```bash
STACK_URL=http://127.0.0.1:8089 pnpm test:e2e:stack
```

Tear down only that project's containers:

```bash
podman compose -p eco-b2 down
```

This approach uses:
- `BFF_CONTEXT` (default `../eco-comparator-bff`) — points the BFF build at another checkout or worktree
- `WEB_PORT` (default `8088`) — host port to expose the web SPA
- `MOCK_SCENARIO` and `MOCK_LATENCY_MS` — passed to the BFF for test data control
- `-p eco-b2` — distinct compose project name keeping containers and network separate

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BFF_CONTEXT` | `../eco-comparator-bff` | Path to the BFF source directory for building the mock container |
| `WEB_PORT` | `8088` | Host port to expose the web SPA (container port 80) |
| `MOCK_SCENARIO` | `default` | BFF mock scenario name (controls the test data) |
| `MOCK_LATENCY_MS` | `0` | Simulated network latency in milliseconds |
| `RATE_LIMIT_PER_MINUTE` | `3000` | BFF requests per minute per client IP. The stack's nginx makes a whole Playwright run one client, so it is raised here; production keeps the BFF default of 300 |
| `STACK_URL` | `http://127.0.0.1:8088` | Base URL for e2e tests (should match WEB_PORT) |
| `COMPOSE_PROJECT_NAME` | the checkout folder name (`compose.yaml` sets no `name:`) | Compose project name; same effect as `-p`, use a distinct one for isolated stacks (e.g. `eco-b2`) |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Host Machine (Windows/Linux/macOS)                     │
│                                                         │
│  ┌──────────────┐          ┌──────────────────┐        │
│  │   Web SPA    │◄───────► │   BFF Mock       │        │
│  │  Port 8088   │  Proxy   │   Port 3001      │        │
│  │  (nginx)     │          │   (Podman)       │        │
│  └──────────────┘          └──────────────────┘        │
│                                                         │
│  Browser: http://127.0.0.1:8088                         │
└─────────────────────────────────────────────────────────┘
```

### Web SPA (eco-comparator-web)

- Built using the Dockerfile in the web repository
- Uses nginx to serve static assets and proxy `/api/` requests to the BFF
- SPA fallback configured for all non-asset routes (React Router)

### BFF Mock (eco-comparator-bff)

- Built from the BFF repository using the `mock` target
- Runs the mock server on port 3001
- Accepts `MOCK_SCENARIO` and `MOCK_LATENCY_MS` environment variables

## Troubleshooting

### Podman Machine Not Running (Windows)

If you see connection errors:
```powershell
# Check machine status
podman machine list

# Start if stopped
podman machine start

# Initialize if not created
podman machine init
podman machine start
```

### Port Already in Use

If port 8088 is occupied, set a different port:
```bash
WEB_PORT=8081 pnpm stack:up
```

Update `STACK_URL` for e2e tests:
```bash
STACK_URL=http://localhost:8081 pnpm test:e2e:stack
```

### BFF Mock Not Starting

1. Verify the BFF repository exists at `../eco-comparator-bff` (or set `BFF_CONTEXT`)
2. Check BFF's `compose.yaml` for the `mock` target
3. View logs: `pnpm stack:logs`

### Tests Fail to Connect

1. Ensure containers are running: `podman compose ps`
2. Verify network: `podman network ls`
3. Check container logs: `podman logs eco-comparador-web-1`

### Clean Restart

```bash
pnpm stack:down
podman system prune -a --filter "label=raster.task=P6-STACK"
pnpm stack:up
```

Note (Windows + Podman): the web port is published on `127.0.0.1` only; on this setup a `0.0.0.0` publish is not reachable from the Windows host.
