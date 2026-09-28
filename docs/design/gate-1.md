# Gate 1 — Phase-1 design deliverables

> Checklist of the Gate-1 requirements of the brief (`prompt_Start_Eco.md` L146–182: items 1.1–1.6 and the Gate-1 file
> coverage rule) plus the PLAN extras. One line per requirement: status, requirement, evidence path(s), checker command.
> `pnpm gate:1` (= `node tools/check-gate1.mjs`) runs every checker below and fails if any checker fails or if a `- [x]`
> line cites an evidence path or checker file that does not exist. `- [ ]` lines are pending deliveries; their checkers
> run automatically as soon as the checker file lands on main.
> Environment for the full run: `PROTOTYPE_DIR` (folder with `BencHUD.dc.html`), `SYNTHESIS_PATH`
> (`.plan/source-map/10-synthesis.md`), `SOURCE_ROOT` (folder holding the two source folders). Checkers that need a
> missing input are reported as WARN (skipped), never as PASS.

## Brief §4 Fase 1

- [x] **1.1 Screen inventory** — one file per screen SCR-01..SCR-17 with the 14 template fields, plus the generated index
      and the overlay catalogue — Evidence: `docs/design/screen-inventory.md`, `docs/design/screen-inventory/*.md`,
      `docs/design/overlays.md` — Check: `node tools/build-design-index.mjs --check`
- [x] **1.2 Design tokens (json + md)** — full palette with exact hex and semantic names, typography roles, spacing, radii,
      shadows, borders, z-index, breakpoints, motion, chart palette, variation colours — Evidence:
      `docs/design/design-tokens.json`, `docs/design/design-tokens.md`, `docs/design/design-tokens.schema.json` — Check:
      `node tools/tokens/check-md-coverage.mjs`, `node tools/tokens/check-synthesis-hex.mjs <SYNTHESIS_PATH>`
- [x] **1.3 Component catalogue** — atomic catalogue, duplicates unified, every inventory `Cmp:` tag mapped — Evidence:
      `docs/design/component-catalog.md` — Check: `node tools/check-component-catalog.mjs`
- [x] **1.4 View-data contracts, views** — one contract per view / independently loaded widget (V-01..V-47) with endpoint,
      minimal JSON, raw vs derived, permissions, params, section independence; part A (V-01..V-08, V-25, V-26, V-46) landed with
      P1-18 — Evidence: `docs/design/view-data-contracts.md`, `docs/design/view-data-contracts/` — Check:
      `node tools/check-view-contracts.mjs --dir docs/design/view-data-contracts`
- [x] **1.4 View-data contracts, commands** — one contract per command C-01..C-41 — Evidence:
      `docs/design/view-data-contracts/C-01-create-analysis-draft.md`, `docs/design/view-data-contracts.md` — Check:
      `node tools/check-command-contracts.mjs`
- [ ] **1.4 Copy to the BFF repo** — `view-data-contracts.md` copied to the BFF repo `docs/requirements/view-data-contracts.md`
      with date and origin commit (brief Gate 1; done by the BFF lane after 1.4 is complete) — Evidence: BFF repo
      `docs/requirements/view-data-contracts.md` — Check: manual (other repository)
- [x] **1.5 Navigation map** — routes, params, query params, breadcrumbs, redirects, guards per role (P1-21, merged 537b1db) —
      Evidence: `docs/design/navigation-map.md` — Check: `node tools/check-navigation-map.mjs`
- [x] **1.6 Screenshots** — reference captures (sRGB, SCR-01..17 index) and deterministic prototype renders for visual
      regression — Evidence: `docs/design/screenshots/reference/index.md`, `docs/design/screenshots/prototype/manifest.json`
      — Check: `python tools/check-reference-catalogue.py`, `node tools/prototype-render/render.mjs --check`
- [x] **Gate 1 file coverage** — every file of the two source folders is referenced by the inventory or listed as "no
      relevante" with a reason (P1-24c) — Evidence: `docs/design/source-files-index.md` — Check:
      `node tools/check-source-coverage.mjs` (with `SOURCE_ROOT`)

## PLAN extras

- [x] **Conflicts log** — CF-01..CF-87, every CF id cited in the docs has a row — Evidence: `docs/design/conflicts.md`
      — Check: `node tools/check-gate1.mjs` (built-in `cf-references` check)
- [x] **Open questions log** — OQ-01..OQ-38 with default, owner and blocked tasks — Evidence:
      `docs/design/open-questions.md` — Check: `node tools/check-open-questions.mjs`
- [x] **Mock-data catalogue** — seed values with a source for every row (screen-parity policy) — Evidence:
      `docs/design/mock-data-catalog.md` — Check: `node tools/check-source-column.mjs docs/design/mock-data-catalog.md`
- [x] **KVI oracle** — Excel D4 aggregates dataset and recomputation (96,15 % / 78,56 %) — Evidence:
      `docs/design/oracles/kvi.json`, `tools/oracles/print-kvi.mjs` — Check: `node tools/oracles/print-kvi.mjs`
- [x] **ADR-0001 source precedence (+ ADR-0002..0009)** — Evidence: `docs/architecture/adr/0001-source-precedence.md`,
      `docs/architecture/adr/README.md` — Check: `node tools/check-adrs.mjs`
- [x] **Prototype renders** — SCR-01..16 × 4 widths and OVL-01..14, offline and deterministic (P1-03a/b) — Evidence:
      `docs/design/screenshots/prototype/manifest.json`, `tools/prototype-render/render.mjs` — Check:
      `node tools/prototype-render/render.mjs --check` (with `PROTOTYPE_DIR`)
- [x] **Slide renderer spec** — the 14 slide kinds used by SCR-13 / SCR-14 — Evidence: `docs/design/slide-renderer.md` —
      Check: `node tools/check-component-catalog.mjs` (SlideRenderer mapped)
