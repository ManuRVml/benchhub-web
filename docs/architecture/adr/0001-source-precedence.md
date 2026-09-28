# ADR-0001: Source Precedence

## Status

Approved.

## Context

The Eco-Comparador project draws from multiple sources: the V2 prototype (HTML), handoff documents (README/BACKEND), reference images (PQ), and requirements docs (Doc A, board 09). Without a clear precedence rule, conflicting specifications would cause ambiguity and rework.

Sources and their reliability:

1. **HTML** (`V2/BencHUD.dc.html`) — The newest prototype export (2026-09-24 16:01:55, 5,519 lines). Contains layout, copy, colors, mock values and behaviour. Single source of truth.
2. **V2 screenshots** (`HO/screenshots/*`) and current-iteration captures in `UP/` — Used only where they match `HTML`.
3. **HO/README.md / HO/BACKEND.md** — Used for intent, data model and missing behaviour; lose against `HTML` on conflicts.
4. **PQ/\* images** — Lose against `HTML` on conflicts, but additive modules with no V2 counterpart count as "evidencia clara" (brief line 59) when corroborated elsewhere. Evidence: PQ captures carry mtimes 2026-09-24 17:22–17:49; V2 files carry export stamp 2026-09-24 16:01:55; README lists two of those modules. Counter-evidence: P1/P2 still show the older nav. Therefore: shell/nav/order follow `HTML`; extra modules are adopted as **scope-gated** (built last, droppable by PO decision).
5. **Requirements docs** — `UP/Comparador_Financiero_VFV_Estado_y_Hallazgos.docx` ("Doc A", highest for scope, roles and business rules) and the IA board `UP/carpetas-1788888336424-euvv.jpg` ("board 09"); the PDF HU-001..014 and the HU-MKT docx are aspirational.
6. **Superseded iterations** (older `UP/` captures, `V2/screenshots/*`, `UP/gk2 4.html`) — Reference only.

## Decision

Establish the precedence order above as the authoritative hierarchy for all design and implementation decisions. Conflicts are resolved by:

- **Layout, copy, colors, mock values and behaviour** → `HTML` wins.
- **Additive modules without V2 counterpart** → Adopt as scope-gated (built last).
- **Intent and data model** → `README`/`BACKEND` accepted only where not contradicted by `HTML`.
- **Business rules and scope** → Doc A and board 09 win.
- **Historical references** → Superseded captures used only as context.

## Consequences

- Design decisions are traceable to a single source, reducing debate and rework.
- Additive modules (e.g., "Análisis multidimensional · Benchmark radial") are clearly flagged as scope-gated.
- The BFF contract must expose flags for scope-gated modules so POs can toggle them.
- Tests and visual parity checks must reference `HTML` as the baseline; deviations require documented justification.
