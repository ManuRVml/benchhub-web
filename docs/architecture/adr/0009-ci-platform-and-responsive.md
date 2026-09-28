# ADR-0009: CI platform and responsive policy — GitHub Actions, responsive breakpoints

## Status

Accepted.

## Context

The web uses CI for linting, testing, and deployment. The decision must mirror the BFF's CI setup and define responsive breakpoints.

Constraints:
- Mirrors BFF ADR 0008-ci-platform.md (GitHub Actions, container engine via `${CONTAINER_ENGINE:-podman}`).
- Responsive policy: ≥1280 full, 1024 collapsed sidebar, 768 best-effort (OQ-16 in docs/design/open-questions.md).

Sources: `PLAN.md`, `.plan/source-map/10-synthesis.md` §1.16, `docs/design/open-questions.md` OQ-16, `prompt_Start_Eco.md` L516.

## Decision

1. **GitHub Actions** for CI:
   - Workflow files in `.github/workflows/`.
   - Container engine via `${CONTAINER_ENGINE:-podman}` (mirrors BFF ADR 0008).
   - Jobs: lint, test, visual regression, build.

2. **Container engine**: Uses Podman by default (`podman`), falls back to Docker if `CONTAINER_ENGINE=docker`.

3. **Responsive breakpoints** (per OQ-16):
   - **≥1280px**: Full layout with sidebar and header.
   - **1024px**: Collapsed sidebar (icon-only).
   - **768px**: Best-effort layout (sidebar hidden, navigation in header).

4. **CI jobs**:
   - `lint`: ESLint + Prettier.
   - `test`: Vitest with coverage threshold 85% (code) / 80% (branches).
   - `visual`: Playwright screenshot tests.
   - `build`: Production build, artifact upload.

5. **Build output**: Static files in `dist/` for same-origin deployment (ADR-0007).

## Alternatives considered

- **GitLab CI / CircleCI**: Not used in BFF; inconsistent across repos.
- **Local build only**: No CI gate; risks merge of broken code.
- **Responsive: 640/1024/1440**: Doesn't match prototype breakpoints (OQ-16).

## Consequences

- Positive: CI gates catch bugs before merge.
- Positive: Podman/Docker flexibility for local CI.
- Positive: Clear responsive policy avoids ambiguity.
- Negative: CI setup requires initial configuration.
- Negative: Visual regression tests may need baseline updates per design change.
