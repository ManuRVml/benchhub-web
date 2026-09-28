# ADR-0011: Visual regression baselines — our own renders, frozen clock, mask allowlist

## Status

Accepted. Supersedes ADR-0007 decisions 1 (baseline source), 3 (mask files), 4 (animation CSS) and the 2% tolerance.

## Context

ADR-0007 planned to compare the running screens with the P1-03 prototype renders. Implementing P5-73 showed that a
pixel comparison against those images cannot pass or fail for the right reasons:

- The references in `docs/design/screenshots/reference/` and `docs/design/screenshots/prototype/` are design captures
  with other data (names, figures, dates), other fonts and, for several screens, no reference at all or a mislabelled
  frame (see the catalogue in `docs/design/screenshots/reference/index.md`).
- A 2% tolerance on a 1440px-wide full page is about 26,000 pixels: a whole button can change colour inside it.
- "Within tolerance or documented" becomes an escape hatch if masks are free-form.

## Decision

1. **Baselines are our own rendered screens**, committed as PNGs in `e2e/visual/__screenshots__/` (one per screen,
   `scr-<nn>-<name>.png`). They are rendered by `pnpm test:visual` (`playwright.visual.config.ts`) against the mock
   API at a fixed 1440x900 viewport on Chromium, one worker. They change only through
   `pnpm test:visual --update-snapshots`, in a commit whose message says which visual change was intended.
2. **Coverage**: 16 screens — SCR-01 on the signed-out server, SCR-05..SCR-17 (with the SCR-13 builder and both SCR-17
   pages) on the signed-in mock session. SCR-02 needs an admin session the mock server does not carry, and SCR-03/04 are
   not standalone screens; they have no baseline.
3. **Determinism before masks**: `e2e/visual/capture.ts` freezes `Date.now()` (`page.clock.setFixedTime`) so relative
   dates render identically every day, waits for `document.fonts.ready`, and captures with `animations: 'disabled'` and
   the caret hidden. Playwright's own stability wait (two identical frames) absorbs chart start-up animations.
4. **Mask allowlist**: `e2e/visual/masks.ts` is the only place a region may be excluded, one entry per region with a
   one-line reason. It starts empty; an entry is added only for a region that is dynamic by design and cannot be made
   deterministic by the clock or the fixtures (for example the Yarbis assistant once it is mounted, if it animates).
5. **Tolerance**: `maxDiffPixelRatio: 0.001` (0.1%, about 1,300 pixels on the page) outside the masks — room for
   anti-aliasing noise, not for a changed colour, spacing or element.
6. **Design references are reviewed, not diffed**: when a baseline is created or updated, the reviewer compares it by
   eye with the reference named for that screen in `docs/design/screenshots/reference/index.md` (or its prototype
   render) and notes any deliberate deviation in the PR. No automated comparison against the references is run.

## Consequences

- Positive: the check catches unintended visual change (proven by changing the Inicio layout gap from `gap-20` to
  `gap-24`: the Inicio screenshot fails, the other screens pass).
- Positive: no flake from dates; masks cannot silently grow.
- Negative: baselines are tied to this Chromium build and font rendering; a Playwright upgrade or another OS may need
  a deliberate `--update-snapshots` commit. CI runs on Linux, so its first run will need Linux baselines generated
  there (a follow-up for the CI job; locally the Windows baselines are the reference).
- Negative: fidelity to the design is a review step, not a gate.
