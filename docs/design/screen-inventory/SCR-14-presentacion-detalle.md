## SCR-14 — Presentación · detalle (viewer, "‹ Volver a Presentaciones")

> Conventions: `HTML` = `"D:\Personal\Eco-Comparador\V2 _CUAN_ECO_Comparador 2\BencHUD.dc.html"` (quote the path in shell;
> `Lnnn` = line number). Double-quoted strings are visible Spanish copy, verbatim, with an `HTML Lnnn` pointer; anything not
> literally in `HTML` carries `[inference]` or `[Paquete:<file name>]`. Components are tagged `Cmp:PascalName` (shell names from
> SCR-04; reconciled by P1-17). `CF-nn` → `docs/design/conflicts.md`; `OVL-nn` → `docs/design/overlays.md`; `OQ-nn`, `V-nn`,
> `C-nn` → `.plan/source-map/10-synthesis.md` §8 and §4. The 14 slide kinds are named by id only; their fields and chrome are
> specified in `slide-renderer.md` (P1-15b), shared with OVL-06.

- Source files:
  - Primary (precedence 1): `"D:\Personal\Eco-Comparador\V2 _CUAN_ECO_Comparador 2\BencHUD.dc.html"` viewer branch L2101–2356
    (`hasPresDetail` inside `isPresentaciones`): header L2102–2110, 16:9 stage L2113–2331 (slide renderer L2114–2330), navigation
    L2332–2338, comments L2340–2354. Logic: `presComments` seed L3563–3566, `sendPresComment` L3725–3729, analysis tab
    "Presentación" → detail L3786–3791, `presentacionesRows.onDetail` L4855, `presDetail`/`selTemplate` L4857–4858, `pptSlides`
    L4900, `DETAIL_SLIDES` (unused by the stage) L4901–4908, `pptIdx` L4910, `pptCurrent` L4915, detail accent / nav / dots / close
    L4939–4946, bindings L5447, L5472, L5478.
  - Reference images: none (no image of the viewer in any folder — `03-reference-images.md` §1). Renders (baseline):
    `docs/design/screenshots/prototype/SCR-14@1440-full.png` (+ @1280/@1024/@768).
  - Intent only: `design_handoff_benchud_comparador\README.md` §12 (static `DETAIL_SLIDES` viewer — superseded, CF-18).
  - Spec digests: `.plan/source-map/10-synthesis.md` §1.14 (L465–477), §1.19; `.plan/source-map/02-prototype-html.md` L324
    ("Detail viewer") and L326–342 (renderer).
- Proposed route: `/presentaciones/:presentationId?slide=n` — `slide` 1-based, default 1, clamped to 1..N (V2 state
  `presDetailSlideIdx`, reset to 0 on open, HTML L4855). Entered from SCR-13 "Ver detalle" (HTML L2379), the analysis tab
  "Presentación" when a presentation is linked to the analysis (HTML L3786–3791), notifications and Inicio cards [inference].
  Guard: authenticated, role ≠ explorer_viewer, and the presentation is visible to the user (published, or own draft for the
  analyst) — otherwise `/403` / `404` (SCR-17). Header title "Presentaciones" (HTML L5156). Sidebar active: "Presentaciones".
- Layout:
  - Inside `Cmp:AppShell` (SCR-04) with the analysis tab bar ("Presentación" active).
  - Content root: `display:grid; gap:16px; max-width:900px`, `fadeUp .3s ease` (HTML L2102).
  - Header row: flex `space-between` (HTML L2104) — left "‹ Volver a Presentaciones" (`500 13px #672DBD`, HTML L2103) above the
    title (`700 18px`, HTML L2105); right actions flex gap 8 (HTML L2106).
  - Stage: `aspect-ratio:16/9`, `#fff`, radius 10, shadow `0 12px 30px rgba(28,37,53,.15)`, `overflow:hidden` (HTML L2113); slide
    body scaled to the stage (HTML L2119, `pptBodyScale` 1 in V2).
  - Navigation row centred, gap 6 (HTML L2332): 30px round `#F5F6F7` "‹" / "›" (HTML L2333, L2337) and 8px dots (HTML L2335).
  - Comments card: `#fff`, border `#DFE2E6`, radius 12, padding 18 (HTML L2340).
