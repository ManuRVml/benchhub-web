# Design consistency report (P1-26c, Gate 1)

Cross-check of the Phase 1 design docs: screen inventories ↔ view/command contracts ↔ overlays ↔ open questions ↔
conflicts. Checker: `node tools/check-design-consistency.mjs` (Node, no dependencies; `--root <dir>` checks a copy, and
`--fields` adds an informational report).

Baseline: main `d8ca473` (17 inventories, 55 A/O/V + 41 C contracts, 38 OQ rows, 87 CF rows).

## Rules

| Rule | Fails when                                                                                                                                        | Scope                                  |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| R1   | An `A-`/`O-`/`V-`/`C-` id is cited but has no contract file                                                                                       | `screen-inventory/*.md`, `overlays.md` |
| R2   | A `SCR-` id in a contract's `- Screens:` / `- Triggered from:` bullet has no inventory file                                                       | `view-data-contracts/*.md`             |
| R3   | An `OQ-` / `CF-` id is cited but has no row in `open-questions.md` / `conflicts.md`                                                               | every `.md` under `docs/design`        |
| R4   | `<Id> <METHOD> /api/v1/<path>` is cited with a method or path that differs from the contract's Endpoint (query string and `:param` names ignored) | `screen-inventory/*.md`, `overlays.md` |

Ranges and shorthand are expanded before checking: `V-01..V-08`, `C-38..40`, `OQ-01..OQ-22`, `SCR-05..SCR-16`,
`SCR-09/10/11`. Each finding prints `file:line: <rule> <message>`.

R4 is an addition to the task list. It is mechanical and found 3 real errors that R1–R3 cannot see: the id exists, but
the cited endpoint is wrong.

### Not gated: contract JSON fields named in inventory "Data fields"

This rule is not mechanically checkable as a gate, so it is only a report (`--fields`, never fails). On the baseline it
gives 75 hints, almost all false positives:

- URL params (`q`, `fecha`, `estado` on V-04);
- SSE event names (`token`, `done` on V-46);
- enum values and unit codes (`dato`, `info`, `pts`);
- slide-kind ids (V-41/V-42);
- deliberate contract renames recorded in the contract itself (`roleLabel` → `roleLabelKey`).

The inventories describe fields in prose (nested shapes, enums, proposed names) and were written before the contracts,
which supersede them. A name miss is a hint for a reviewer, not an error. The one real divergence it surfaced (SCR-15 vs
V-44 field names) is resolved below with a pointer.

## Findings on the baseline and resolution

| #   | Rule | Location (baseline)                            | Finding                                                                                                                                                                                                                                                                                     | Resolution                                                                                                                                                                                                                                                                                         |
| --- | ---- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | R1   | `screen-inventory/SCR-09-visualizacion.md:253` | `V-48` is cited ("OVL-16 reads the invitable users [proposed: `V-48` or a param of `V-20`, to be defined in P1-19]"), but no V-48 contract exists. V-20 also left the source "to be defined".                                                                                               | **Open → OQ-39** (design decision, owner PO; blocks P3-07, P4-28, P5-47). Default: a V-20 field `invitableReviewers[]`, sent only with `canEnablePreview`; no new endpoint. SCR-09 and V-20 now point to OQ-39 instead of the non-existent V-48.                                                   |
| 2   | R4   | `screen-inventory/SCR-11-monitor-valor.md:400` | C-16 cited as `PATCH /api/v1/kvis/:kviId/targets`; the contract said `PUT`.                                                                                                                                                                                                                 | **Fixed in the contract**: `C-16-update-kvi-targets.md` → `PATCH`. Synthesis §4.3 and the inventory both say PATCH, and the body is a partial update (`metaReto` optional).                                                                                                                        |
| 3   | R4   | `screen-inventory/SCR-15-notificaciones.md:72` | V-44 cited as `GET /api/v1/notifications`; the contract is `GET /api/v1/views/notifications`. Same line: `C-35` described as "notification schema" and `C-36` as "severity enum", but C-35 marks one notification read and C-36 marks all read (a wrong-id meaning that no rule can catch). | **Fixed in the inventory**: V-44 path corrected; C-35 / C-36 cited with their real endpoints and purpose. Added a pointer that the V-44 contract field names (`text`, `createdAt`, `isRead`, `target`) supersede the inventory's (`title`/`description`, `timestamp`, `leida`, `relatedEntityId`). |
| 4   | R4   | `screen-inventory/SCR-16-configuracion.md:59`  | V-45 cited as `GET /api/v1/users/me/preferences`; the contract is `GET /api/v1/views/user-settings`. `C-37` described as "preference schema".                                                                                                                                               | **Fixed in the inventory**: V-45 and C-37 (`PATCH /api/v1/user-settings`) cited with their contract endpoints. Pointer to the V-45 grouping (`accessibility{…}`) and to OQ-20 for the font-scale options (0.9 / 1 / 1.1; the inventory listed 0.875 / 1.125).                                      |

R2 and R3 had no findings on the baseline: every SCR cited by a contract has an inventory, and every OQ / CF id cited
under `docs/design` has a row.

After the fixes: `node tools/check-design-consistency.mjs` → `design consistency: 0 finding(s) — 96 contracts, 17
inventories, 39 OQ rows, 87 CF rows`, exit 0.

## Mutation evidence

Each case runs on a temp copy of `docs/design` with `--root`; the repo is not touched.

| Mutation                                                 | Finding                                                                       | Exit |
| -------------------------------------------------------- | ----------------------------------------------------------------------------- | ---- |
| Cite `V-99` in `SCR-05-inicio.md` (requested)            | `SCR-05-inicio.md:138: R1 V-99 is cited but has no contract file`             | 1    |
| `SCR-99` in the V-03 `- Screens:` bullet                 | `V-03-home.md:6: R2 SCR-99 has no screen-inventory file`                      | 1    |
| `OQ-99` in `overlays.md`                                 | `overlays.md:3: R3 OQ-99 has no row in open-questions.md`                     | 1    |
| Range `C-40..C-42` in `overlays.md`                      | `overlays.md:3: R1 C-42 is cited but has no contract file`                    | 1    |
| Shorthand `SCR-09/10/99` in the V-26 `- Screens:` bullet | `V-26-comment-thread.md:6: R2 SCR-99 has no screen-inventory file`            | 1    |
| V-44 path reverted in SCR-15                             | `SCR-15-notificaciones.md:72: R4 V-44 cited as "GET /api/v1/notifications" …` | 1    |

## Limits

- Id meaning is not checked: the checker proves an id exists, not that the text around it describes that endpoint. Finding
  3 (C-35 / C-36) was caught by reading, not by a rule.
- `SCR-17`, `OVL-15` and `OVL-16` have no prototype. Overlay ids are not a rule because `overlays.md` is their only
  catalogue.
- Contract bodies are validated by `check-view-contracts.mjs` (A/O/V) and `check-command-contracts.mjs` (C), not here.
