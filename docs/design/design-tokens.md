# Design Tokens

This document provides a human-readable companion to [design-tokens.json](./design-tokens.json).

## Table of Contents

- [Brand](#brand)
- [Ai](#ai)
- [Info](#info)
- [Text](#text)
- [Border](#border)
- [Surface](#surface)
- [Neutral](#neutral)
- [Dark](#dark)
- [Status](#status)
- [Severity](#severity)
- [Tier](#tier)
- [Urgency](#urgency)
- [Variation](#variation)
- [Chart](#chart)
- [Dimension](#dimension)
- [Company](#company)
- [Gradient](#gradient)
- [Overlay](#overlay)
- [Font](#font)
- [Size](#size)
- [Space](#space)
- [Radius](#radius)
- [Shadow](#shadow)
- [Z](#z)
- [Breakpoint](#breakpoint)
- [Motion](#motion)
- [Company Colour Map](#company-colour-map)
- [Decision Log](#decision-log)

## Decision Log

These CF (Consensus Framework) and OQ (Open Question) decisions are embedded in the token $descriptions.

### CF-28

Active sidebar item uses {brand.navActive} (#7C35EA, HTML), not {brand.primary}.

### CF-42

Two coexisting dimension palettes: {dimension.share.*} and {dimension.accent.*}.

### CF-43

Danger text is a single token {status.danger.text} = #9A1616; #991B1B kept only as deprecated alias.

### CF-44

README dark card #24124A is conceptual and unused ({dark.card} deprecated).

### CF-47

Company colour map is the PVC-based map (§2.7); served by the BFF as colorKey.

### OQ-13

Colours for peers beyond the map, PTTEP magenta and the Shell chip deviation are open.

### OQ-16

Breakpoints are a proposal (prototype has none).

## Company Colour Map

| Company | Token Path | Hex Value |
|---|---|---|
| ecopetrol | company.ecopetrol | #83E377 |
| bp | company.bp | #048BA8 |
| equinor | company.equinor | #16DB93 |
| shell | company.shell | #F29E4C |
| totalEnergies | company.totalEnergies | #B9E769 |
| oxy | company.oxy | #EFEA5A |
| petrobras | company.petrobras | #2C699A |
| chevron | company.chevron | #7C35EA |
| isa | company.isa | #F1C453 |
| exxon | company.exxon | #0DB39E |
| pttep | company.pttep | #EC4899 |
| repsol | company.repsol | #FBBF24 |
| fallback | company.fallback | #59667C |

## Brand

Brand colours for CTA, primary interactions, secondary accents, and logo elements.

| Token Path | Value | Usage | Source |
|---|---|---|---|
| brand.primary | #672DBD | Primary / CTA: buttons, links, active tabs and chips, average line, "Ver más ›". Most used colour (138). | .plan/source-map/10-synthesis.md:568 |
| brand.primaryDark | #7002B0 | Primary dark: "★ Grupo Ecopetrol · referencia" header, emphasis and hover text. | .plan/source-map/10-synthesis.md:569 |
| brand.navActive | #7C35EA | Active sidebar item background (CF-28: HTML value adopted over README #672DBD); also Estratégico donut and Chevron. | .plan/source-map/10-synthesis.md:570 |
| brand.indigo | #5B5CC8 | Secondary / indigo accent: login user tile, login CTA gradient start, gate link and gate card hover border. | .plan/source-map/10-synthesis.md:571 |
| brand.primarySubtle | #EDE9FE | Primary subtle background: selected chips, selected module card, segment tips. | .plan/source-map/10-synthesis.md:572 |
| brand.primaryBorder | #C4B5FD | Primary subtle border for selected chips / module cards. | .plan/source-map/10-synthesis.md:572 |
| brand.primaryFaint | #FAF8FF | Primary faint background: user chat bubble. | .plan/source-map/10-synthesis.md:572 |
| brand.primaryDivider | #E4DDF7 | Dashed divider inside presentation detail (1 use). Cross-check addition: present in the HTML palette (02 §12.1) but not listed in synthesis §2. | .plan/source-map/02-prototype-html.md:605 |
| brand.logoYellow | #FFDD00 | Logo artwork yellow. Logos only, never UI. | .plan/source-map/10-synthesis.md:578 |

## Ai

AI/Yarbis brand colours for the assistant interface.

| Token Path | Value | Usage | Source |
|---|---|---|---|
| ai.accent | #49BCD8 | AI / Yarbis accent: FAB, Yarbis header, "Generar análisis", "Publicar presentación", KPI 82%. | .plan/source-map/10-synthesis.md:573 |
| ai.text | #0E7490 | AI text on light backgrounds: AI pills, Hallazgos, Yarbis boxes; also global link hover. | .plan/source-map/10-synthesis.md:574 |
| ai.bg | #E3F6FA | AI light background. | .plan/source-map/10-synthesis.md:574 |
| ai.border | #A8E6EC | AI border. | .plan/source-map/10-synthesis.md:574 |
| ai.pulseRing | #49BCD866 | aiPulse keyframe ring start colour (fades to transparent at 10px spread). | .plan/source-map/10-synthesis.md:664 |

## Info

Information icon and contextual background colours.

| Token Path | Value | Usage | Source |
|---|---|---|---|
| info.icon | #518CD1 | "i" info circles, Eco detail highlight border. | .plan/source-map/10-synthesis.md:575 |
| info.mid | #47A4D5 | Focus ring, info severity, "Activos" KPI, TBG badge, header strip start. | .plan/source-map/10-synthesis.md:576 |
| info.bg | #E9F1FD | Info background. | .plan/source-map/10-synthesis.md:576 |

## Text

Typography text colours for headings, body, and secondary elements.

| Token Path | Value | Usage | Source |
|---|---|---|---|
| text.heading | #1C2535 | Headings (101 uses). Same value as Ecopetrol DS "Transversales · Neutros". | .plan/source-map/10-synthesis.md:583 |
| text.body | #424E63 | Body text (121). | .plan/source-map/10-synthesis.md:583 |
| text.secondary | #59667C | Secondary text (147); also {company.fallback}. | .plan/source-map/10-synthesis.md:583 |
| text.eyebrow | #59667C | Table headers and uppercase eyebrows; AA contrast per CF-138 (prototype #808A9B, 3.4:1). | .plan/source-map/10-synthesis.md:583 |
| text.muted | #98A1B0 | Muted text (186). | .plan/source-map/10-synthesis.md:584 |
| text.inverse | {surface.card} | White text on filled accents (tier badges, active nav, strong text on dark). | .plan/source-map/10-synthesis.md:585 |
| text.link | {brand.primary} | Global link colour. | .plan/source-map/10-synthesis.md:568 |
| text.linkHover | {ai.text} | Global link hover colour. | .plan/source-map/10-synthesis.md:574 |
| text.onDark.heading | #F8FAFC | Headings on dark gate/login surfaces ("¿A dónde quieres ir?"). Cross-check addition: in the HTML dark-surface list (02 §12.1), not named in synthesis §2.3. | .plan/source-map/02-prototype-html.md:609 |
| text.onDark.lead | #C7BEDE | Login hero paragraph and login card subtitle. | .plan/source-map/10-synthesis.md:590 |
| text.onDark.caption | #B3A6CE | Login feature captions under white titles. | .plan/source-map/10-synthesis.md:591 |
| text.onDark.note | #DDD1EE | Login Directorio Activo note text and its icon stroke. | .plan/source-map/10-synthesis.md:591 |
| text.onDark.banner | #EFE2F5 | Yarbis insight banner text on {dark.surface}. | .plan/source-map/10-synthesis.md:591 |
| text.onDark.navIcon | #C9B3DE | Sidebar icon, allowed and not active. | .plan/source-map/10-synthesis.md:591 |
| text.onDark.navText | #E4D8F0 | Sidebar label, allowed and not active. | .plan/source-map/10-synthesis.md:591 |
| text.onDark.navToggle | #B394CE | Sidebar collapse/expand toggle label. | .plan/source-map/10-synthesis.md:591 |
| text.onDark.locked | #5C3E78 | Sidebar icon and label for items the role cannot open. | .plan/source-map/10-synthesis.md:591 |

## Border

Border and focus ring colours.

| Token Path | Value | Usage | Source |
|---|---|---|---|
| border.default | #DFE2E6 | Default border (171): cards (1px solid, flat), header bottom border, inputs. | .plan/source-map/10-synthesis.md:584 |
| border.subtle | #EEF0F2 | Subtle divider: slide footer line. | .plan/source-map/10-synthesis.md:584 |
| border.focus | {info.mid} | Focus ring colour (:focus-visible outline). | .plan/source-map/10-synthesis.md:665 |

## Surface

Page and card surface colours.

| Token Path | Value | Usage | Source |
|---|---|---|---|
| surface.page | #F5F6F7 | App page background, chart tracks, neutral chips, "Anterior" hover (183). | .plan/source-map/10-synthesis.md:585 |
| surface.card | #FFFFFF | Cards, header, modals (303 uses of #fff). | .plan/source-map/10-synthesis.md:585 |
| surface.header | {surface.card} | App header background (64px, border-bottom {border.default}). | .plan/source-map/10-synthesis.md:666 |

## Neutral

Neutral colours (DS extra step, not used in prototype).

| Token Path | Value | Usage | Source |
|---|---|---|---|
| neutral.dsExtra | #687489 | Ecopetrol DS neutral step not used by the prototype. Recorded for completeness only. | .plan/source-map/10-synthesis.md:585 |

## Dark

Dark mode surface and text colours.

| Token Path | Value | Usage | Source |
|---|---|---|---|
| dark.bg | #120823 | Dark background: login, gate, thumbnails. | .plan/source-map/10-synthesis.md:589 |
| dark.surface | #1A1033 | Dark surface: sidebar, Yarbis banner, slide appendix/cover. | .plan/source-map/10-synthesis.md:589 |
| dark.card | #24124A | README "conceptual" dark card, unused by the prototype (CF-44). | .plan/source-map/10-synthesis.md:589 |
| dark.dotBorder | #240F40 | Border of the unread dot on the sidebar. | .plan/source-map/10-synthesis.md:590 |
| dark.gateBorder | #3D2A63 | Access gate card border. | .plan/source-map/10-synthesis.md:590 |
| dark.adminTile | #334155 | Admin back office icon tile. | .plan/source-map/10-synthesis.md:590 |
| dark.divider | #FFFFFF14 | Divider on dark surfaces. | .plan/source-map/10-synthesis.md:591 |
| dark.glassCard | #FFFFFF08 | Glass card fill on dark surfaces. | .plan/source-map/10-synthesis.md:592 |
| dark.glassBorder | #FFFFFF1F | Glass card border on dark surfaces. | .plan/source-map/10-synthesis.md:592 |
| dark.inputBg | #FFFFFF14 | Input fill on dark surfaces. | .plan/source-map/10-synthesis.md:592 |
| dark.inputBorder | #FFFFFF2E | Input border on dark surfaces. | .plan/source-map/10-synthesis.md:592 |
| dark.hover | #FFFFFF0F | "Salir" hover background on the sidebar. Cross-check addition from HTML hover states. | .plan/source-map/02-prototype-html.md:629 |

## Status

Status colours: success, warning, danger.

| Token Path | Value | Usage | Source |
|---|---|---|---|
| status.success.base | #10B981 | Success base. | .plan/source-map/10-synthesis.md:598 |
| status.success.text | #047857 | Success text. | .plan/source-map/10-synthesis.md:598 |
| status.success.bg | #D1FAE5 | Success background. | .plan/source-map/10-synthesis.md:598 |
| status.success.pillBorder | #A7E8CB | Success pill border. | .plan/source-map/10-synthesis.md:598 |
| status.success.uploadedBg | #F0FDF7 | Uploaded-file box background. | .plan/source-map/10-synthesis.md:598 |
| status.success.uploadedBorder | #A7F3D0 | Uploaded-file box border. | .plan/source-map/10-synthesis.md:598 |
| status.warning.base | #FBBF24 | Warning base; also Transversal accent, ranking leader and Repsol. | .plan/source-map/10-synthesis.md:599 |
| status.warning.text | #92400E | Warning text. | .plan/source-map/10-synthesis.md:599 |
| status.warning.bg | #FEF3C7 | Warning background. | .plan/source-map/10-synthesis.md:599 |
| status.warning.estimateInputBg | #FEF9E7 | Estimated-value input background. | .plan/source-map/10-synthesis.md:599 |
| status.warning.noteBg | #FFFBEB | Slide comment note background. | .plan/source-map/10-synthesis.md:599 |
| status.warning.noteBorder | #FDE68A | Slide comment note border. | .plan/source-map/10-synthesis.md:599 |
| status.warning.noteText | #78350F | Slide comment note text. | .plan/source-map/10-synthesis.md:599 |
| status.danger.base | #EF4444 | Danger base; card/row ✕ hover. | .plan/source-map/10-synthesis.md:600 |
| status.danger.text | #9A1616 | Danger text. CF-43: single token #9A1616 (13 uses) wins over #991B1B (9 uses). | .plan/source-map/10-synthesis.md:600 |
| status.danger.textLegacy | #991B1B | Second danger text value found in the HTML; aliased to {status.danger.text} (CF-43). | .plan/source-map/10-synthesis.md:600 |
| status.danger.bg | #FEE2E2 | Danger background. | .plan/source-map/10-synthesis.md:600 |
| status.danger.pillBorder | #F9BDBD | Danger pill border. | .plan/source-map/10-synthesis.md:600 |
| status.danger.missingRowBg | #FEF2F2 | Slide "missing" row background. | .plan/source-map/10-synthesis.md:600 |

## Severity

Severity level colours for INFO/SUCCESS/WARN/ERROR banners.

| Token Path | Value | Usage | Source |
|---|---|---|---|
| severity.info.base | {info.mid} | Severity "INFO" accent. | .plan/source-map/10-synthesis.md:601 |
| severity.info.bg | {info.bg} | Severity "INFO" background. | .plan/source-map/10-synthesis.md:601 |
| severity.success.base | {status.success.base} | Severity "OK" accent. | .plan/source-map/10-synthesis.md:601 |
| severity.success.bg | {status.success.bg} | Severity "OK" background. | .plan/source-map/10-synthesis.md:601 |
| severity.warn.base | {status.warning.base} | Severity "ATENCIÓN" accent. | .plan/source-map/10-synthesis.md:601 |
| severity.warn.bg | {status.warning.bg} | Severity "ATENCIÓN" background. | .plan/source-map/10-synthesis.md:601 |
| severity.error.base | {status.danger.base} | Severity "CRÍTICO" accent. | .plan/source-map/10-synthesis.md:601 |
| severity.error.bg | {status.danger.bg} | Severity "CRÍTICO" background. | .plan/source-map/10-synthesis.md:601 |

## Tier

Tier badges (Líder, Estratégico, Seguimiento, Prioritario).

| Token Path | Value | Usage | Source |
|---|---|---|---|
| tier.1.base | {status.success.base} | Tier 1 "Líder" badge. | .plan/source-map/10-synthesis.md:602 |
| tier.1.text | {text.inverse} | Tier 1 badge text. | .plan/source-map/10-synthesis.md:602 |
| tier.1.card | {status.success.bg} | Tier 1 card background. | .plan/source-map/10-synthesis.md:602 |
| tier.2.base | #34D399 | Tier 2 "Estratégico" badge. | .plan/source-map/10-synthesis.md:602 |
| tier.2.text | {status.success.text} | Tier 2 badge text. | .plan/source-map/10-synthesis.md:602 |
| tier.2.card | {status.success.bg} | Tier 2 card background. | .plan/source-map/10-synthesis.md:602 |
| tier.3.base | {status.warning.base} | Tier 3 "Seguimiento" badge. | .plan/source-map/10-synthesis.md:602 |
| tier.3.text | {status.warning.text} | Tier 3 badge text. | .plan/source-map/10-synthesis.md:602 |
| tier.3.card | {status.warning.bg} | Tier 3 card background. | .plan/source-map/10-synthesis.md:602 |
| tier.4.base | {status.danger.base} | Tier 4 "Prioritario" badge. | .plan/source-map/10-synthesis.md:602 |
| tier.4.text | {text.inverse} | Tier 4 badge text. | .plan/source-map/10-synthesis.md:602 |
| tier.4.card | {status.danger.bg} | Tier 4 card background. | .plan/source-map/10-synthesis.md:602 |

## Urgency

Urgency level colours for plan modals.

| Token Path | Value | Usage | Source |
|---|---|---|---|
| urgency.high.bg | {status.danger.bg} | "Urgencia Alta" background (plan modal). | .plan/source-map/10-synthesis.md:603 |
| urgency.high.text | {status.danger.text} | "Urgencia Alta" text. | .plan/source-map/10-synthesis.md:603 |
| urgency.medium.bg | {status.warning.bg} | "Urgencia Media" background. | .plan/source-map/10-synthesis.md:603 |
| urgency.medium.text | {status.warning.text} | "Urgencia Media" text. | .plan/source-map/10-synthesis.md:603 |

## Variation

Variation indicator colours (positive/negative/neutral).

| Token Path | Value | Usage | Source |
|---|---|---|---|
| variation.positive | {status.success.base} | Positive variation / trend up (synthesis trend.up). Colour follows the sign (CF-71). | .plan/source-map/10-synthesis.md:620 |
| variation.negative | {status.danger.base} | Negative variation / trend down (synthesis trend.down). CF-71. | .plan/source-map/10-synthesis.md:620 |
| variation.neutral | {text.muted} | Flat / zero variation (synthesis trend.flat) [inference in synthesis]. | .plan/source-map/10-synthesis.md:620 |

## Chart

Chart palette for Ecopetrol, peers, and series.

| Token Path | Value | Usage | Source |
|---|---|---|---|
| chart.highlight | #83E377 | Ecopetrol highlight: always Ecopetrol, never a peer; excluded from chart.series. Normalised in PQ-only modules (CF-11). | .plan/source-map/10-synthesis.md:609 |
| chart.ecopetrol | {chart.highlight} | Synthesis name for the Ecopetrol series colour. | .plan/source-map/10-synthesis.md:609 |
| chart.peer | #B3B9C4 | Peer series (neutral grey); also scrollbar thumb. | .plan/source-map/10-synthesis.md:610 |
| chart.track | {surface.page} | Bar track background. | .plan/source-map/10-synthesis.md:610 |
| chart.ecoChip.bg | #EAFBE4 | Ecopetrol chip background (Visualización / Monitor). | .plan/source-map/10-synthesis.md:611 |
| chart.ecoChip.border | {chart.highlight} | Ecopetrol chip border. | .plan/source-map/10-synthesis.md:611 |
| chart.ecoChip.text | #2E7D1E | Ecopetrol chip text. | .plan/source-map/10-synthesis.md:611 |
| chart.ecoChip.rowBg | #E9FBF8 | Ecopetrol row background. | .plan/source-map/10-synthesis.md:611 |
| chart.leader.avatar | {status.warning.base} | Ranking #1 avatar. | .plan/source-map/10-synthesis.md:612 |
| chart.leader.rowBg | {status.warning.bg} | Ranking #1 row background. | .plan/source-map/10-synthesis.md:612 |
| chart.leader.text | {status.warning.text} | Ranking #1 text. | .plan/source-map/10-synthesis.md:612 |
| chart.detail.2024 | {border.default} | Detail grouped bars, 2024 series. | .plan/source-map/10-synthesis.md:613 |
| chart.detail.2025 | {chart.series.1} | Detail grouped bars, 2025 series. | .plan/source-map/10-synthesis.md:613 |
| chart.detail.ecoColumnBg | #F0F7FC | Ecopetrol column background in the detail chart (synthesis name highlight.ecoDetailBg). | .plan/source-map/10-synthesis.md:577 |
| chart.average | {brand.primary} | "Promedio pares: {x}" line, dashed, width {size.stroke.average}. | .plan/source-map/10-synthesis.md:614 |
| chart.monitor | {brand.primary} | Monitor ranking and history series. | .plan/source-map/10-synthesis.md:615 |
| chart.tbgGroup | {chart.series.4} | TBG members in Ranking TBG (others {chart.peer}). | .plan/source-map/10-synthesis.md:616 |
| chart.aspiration.crudo | #3E1573 | Aspiration stacked bars (kbpe/d): crudo. | .plan/source-map/10-synthesis.md:617 |
| chart.aspiration.gas | {brand.navActive} | Aspiration stacked bars: gas. | .plan/source-map/10-synthesis.md:617 |
| chart.aspiration.noConvencional | #47797A | Aspiration stacked bars: no convencional. | .plan/source-map/10-synthesis.md:617 |
| chart.aspiration.bajasEmisiones | {chart.series.4} | Aspiration stacked bars: bajas emisiones. | .plan/source-map/10-synthesis.md:617 |
| chart.series.1 | #2C699A | Categorical series 1. Order of the adopted Coolors palette [inference in synthesis]; #83E377 excluded (reserved). | .plan/source-map/10-synthesis.md:618 |
| chart.series.2 | #048BA8 | Categorical series 2. | .plan/source-map/10-synthesis.md:618 |
| chart.series.3 | #0DB39E | Categorical series 3. | .plan/source-map/10-synthesis.md:618 |
| chart.series.4 | #16DB93 | Categorical series 4. | .plan/source-map/10-synthesis.md:618 |
| chart.series.5 | #B9E769 | Categorical series 5. | .plan/source-map/10-synthesis.md:618 |
| chart.series.6 | #EFEA5A | Categorical series 6. | .plan/source-map/10-synthesis.md:618 |
| chart.series.7 | #F1C453 | Categorical series 7. | .plan/source-map/10-synthesis.md:618 |
| chart.series.8 | #F29E4C | Categorical series 8. | .plan/source-map/10-synthesis.md:618 |
| chart.series.9 | {brand.navActive} | Categorical series 9 (#7C35EA, same value as the active nav). | .plan/source-map/10-synthesis.md:618 |
| chart.category.financiero | {info.icon} | Monitor composition donut: Financiero. | .plan/source-map/10-synthesis.md:619 |
| chart.category.mercado | {ai.accent} | Donut: Mercado. | .plan/source-map/10-synthesis.md:619 |
| chart.category.estrategico | {brand.navActive} | Donut: Estratégico. | .plan/source-map/10-synthesis.md:619 |
| chart.category.gruposInteres | #0F9B8E | Donut: Grupos de Interés. | .plan/source-map/10-synthesis.md:619 |

## Dimension

Dimension palette colours (two coexisting V2 palettes).

| Token Path | Value | Usage | Source |
|---|---|---|---|
| dimension.share.financiera | {chart.series.1} | Dimension share palette (Visualización composition, Monitor "Peso por dimensión"): Financiera. CF-42: first of two coexisting palettes. | .plan/source-map/10-synthesis.md:626 |
| dimension.share.operativa | {chart.series.3} | Dimension share palette: Operativa (CF-42). | .plan/source-map/10-synthesis.md:626 |
| dimension.share.transversal | {chart.series.7} | Dimension share palette: Transversal (CF-42). | .plan/source-map/10-synthesis.md:626 |
| dimension.accent.financiera | {brand.primary} | Dimension accent palette (DIM_COLORS: Resultados edit squares, Horizonte TBG bars, slides, weight editor): Financiera. CF-42. | .plan/source-map/10-synthesis.md:627 |
| dimension.accent.operativa | {ai.accent} | Dimension accent palette: Operativa (CF-42). | .plan/source-map/10-synthesis.md:627 |
| dimension.accent.transversal | {status.warning.base} | Dimension accent palette: Transversal (CF-42). | .plan/source-map/10-synthesis.md:627 |
| dimension.accent.finOp | #94A3B8 | Dimension accent palette: Fin/Op (CF-42). | .plan/source-map/10-synthesis.md:627 |
| dimension.text.financiera | {brand.primary} | Horizonte KPI numbers and dimension cards: Financiera. | .plan/source-map/10-synthesis.md:628 |
| dimension.text.operativa | {ai.text} | Horizonte KPI numbers: Operativa. | .plan/source-map/10-synthesis.md:628 |
| dimension.text.transversal | {status.warning.text} | Horizonte KPI numbers: Transversal. | .plan/source-map/10-synthesis.md:628 |
| dimension.tip.financiera.bg | {brand.primarySubtle} | Composition segment tip background: Financiera. | .plan/source-map/10-synthesis.md:629 |
| dimension.tip.financiera.fg | {brand.primary} | Segment tip accent: Financiera. | .plan/source-map/10-synthesis.md:629 |
| dimension.tip.operativa.bg | {ai.bg} | Segment tip background: Operativa. | .plan/source-map/10-synthesis.md:629 |
| dimension.tip.operativa.fg | {ai.accent} | Segment tip accent: Operativa. | .plan/source-map/10-synthesis.md:629 |
| dimension.tip.transversal.bg | {status.warning.bg} | Segment tip background: Transversal. | .plan/source-map/10-synthesis.md:629 |
| dimension.tip.transversal.fg | {status.warning.base} | Segment tip accent: Transversal. | .plan/source-map/10-synthesis.md:629 |

## Company

| Token Path | Value | Usage | Source |
|---|---|---|---|
| company.ecopetrol | {chart.highlight} | Ecopetrol, exclusive colour (CF-47). | .plan/source-map/10-synthesis.md:635 |
| company.bp | {chart.series.2} | BP (PVC map, CF-47). | .plan/source-map/10-synthesis.md:633 |
| company.equinor | {chart.series.4} | Equinor (CF-47). | .plan/source-map/10-synthesis.md:633 |
| company.shell | {chart.series.8} | Shell (PVC map, CF-47). Deviation logged: Shell chip is #83E377 in PQ 3/4 and UP 5.24.46 and in the HTML HOM/NEWS map; not adopted because #83E377 is Ecopetrol-only (OQ-13). | .plan/source-map/10-synthesis.md:634 |
| company.totalEnergies | {chart.series.5} | TotalEnergies / Total (CF-47). | .plan/source-map/10-synthesis.md:634 |
| company.oxy | {chart.series.6} | Oxy (CF-47). | .plan/source-map/10-synthesis.md:634 |
| company.petrobras | {chart.series.1} | Petrobras (PVC map; HOM map had #F29E4C, CF-47). | .plan/source-map/10-synthesis.md:634 |
| company.chevron | {brand.navActive} | Chevron (CF-47). | .plan/source-map/10-synthesis.md:634 |
| company.isa | {chart.series.7} | ISA (CF-47). | .plan/source-map/10-synthesis.md:634 |
| company.exxon | {chart.series.3} | Exxon (PVC map; HOM map had #3B82F6, not adopted, CF-47). | .plan/source-map/10-synthesis.md:635 |
| company.pttep | {legacy.magenta} | PTTEP, extension from the HOM map; legacy magenta pending PO confirmation (OQ-13). | .plan/source-map/10-synthesis.md:635 |
| company.repsol | {status.warning.base} | Repsol, extension from the HOM map (CF-47). | .plan/source-map/10-synthesis.md:635 |
| company.fallback | {text.secondary} | Fallback for unmapped peers (ConocoPhillips, Pemex, ENI, Geopark, Parex, Gran Tierra, YPF, utilities → OQ-13). | .plan/source-map/10-synthesis.md:636 |

## Gradient

Gradient definitions for login, header, and overlays.

| Token Path | Value | Usage | Source |
|---|---|---|---|
| gradient.loginCta | color: {brand.indigo}; position: 0, color: {ai.accent}; position: 1 | Login "Ingresar" button, 90deg indigo → cyan. | .plan/source-map/10-synthesis.md:642 |
| gradient.headerStrip | color: {info.mid}; position: 0, color: {brand.primary}; position: 0.5, color: {ai.accent}; position: 1 | 4px strip above the header on every app screen (CF-09); height {size.layout.headerStrip}. | .plan/source-map/10-synthesis.md:642 |
| gradient.loginOverlay | color: #140A30B8; position: 0.4, color: #1C0F4080; position: 1 | Login background image overlay. | .plan/source-map/10-synthesis.md:642 |
| gradient.gateOverlay | color: #140A30D1; position: 0.4, color: #1C0F40B3; position: 1 | Access gate background overlay. | .plan/source-map/10-synthesis.md:642 |
| gradient.slideCover | color: #12082300; position: 0.35, color: #120823EB; position: 1 | Slide cover image fade to {dark.bg}. | .plan/source-map/10-synthesis.md:642 |
| gradient.slideGlow | color: {template.directorio}; position: 0, color: #FFFFFF00; position: 0.7 | Slide corner glow. The first stop is the template accent ({template.*}) at alpha 0x22; the value shows the Directorio accent. | .plan/source-map/10-synthesis.md:642 |

## Overlay

Overlay scrim colours.

| Token Path | Value | Usage | Source |
|---|---|---|---|
| overlay.scrim | #1C253580 | Modal scrim ({text.heading} at 50%). | .plan/source-map/10-synthesis.md:643 |
| overlay.previewScrim | #120823B8 | PPT preview scrim ({dark.bg} at 72%). | .plan/source-map/10-synthesis.md:643 |

## Font

Typography font families and composite styles.

| Token Path | Value | Usage | Source |
|---|---|---|---|
| font.family.sans | Roboto,system-ui,sans-serif | Roboto 400/500/600/700, self-hosted (no Google Fonts CDN) [inference: CSP]. Fallback stack from the HTML body rule. | .plan/source-map/10-synthesis.md:648 |
| font.family.mono | Roboto Mono,ui-monospace,monospace | Roboto Mono for numbers and codes; load 400/500/600/700 (HTML loads only 500/600 and synthesises 400/700). Fallback stack is a decision (not in the sources). | .plan/source-map/10-synthesis.md:648 |
| font.weight.regular | 400 | Regular. | .plan/source-map/10-synthesis.md:648 |
| font.weight.medium | 500 | Medium. | .plan/source-map/10-synthesis.md:648 |
| font.weight.semibold | 600 | Semibold. | .plan/source-map/10-synthesis.md:648 |
| font.weight.bold | 700 | Bold. | .plan/source-map/10-synthesis.md:648 |
| font.lineHeight.display | 1.18 | Explicit line-height of the login display heading. | .plan/source-map/10-synthesis.md:650 |
| font.lineHeight.snug | 1.45 | Explicit line-height found in the HTML. | .plan/source-map/10-synthesis.md:655 |
| font.lineHeight.normal | 1.5 | Explicit line-height found in the HTML. | .plan/source-map/10-synthesis.md:655 |
| font.lineHeight.relaxed | 1.6 | Explicit line-height found in the HTML (login hero paragraph). | .plan/source-map/10-synthesis.md:655 |
| font.lineHeight.loose | 1.65 | Explicit line-height found in the HTML. | .plan/source-map/10-synthesis.md:655 |
| font.letterSpacing.eyebrow | 0.04em | Uppercase eyebrow tracking. | .plan/source-map/10-synthesis.md:653 |
| font.role.displayLogin | fontFamily: {font.family.sans}; fontWeight: {font.weight.bold}; fontSize: {size.font.44}; lineHeight: {font.lineHeight.display} | Login H1 (700 44px/1.18). | .plan/source-map/10-synthesis.md:650 |
| font.role.displayCover | fontFamily: {font.family.sans}; fontWeight: {font.weight.bold}; fontSize: {size.font.34} | Slide cover title. | .plan/source-map/10-synthesis.md:650 |
| font.role.displayTier | fontFamily: {font.family.sans}; fontWeight: {font.weight.bold}; fontSize: {size.font.30} | Tier / "Gracias" display. | .plan/source-map/10-synthesis.md:650 |
| font.role.kpiXl | fontFamily: {font.family.sans}; fontWeight: {font.weight.bold}; fontSize: {size.font.26} | Big numbers (26px). | .plan/source-map/10-synthesis.md:651 |
| font.role.kpiLg | fontFamily: {font.family.sans}; fontWeight: {font.weight.bold}; fontSize: {size.font.24} | Big numbers (24px). | .plan/source-map/10-synthesis.md:651 |
| font.role.kpi | fontFamily: {font.family.sans}; fontWeight: {font.weight.bold}; fontSize: {size.font.22} | KPI values; also login card title. | .plan/source-map/10-synthesis.md:651 |
| font.role.titleSlide | fontFamily: {font.family.sans}; fontWeight: {font.weight.bold}; fontSize: {size.font.22} | Slide title. | .plan/source-map/10-synthesis.md:651 |
| font.role.titleDetail | fontFamily: {font.family.sans}; fontWeight: {font.weight.bold}; fontSize: {size.font.20} | Detail title, homologation %. | .plan/source-map/10-synthesis.md:651 |
| font.role.titleModal | fontFamily: {font.family.sans}; fontWeight: {font.weight.bold}; fontSize: {size.font.17} | Modal titles. | .plan/source-map/10-synthesis.md:652 |
| font.role.titleHeader | fontFamily: {font.family.sans}; fontWeight: {font.weight.semibold}; fontSize: {size.font.16} | App header title. | .plan/source-map/10-synthesis.md:652 |
| font.role.titleCard | fontFamily: {font.family.sans}; fontWeight: {font.weight.semibold}; fontSize: {size.font.15} | Card title (15px). | .plan/source-map/10-synthesis.md:652 |
| font.role.titleCardSm | fontFamily: {font.family.sans}; fontWeight: {font.weight.semibold}; fontSize: {size.font.14} | Card title (14px, most used). | .plan/source-map/10-synthesis.md:652 |
| font.role.body | fontFamily: {font.family.sans}; fontWeight: {font.weight.regular}; fontSize: {size.font.13} | Body text. | .plan/source-map/10-synthesis.md:652 |
| font.role.bodyStrong | fontFamily: {font.family.sans}; fontWeight: {font.weight.medium}; fontSize: {size.font.13} | Body text, medium. | .plan/source-map/10-synthesis.md:652 |
| font.role.small | fontFamily: {font.family.sans}; fontWeight: {font.weight.regular}; fontSize: {size.font.12} | Small text (most used shorthand, 118). | .plan/source-map/10-synthesis.md:653 |
| font.role.smallMedium | fontFamily: {font.family.sans}; fontWeight: {font.weight.medium}; fontSize: {size.font.12} | Small text, medium (107). | .plan/source-map/10-synthesis.md:653 |
| font.role.smallStrong | fontFamily: {font.family.sans}; fontWeight: {font.weight.semibold}; fontSize: {size.font.12} | Small text, semibold. | .plan/source-map/10-synthesis.md:653 |
| font.role.label | fontFamily: {font.family.sans}; fontWeight: {font.weight.regular}; fontSize: {size.font.11} | Labels and meta. | .plan/source-map/10-synthesis.md:653 |
| font.role.eyebrow | fontFamily: {font.family.sans}; fontWeight: {font.weight.semibold}; fontSize: {size.font.11}; letterSpacing: {font.letterSpacing.eyebrow} | Uppercase eyebrow, tracking .04em, colour {text.eyebrow}. | .plan/source-map/10-synthesis.md:653 |
| font.role.microStrong | fontFamily: {font.family.sans}; fontWeight: {font.weight.bold}; fontSize: {size.font.10} | Micro text, bold. | .plan/source-map/10-synthesis.md:654 |
| font.role.micro | fontFamily: {font.family.sans}; fontWeight: {font.weight.regular}; fontSize: {size.font.10} | Micro text. | .plan/source-map/10-synthesis.md:654 |
| font.role.monoMarket | fontFamily: {font.family.mono}; fontWeight: {font.weight.bold}; fontSize: {size.font.15} | Market values (Roboto Mono 700 15px). | .plan/source-map/10-synthesis.md:654 |
| font.role.monoInput | fontFamily: {font.family.mono}; fontWeight: {font.weight.semibold}; fontSize: {size.font.12} | Numeric inputs (Roboto Mono 600 12px). | .plan/source-map/10-synthesis.md:654 |

## Size

Size tokens for strokes, spacing.

| Token Path | Value | Usage | Source |
|---|---|---|---|
| size.font.10 | 10px | Font size 10px (prototype role scale). | .plan/source-map/10-synthesis.md:654 |
| size.font.11 | 11px | Font size 11px (prototype role scale). | .plan/source-map/10-synthesis.md:653 |
| size.font.12 | 12px | Font size 12px (prototype role scale). | .plan/source-map/10-synthesis.md:653 |
| size.font.13 | 13px | Font size 13px (prototype role scale). | .plan/source-map/10-synthesis.md:652 |
| size.font.14 | 14px | Font size 14px (prototype role scale). | .plan/source-map/10-synthesis.md:652 |
| size.font.15 | 15px | Font size 15px (prototype role scale). | .plan/source-map/10-synthesis.md:652 |
| size.font.16 | 16px | Font size 16px (prototype role scale). | .plan/source-map/10-synthesis.md:652 |
| size.font.17 | 17px | Font size 17px (prototype role scale). | .plan/source-map/10-synthesis.md:652 |
| size.font.20 | 20px | Font size 20px (prototype role scale). | .plan/source-map/10-synthesis.md:652 |
| size.font.22 | 22px | Font size 22px (prototype role scale). | .plan/source-map/10-synthesis.md:651 |
| size.font.24 | 24px | Font size 24px (prototype role scale). | .plan/source-map/10-synthesis.md:651 |
| size.font.26 | 26px | Font size 26px (prototype role scale). | .plan/source-map/10-synthesis.md:651 |
| size.font.30 | 30px | Font size 30px (prototype role scale). | .plan/source-map/10-synthesis.md:651 |
| size.font.34 | 34px | Font size 34px (prototype role scale). | .plan/source-map/10-synthesis.md:650 |
| size.font.44 | 44px | Font size 44px (prototype role scale). | .plan/source-map/10-synthesis.md:650 |
| size.icon.default | 20px | Inline outline SVG icon box (20x20). | .plan/source-map/10-synthesis.md:684 |
| size.icon.info | 14px | Info "i" tooltip circle, 14-16px; 14px chosen as default [decision within README range]. | .plan/source-map/01-handoff-docs.md:125 |
| size.stroke.icon | 1.6px | Icon stroke width, lower bound of 1.6-1.8. | .plan/source-map/10-synthesis.md:684 |
| size.stroke.iconStrong | 1.8px | Icon stroke width, upper bound of 1.6-1.8. | .plan/source-map/10-synthesis.md:684 |
| size.stroke.average | 1.5px | Dashed "Promedio pares" line width. | .plan/source-map/10-synthesis.md:614 |
| size.layout.sidebarExpanded | 220px | Sidebar width, expanded. | .plan/source-map/10-synthesis.md:666 |
| size.layout.sidebarCollapsed | 68px | Sidebar width, collapsed. | .plan/source-map/10-synthesis.md:666 |
| size.layout.header | 64px | Header height. | .plan/source-map/10-synthesis.md:666 |
| size.layout.headerStrip | 4px | Gradient strip height above the header (CF-09). | .plan/source-map/10-synthesis.md:666 |
| size.layout.rightRail | 300px | Right rail width (Resultados, Visualización). | .plan/source-map/10-synthesis.md:666 |
| size.layout.canvas | 1440px | Design canvas width (1440x900). | .plan/source-map/10-synthesis.md:668 |
| size.layout.maxWidth.wizard | 960px | Max width: Definición wizard. | .plan/source-map/10-synthesis.md:666 |
| size.layout.maxWidth.detalle | 980px | Max width: Detalle de indicador. | .plan/source-map/10-synthesis.md:667 |
| size.layout.maxWidth.monitor | 840px | Max width: Monitor de Valor and Sensibilidades. | .plan/source-map/10-synthesis.md:667 |
| size.layout.maxWidth.presentationDetail | 900px | Max width: presentation detail. | .plan/source-map/10-synthesis.md:667 |
| size.layout.maxWidth.notificaciones | 760px | Max width: Notificaciones. | .plan/source-map/10-synthesis.md:667 |
| size.layout.maxWidth.config | 560px | Max width: Configuración. | .plan/source-map/10-synthesis.md:667 |
| size.layout.maxWidth.preview | 1180px | Max width: PPT preview. | .plan/source-map/10-synthesis.md:667 |
| size.control.iconButton.sm | 26px | IconButton small, 26px round (carousel prev / next); src/shared/ui/primitives/icon-button/IconButton.tsx (P5-11). | docs/design/component-catalog.md:524 |
| size.control.iconButton.md | 36px | IconButton default, 36px round (header bell / help); src/shared/ui/primitives/icon-button/IconButton.tsx (P5-11). | docs/design/component-catalog.md:27 |
| size.chart.winBar | 80px | WinMiniBar track width (win ratio mini-bar 80×6); src/shared/ui/charts/primitives (P5-18). | .plan/source-map/02-prototype-html.md:409 |
| size.chart.stackedBar.sm | 26px | StackedShareBar compact height (per-company stacked bars 26px); src/shared/ui/charts/primitives (P5-18). | .plan/source-map/02-prototype-html.md:414 |
| size.chart.stackedBar.md | 30px | StackedShareBar default height (Ecopetrol 100 % stacked bar 30px); src/shared/ui/charts/primitives (P5-18). | .plan/source-map/02-prototype-html.md:414 |

## Space

Spacing tokens for layout.

| Token Path | Value | Usage | Source |
|---|---|---|---|
| space.2 | 2px | Spacing 2px (2 "gap:2px" uses in the HTML). Synthesis: gaps 10-28, Inicio 28. | .plan/source-map/10-synthesis.md:666 |
| space.3 | 3px | Spacing 3px (5 "gap:3px" uses in the HTML). Synthesis: gaps 10-28, Inicio 28. | .plan/source-map/10-synthesis.md:666 |
| space.4 | 4px | Spacing 4px (4 "gap:4px" uses in the HTML). Synthesis: gaps 10-28, Inicio 28. | .plan/source-map/10-synthesis.md:666 |
| space.5 | 5px | Spacing 5px (23 "gap:5px" uses in the HTML). Synthesis: gaps 10-28, Inicio 28. | .plan/source-map/10-synthesis.md:666 |
| space.6 | 6px | Spacing 6px (101 "gap:6px" uses in the HTML). Synthesis: gaps 10-28, Inicio 28. | .plan/source-map/10-synthesis.md:666 |
| space.8 | 8px | Spacing 8px (85 "gap:8px" uses in the HTML). Synthesis: gaps 10-28, Inicio 28. | .plan/source-map/10-synthesis.md:666 |
| space.10 | 10px | Spacing 10px (52 "gap:10px" uses in the HTML). Synthesis: gaps 10-28, Inicio 28. | .plan/source-map/10-synthesis.md:666 |
| space.12 | 12px | Spacing 12px (63 "gap:12px" uses in the HTML). Synthesis: gaps 10-28, Inicio 28. | .plan/source-map/10-synthesis.md:666 |
| space.14 | 14px | Spacing 14px (22 "gap:14px" uses in the HTML). Synthesis: gaps 10-28, Inicio 28. | .plan/source-map/10-synthesis.md:666 |
| space.16 | 16px | Spacing 16px (42 "gap:16px" uses in the HTML). Synthesis: gaps 10-28, Inicio 28. | .plan/source-map/10-synthesis.md:666 |
| space.18 | 18px | Spacing 18px (6 "gap:18px" uses in the HTML). Synthesis: gaps 10-28, Inicio 28. | .plan/source-map/10-synthesis.md:666 |
| space.20 | 20px | Spacing 20px (10 "gap:20px" uses in the HTML). Synthesis: gaps 10-28, Inicio 28. | .plan/source-map/10-synthesis.md:666 |
| space.22 | 22px | Spacing 22px (1 "gap:22px" uses in the HTML). Synthesis: gaps 10-28, Inicio 28. | .plan/source-map/10-synthesis.md:666 |
| space.24 | 24px | Spacing 24px (3 "gap:24px" uses in the HTML). Synthesis: gaps 10-28, Inicio 28. | .plan/source-map/10-synthesis.md:666 |
| space.28 | 28px | Spacing 28px (1 "gap:28px" uses in the HTML). Synthesis: gaps 10-28, Inicio 28. | .plan/source-map/10-synthesis.md:666 |
| space.32 | 32px | Spacing 32px (3 "gap:32px" uses in the HTML). Synthesis: gaps 10-28, Inicio 28. | .plan/source-map/10-synthesis.md:666 |
| space.48 | 48px | Spacing 48px (1 "gap:48px" uses in the HTML). Synthesis: gaps 10-28, Inicio 28. | .plan/source-map/10-synthesis.md:666 |
| space.64 | 64px | Spacing 64px (1 "gap:64px" uses in the HTML). Synthesis: gaps 10-28, Inicio 28. | .plan/source-map/10-synthesis.md:666 |
| space.72 | 72px | Spacing 72px: width of the md NumberInput (component catalogue "md (width 72–78)"; src/shared/ui/primitives/inputs/NumberInput.tsx, P5-TK4). | docs/progress/STATUS.md:108 |
| space.content.top | 28px | Content area padding top (28px 32px 100px). | .plan/source-map/10-synthesis.md:666 |
| space.content.x | 32px | Content area padding left/right. | .plan/source-map/10-synthesis.md:666 |
| space.content.bottom | 100px | Content area padding bottom (clears the FAB). | .plan/source-map/10-synthesis.md:666 |
| space.section | {space.28} | Gap between Inicio page sections. | .plan/source-map/10-synthesis.md:666 |

## Radius

Border radius tokens.

| Token Path | Value | Usage | Source |
|---|---|---|---|
| radius.legend | 2px | Legend squares. | .plan/source-map/10-synthesis.md:660 |
| radius.xs | 3px | Extra small. | .plan/source-map/10-synthesis.md:660 |
| radius.bar | 4px | Bars. | .plan/source-map/10-synthesis.md:660 |
| radius.barLg | 5px | Bars (large). | .plan/source-map/10-synthesis.md:660 |
| radius.sm | 6px | Small (36 uses). | .plan/source-map/10-synthesis.md:660 |
| radius.control | 8px | Default control / card-inner radius (185 uses). | .plan/source-map/10-synthesis.md:660 |
| radius.nav | 9px | Nav items, login inputs. | .plan/source-map/10-synthesis.md:660 |
| radius.md | 10px | Medium (44 uses). | .plan/source-map/10-synthesis.md:660 |
| radius.card | 12px | Cards (60 uses). README: cards 10-14. | .plan/source-map/10-synthesis.md:660 |
| radius.modal | 14px | Modals, chat. | .plan/source-map/10-synthesis.md:661 |
| radius.loginCard | 16px | Login card. | .plan/source-map/10-synthesis.md:661 |
| radius.pill | 999px | Pills, badges, avatars. | .plan/source-map/10-synthesis.md:661 |

## Shadow

Shadow tokens for elevation.

| Token Path | Value | Usage | Source |
|---|---|---|---|
| shadow.modal | color: #1C25354D; offsetX: 0px; offsetY: 20px; blur: 50px; spread: 0px | Modals (and "floating dots"). | .plan/source-map/10-synthesis.md:662 |
| shadow.previewSlide | color: #00000066; offsetX: 0px; offsetY: 30px; blur: 70px; spread: 0px | PPT preview slide. | .plan/source-map/10-synthesis.md:662 |
| shadow.loginCard | color: #00000059; offsetX: 0px; offsetY: 24px; blur: 60px; spread: 0px | Login card. | .plan/source-map/10-synthesis.md:662 |
| shadow.chat | color: #1C25352E; offsetX: 0px; offsetY: 12px; blur: 32px; spread: 0px | Yarbis chat panel. | .plan/source-map/10-synthesis.md:662 |
| shadow.toast | color: #1C25352E; offsetX: 0px; offsetY: 12px; blur: 30px; spread: 0px | Toast. | .plan/source-map/10-synthesis.md:662 |
| shadow.toastUndo | color: #1C25354D; offsetX: 0px; offsetY: 12px; blur: 30px; spread: 0px | Undo toast. | .plan/source-map/10-synthesis.md:662 |
| shadow.slideStage | color: #1C253526; offsetX: 0px; offsetY: 12px; blur: 30px; spread: 0px | Slide stage. | .plan/source-map/10-synthesis.md:662 |
| shadow.fab | color: #49BCD866; offsetX: 0px; offsetY: 8px; blur: 20px; spread: 0px | Yarbis FAB. | .plan/source-map/10-synthesis.md:662 |
| shadow.drawer | color: #1C25351F; offsetX: -8px; offsetY: 0px; blur: 24px; spread: 0px | Right drawer. Cross-check addition from the HTML (not in synthesis §2.10). | .plan/source-map/02-prototype-html.md:626 |
| shadow.insetRing | color: {surface.card}; offsetX: 0px; offsetY: 0px; blur: 0px; spread: 2px; inset: true | Inset white ring. Cross-check addition from the HTML. | .plan/source-map/02-prototype-html.md:626 |

## Z

Z-index tokens for layering.

| Token Path | Value | Usage | Source |
|---|---|---|---|
| z.fab | 20 | Yarbis FAB. | .plan/source-map/10-synthesis.md:663 |
| z.chat | 20 | Yarbis chat panel. | .plan/source-map/10-synthesis.md:663 |
| z.drawer | 28 | Drawer. | .plan/source-map/10-synthesis.md:663 |
| z.modal | 29 | Modals. | .plan/source-map/10-synthesis.md:663 |
| z.pptPreview | 30 | PPT preview. | .plan/source-map/10-synthesis.md:663 |
| z.upload | 32 | Upload / download dialogs. | .plan/source-map/10-synthesis.md:663 |
| z.toast | 35 | Toasts. | .plan/source-map/10-synthesis.md:663 |

## Breakpoint

Responsive breakpoint tokens (proposal; prototype has none).

| Token Path | Value | Usage | Source |
|---|---|---|---|
| breakpoint.desktop | 1280px | Proposal: full layout supported from 1280px. The prototype has no breakpoints (OQ-16). | .plan/source-map/10-synthesis.md:669 |
| breakpoint.laptop | 1024px | Proposal: sidebar auto-collapsed at 1024px (OQ-16). | .plan/source-map/10-synthesis.md:670 |
| breakpoint.tablet | 768px | Proposal: best-effort layout at 768px (OQ-16). | .plan/source-map/10-synthesis.md:670 |
| breakpoint.canvas | 1440px | Design canvas / reference screenshot width. | .plan/source-map/10-synthesis.md:668 |

## Motion

Motion and animation tokens.

| Token Path | Value | Usage | Source |
|---|---|---|---|
| motion.duration.screenEnter | 300ms | fadeUp screen entrance. | .plan/source-map/10-synthesis.md:664 |
| motion.duration.aiPulse | 2400ms | aiPulse loop (infinite). | .plan/source-map/10-synthesis.md:664 |
| motion.duration.bar | 400ms | Bar width transition. | .plan/source-map/10-synthesis.md:664 |
| motion.duration.barLong | 500ms | Bar width transition (long variant). | .plan/source-map/10-synthesis.md:664 |
| motion.duration.detailBar | 900ms | Detail bar height transition. | .plan/source-map/10-synthesis.md:664 |
| motion.duration.detailBarStagger | 80ms | Delay of the 2025 detail bars. | .plan/source-map/10-synthesis.md:664 |
| motion.duration.progress | 300ms | Sensitivity progress width transition. | .plan/source-map/10-synthesis.md:664 |
| motion.duration.nav | 200ms | Sidebar width transition. | .plan/source-map/10-synthesis.md:664 |
| motion.duration.mountDelay | 60ms | Mount delay before bar animations start. | .plan/source-map/10-synthesis.md:664 |
| motion.easing.standard | 0.25,0.1,0.25,1 | CSS "ease" (fadeUp and transitions). | .plan/source-map/10-synthesis.md:664 |
| motion.distance.fadeUp | 8px | fadeUp translateY start offset (8px → 0). | .plan/source-map/10-synthesis.md:664 |
| motion.distance.aiPulseRing | 10px | aiPulse ring spread at the end of the pulse. | .plan/source-map/10-synthesis.md:664 |
| motion.transition.screenEnter | duration: {motion.duration.screenEnter}; delay: 0ms; timingFunction: {motion.easing.standard} | Screen entrance (keyframes fadeUp: opacity 0→1, translateY {motion.distance.fadeUp}→0). Honour prefers-reduced-motion [inference: WCAG 2.2 AA, BR-27]. | .plan/source-map/10-synthesis.md:664 |
| motion.transition.nav | duration: {motion.duration.nav}; delay: 0ms; timingFunction: {motion.easing.standard} | Sidebar width. | .plan/source-map/10-synthesis.md:664 |
| motion.transition.detailBar2025 | duration: {motion.duration.detailBar}; delay: {motion.duration.detailBarStagger}; timingFunction: {motion.easing.standard} | 2025 detail bar height (staggered). | .plan/source-map/10-synthesis.md:664 |

## Deprecated

Deprecated tokens preserved for compatibility or as historical reference.

| Token Path | Value | Usage | Source |
|---|---|---|---|
| deprecated.quadrant.chevron | #1E3A8A | Quadrant chart colour in dead code (Chevron). | .plan/source-map/10-synthesis.md:637 |
| deprecated.quadrant.exxon | #B91C1C | Quadrant chart colour in dead code (Exxon). | .plan/source-map/10-synthesis.md:637 |
| deprecated.quadrant.repsol | #DB2777 | Quadrant chart colour in dead code (Repsol). | .plan/source-map/10-synthesis.md:638 |
| deprecated.quadrant.ypf | #2563EB | Quadrant chart colour in dead code (YPF). | .plan/source-map/10-synthesis.md:638 |

## File

File-specific icon colours.

| Token Path | Value | Usage | Source |
|---|---|---|---|
| file.pptTile | #D24726 | PPT file tile. | .plan/source-map/10-synthesis.md:644 |
| file.excelIcon | #2D6D06 | Excel icon. | .plan/source-map/10-synthesis.md:644 |

## Template

Presentation template accent colours.

| Token Path | Value | Usage | Source |
|---|---|---|---|
| template.directorio | {brand.primary} | Presentation template accent: Directorio. | .plan/source-map/10-synthesis.md:644 |
| template.storytelling | {ai.accent} | Presentation template accent: Storytelling. | .plan/source-map/10-synthesis.md:644 |
| template.detalleAnalitico | {info.mid} | Presentation template accent: Detalle Analítico. | .plan/source-map/10-synthesis.md:644 |

## Focus

Focus visible outline tokens.

| Token Path | Value | Usage | Source |
|---|---|---|---|
| focus.color | {border.focus} | :focus-visible outline colour. | .plan/source-map/10-synthesis.md:665 |
| focus.width | 2px | :focus-visible outline width (2px solid). | .plan/source-map/10-synthesis.md:665 |
| focus.offset | 2px | :focus-visible outline offset. | .plan/source-map/10-synthesis.md:665 |

## Scrollbar

Custom scrollbar styling tokens.

| Token Path | Value | Usage | Source |
|---|---|---|---|
| scrollbar.thumb | {chart.peer} | Scrollbar thumb. | .plan/source-map/10-synthesis.md:665 |
| scrollbar.width | 8px | Scrollbar width. | .plan/source-map/10-synthesis.md:665 |
| scrollbar.radius | 4px | Scrollbar thumb radius. | .plan/source-map/10-synthesis.md:665 |