- Tabs:
  - Analysis tab bar (SCR-04): "Configuración" | "Resultados" | "Presentación" (active).
  - No screen-level tabs; slide navigation is a pager (dots), not tabs.
- Sections:
  1. Back link "‹ Volver a Presentaciones" (HTML L2103).
  2. Title = presentation name (HTML L2105), e.g. "Directorio Ejecutivo T4" (seed, HTML L3559).
  3. Actions "Editar" (HTML L2107), "Descargar" (HTML L2108), "Compartir" (HTML L2109) — outline buttons, no handlers in V2.
  4. Slide stage — current slide of the saved slide list, painted by `Cmp:SlideRenderer` with the presentation's template accent
     (HTML L2113–2331; CF-18). Slide kinds: `title`, `bars`, `table`, `pvc`, `hom`, `homMissing`, `radar`, `hallazgos`, `summary`,
     `ranking`, `categories`, `findings`, `appendix`, `empty` (fields → P1-15b). Chrome (accent bar, glow, module eyebrow, footer
     "ECOPETROL · COMPARADOR FINANCIERO · {template}" + "{n} / {N}", optional "Comentario" band) is renderer-owned (HTML L2114–2122,
     L2319–2330).
  5. Pager: "‹", dots (one per slide, active = template accent, inactive `#DFE2E6`; HTML L4945), "›".
  6. "Comentarios de otros usuarios" (HTML L2341): list of comments (author `· role · time` + text, HTML L2345–2346) and composer
     input "Escribe un comentario..." (HTML L2351) + "Enviar" (HTML L2352). Seeds (HTML L3564–3565): "Jorge Salas" · "Ejecutivo
     visualizador" · "hace 2 días" — "Buen resumen — ¿podemos incluir el comparativo de OPEX en la siguiente diapositiva?";
     "Alejandra Ríos" · "Ejecutivo integral" · "hace 1 día" — "Lista para compartir con el comité."
- Components:
  - `Cmp:AppShell`, `Cmp:SegmentedTabs`, `Cmp:Button` (variant `secondary` outline) — from SCR-04 / SCR-07
  - `Cmp:BackLink` (from SCR-03)
  - `Cmp:PageTitle` (`700 18px`) [inference: generic title]
  - `Cmp:SlideStage` (16:9 frame, shadow, scaling)
  - `Cmp:SlideRenderer` (14 kinds + chrome; shared with OVL-06 `Cmp:SlidePreviewModal`; P1-15b)
  - `Cmp:SlidePager` (with `Cmp:IconButton` 30px "‹"/"›" and `Cmp:PagerDots`)
  - `Cmp:PagerDots`
  - `Cmp:Card`, `Cmp:CommentThread`, `Cmp:CommentItem`, `Cmp:CommentComposer` (shared with SCR-13)
  - `Cmp:Modal` → OVL-07b `Cmp:DownloadModal`
  - `Cmp:OperationProgress` (download export) [inference]
  - `Cmp:SectionResult` (stage and comments load independently)
- Charts: n/a at screen level — each slide's visual (bars, stacked bars, heatmap cells, paired bars, tables) is owned by
  `Cmp:SlideRenderer` and specified in `slide-renderer.md` (P1-15b).
- Tables: n/a at screen level (the `table` slide kind is renderer-owned, P1-15b).
- Filters & controls:
  - Current slide: integer, default 1, **in URL** (`slide`); "‹" disabled on the first slide, "›" disabled on the last (V2 clamps,
    HTML L4943–4944) [inference: disabled look].
  - Keyboard: ← / → change slide, Home / End jump [inference].
  - Comment input: free text, trimmed, empty ignored (HTML L3726–3727); not in URL.
- States:
  - Loading: `V-43` header + stage skeleton (16:9 grey block) and comments skeleton, independent [inference].
  - Empty slide list → renderer `empty` kind "Selecciona al menos un módulo para generar diapositivas." (HTML L2124) with pager
    hidden [inference].
  - Error: presentation not found → `404` (SCR-17); slides load error → `Cmp:SectionResult` error inside the stage with retry;
    comments error → error inside the comments card; comment send failure → inline error under the composer [inference].
  - No permission: `/403`; without `canComment` the composer is hidden; without `canEdit` "Editar" is hidden; without
    `canDownload` "Descargar" is hidden.
  - Uploaded PPT version: the stage still renders the generated slides; "Descargar" delivers the uploaded file when present
    [inference: SCR-13 upload copy says it replaces the generated version].
- Interactions:
  - "‹ Volver a Presentaciones" → `/presentaciones` (V2 `closePresDetail`, HTML L4946).
  - "Editar" (no V2 handler) → `/presentaciones/:id/editar` (builder with saved config, CF-81); analyst only.
  - "Descargar" (no V2 handler) → OVL-07b "Descargar presentación" (PowerPoint (.pptx) / PDF) → `C-14` → `202` → progress →
    mediated download.
  - "Compartir" (no V2 handler) → copy deep link `/presentaciones/:id?slide=n` + toast "✓ Copiado" (OQ-18).
  - "‹" / "›" → previous / next slide (HTML L4943–4944); dot click → that slide (HTML L4945); each updates `?slide=`.
  - "Enviar" → `C-10 POST /api/v1/review-comments` `{ entityType:'presentation', entityId, text }` → appended to the list with the
    session user's name and role, time "ahora" (V2 appends "Camila Bravo" · "Analista creador", HTML L3728).
  - No drawers. Yarbis panel per SCR-04 (screen id `presentaciones`).
- Data fields:
  - `V-43 GET /api/v1/views/presentation-detail/:presentationId` → `meta{ id, name, templateId, templateName, status, createdOn,
    publishedOn }`, `accentKey` (template accent token: directorio `#672DBD`, storytelling `#49BCD8`, analitico `#47A4D5`, HTML
    L3500–3502), `slideRef` (→ `V-42`), `comments{ count }`, `permissions{ canEdit, canDownload, canComment }`.
  - `V-42 GET /api/v1/views/presentation-slides/:presentationId` → `slides[]` (discriminated by `kind`, 14 kinds, `note?`,
    `pageLabel` "n / N") — saved order (as reordered in OVL-06).
  - `V-26 comment-thread` (entity `presentation`) → `comments[]{ id, authorName, roleLabel, createdAt (relative label from BFF, e.g.
    "hace 2 días"), text }` [inference: shared thread view].
  - Commands: `C-10` (comment), `C-14` (export `presentation-pptx` | `presentation-pdf`).
- Role visibility:
  - `analyst_creator`: view any own/published presentation, "Editar", "Descargar", "Compartir", comment/answer.
  - `executive_integral`: view published (and presentations it is invited to preview, M-04 [inference]), "Descargar", "Compartir",
    comment (F32).
  - `executive_viewer`: view published, "Descargar" (§1.19 "presentation" download), "Compartir"; no composer (BR-06, §1.19 comment
    row "–").
  - `explorer_integral`: view published, "Descargar", "Compartir"; no composer [inference: §1.19 comment row "–"].
  - `explorer_viewer`: no access (`/403`).
  - Note: V2 seeds show an "Ejecutivo visualizador" commenting (HTML L3564) — conflicts with §1.19; board rule applied (CF-39),
    seeds kept as data.
- Open questions / assumptions:
  - CF-18: V2 viewer renders the **builder's current slide list** with the presentation's template accent, not the static
    `DETAIL_SLIDES` (HTML L4901–4908, still defined, used only for the unused `presDetailCurrent`) — default: render the
    presentation's **saved** slides (`V-42`), which is the persistent equivalent.
  - CF-81: "Editar", "Descargar", "Compartir" have no handlers in V2 — resolved as above.
  - OQ-18: "Compartir" semantics — default deep link copy.
  - CF-39: executive_viewer commenting in the V2 seed vs §1.19 (no comments for executive_viewer) — §1.19 wins.
  - [inference] Whether consumers see the analyst-authored per-slide "Comentario" band (notes) — default yes, notes are part of the
    published slides.
  - [inference] Comments here and the builder's "Comentarios" (SCR-13) are the same thread per presentation (two V2 lists with
    different seeds, HTML L3554 vs L3563) — default one thread (`V-26`), seeds merged in fixtures.
