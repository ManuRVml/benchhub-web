## SCR-13 — Presentaciones (list "Presentaciones creadas" + "Nueva presentación" builder)

> Conventions: `HTML` = `"D:\Personal\Eco-Comparador\V2 _CUAN_ECO_Comparador 2\BencHUD.dc.html"` (quote the path in shell;
> `Lnnn` = line number). Double-quoted strings are visible Spanish copy, verbatim, with an `HTML Lnnn` pointer; anything not
> literally in `HTML` carries `[inference]` or `[Paquete:<file name>]`. Eyebrow labels are sentence case in the source and
> uppercased by CSS. Components are tagged `Cmp:PascalName` (shell names from SCR-04; reconciled by P1-17). `CF-nn` →
> `docs/design/conflicts.md`; `OVL-nn` → `docs/design/overlays.md`; `OQ-nn`, `V-nn`, `C-nn` → `.plan/source-map/10-synthesis.md`
> §8 and §4. The 14 slide kinds are named here by id only; their fields are specified in `slide-renderer.md` (P1-15b).

- Source files:
  - Primary (precedence 1): `"D:\Personal\Eco-Comparador\V2 _CUAN_ECO_Comparador 2\BencHUD.dc.html"` template L2100–2595 (screen
    block `isPresentaciones`; list + builder = `noPresDetail` branch L2358–2594; the viewer branch L2101–2356 is SCR-14). Logic:
    `TEMPLATES` L3499–3503; initial state L3546 (`selectedTemplate:null`), L3548 (`presLang:'es'`), L3549–3563 (builder state,
    `presSlideTypes`, `presModSel`, `slideNotes` seed, `presCommentsNew` seed, upload/download state, `presentacionesList`);
    `publishNewPres` L3680–3688; `askYarbisNote`/`yarbisNote`/`yarbisAllNotes` L3689–3716; analysis tab "Presentación" L3786–3791;
    `presLangOptions` L3802–3805; `templates`/`presentacionesRows` L4845–4856; `PRES_MODULES` L4859–4867; `presModuleRows`
    L4869–4891; slide list build + order L4892–4899; Yarbis targets / pending count L4912–4914; `openPptPreview` L4947;
    bindings L5196 (`goPresentacionesCreate`), L5401–5426 (templates, Yarbis flags, cover/closing, select all/none, comments,
    `openPresUpload`), L5437 (`openPresDownload`), L5448–5449 (`togglePresCreate`, `presCreateLabel`), L5468, L5470–5471.
  - Overlays: `docs/design/overlays.md` OVL-06 (preview + order, HTML L2624), OVL-07a (upload PPT, HTML L2869), OVL-07b (download,
    HTML L2911); toasts table (publish banner).
  - Reference images (repo copies): `docs/design/screenshots/reference/ho-08-presentaciones.png` (V2 list, "+ Crear presentación")
    and `docs/design/screenshots/reference/pq-4-presentaciones-crear-presentacion.png`
    (= `Paquete_de_Pantallas_24_08_2026\4_Presentaciones-Crear-presentacion.jpg`, list + builder open, button reads "Cancelar").
    Low-res: `V2 _CUAN_ECO_Comparador 2\.thumbnail`. Renders (baseline): `docs/design/screenshots/prototype/SCR-13@1440-full.png`
    (+ @1280/@1024/@768).
  - Intent only (lose against `HTML`): `design_handoff_benchud_comparador\README.md` §12 (flat slide-type chips + "Todos",
    "Editar reabre el asistente" — CF-16); workshop `uploads\Captura de pantalla 2026-09-08 a la(s) 11.52.40 a.m..png`.
  - Spec digests: `.plan/source-map/10-synthesis.md` §1.13 (L436–464), §1.19; `.plan/source-map/02-prototype-html.md` §3 "SCR-12
    Presentaciones" (L296–342; the 02 file numbers screens differently); `.plan/source-map/03-reference-images.md` §3.7.
- Proposed route: `/presentaciones` (list), `/presentaciones/nueva?analysisId=`, `/presentaciones/:presentationId/editar`,
  `/analisis/:analysisId/presentaciones`:
  - `/presentaciones` — list (sidebar "Presentaciones", SCR-04; header title "Presentaciones", HTML L5156).
  - `/presentaciones/nueva?analysisId=` — list + builder open (button label "Cancelar"); entered from "+ Crear presentación"
    (HTML L2389), Resultados/Visualización "Crear presentación" (`goPresentacionesCreate`, HTML L5196) and narrative modal "Usar
    en presentación" (OVL-08). Creates a draft with `C-27` and replaces the URL with `/presentaciones/:presentationId/editar`
    [inference].
  - `/presentaciones/:presentationId/editar` — builder reopened with the saved configuration ("Editar reabre el asistente con la
    configuración guardada", HTML L2366; CF-81).
  - `/analisis/:analysisId/presentaciones` — analysis tab "Presentación" (SCR-04 tab bar): opens the detail (SCR-14) of the
    presentation linked to the analysis, else this list (HTML L3786–3791).
  - Guard: authenticated and role ≠ explorer_viewer (locked → SCR-17 `/403`); `/nueva` and `/editar` require `analyst_creator`.
- Layout:
  - Inside `Cmp:AppShell` (SCR-04) with the analysis tab bar ("Presentación" active; `showAnalysisTabs`, HTML L3796). On the
    sidebar-level route the tab bar binds to `session.analysisContext.defaultAnalysisId` (CF-46, OQ-14).
  - Content root `fadeUp .3s ease`, full content width (HTML L2359).
  - List card: `#fff`, `1px solid #DFE2E6`, radius 12, `overflow:hidden`, `margin-bottom:28px` (HTML L2360); title row padding
    `16px 20px` (HTML L2361); header row `#F5F6F7`, `600 11px #808A9B` uppercase (HTML L2368); rows padding `14px 20px`, border
    `#F5F6F7` (HTML L2372).
  - Success banner above the toggle button (HTML L2386); toggle button `#672DBD`, `margin-bottom:20px` (HTML L2389).
  - Builder card: `#fff`, border `#DFE2E6`, radius 12, padding 24, `display:grid; gap:20px` (HTML L2392); title/date row grid
    `2fr 1fr`, gap 16 (HTML L2395); template grid auto-fill min 220 (`02-prototype-html.md` L308); footer right-aligned, wrap,
    gap 8, top border `#F5F6F7`, padding-top 18 (HTML L2584).
- Tabs:
  - Analysis tab bar (SCR-04): "Configuración" | "Resultados" | "Presentación" (active).
  - No screen-level tabs. "Idioma" and "Tipo de presentación" are single-choice chip/card groups, not tabs.
- Sections:
  1. "Presentaciones creadas" + (i) (HTML L2362–2363), info "Editar reabre el asistente con la configuración guardada; Ver detalle
     abre la presentación para revisarla, descargarla, compartirla o ver comentarios de otros usuarios." (HTML L2366).
  2. Table (HTML L2369–2382) — see Tables.
  3. Banner "✓ Presentación publicada correctamente." (HTML L2386; `#D1FAE5`/`#047857`, radius 10, 3 s, HTML L3687).
  4. Toggle button "+ Crear presentación" / "Cancelar" (HTML L2389, L5449; CF-45 wording).
  5. Builder "Nueva presentación" (HTML L2393), top to bottom:
     1. "Título" (HTML L2397) + "Fecha" (HTML L2401).
     2. "Idioma" (HTML L2407) chips.
     3. "Tipo de presentación" + (i) (HTML L2417–2418), info "Define la paleta y estilo visual de las diapositivas generadas —
        puedes cambiarla luego desde Editar." (HTML L2421); 3 template cards (HTML L2424–2444; data `TEMPLATES` HTML
        L3500–3502), each = 120px preview (accent + `22` alpha bg, mini white slide with accent bars) + name `600 13px` +
        description `400 12px #98A1B0` (HTML L2426–2441):
        - "Directorio Ejecutivo" — "Mensajes clave, semáforos y ranking. Máximo 6 diapositivas." (accent `#672DBD`)
        - "Storytelling de Mercado" — "Narrativa de industria con contexto e IA generativa." (accent `#49BCD8`)
        - "Detalle Analítico" — "Tablas completas, drill-down y anexos por categoría." (accent `#47A4D5`)
     4. "Tipos de slides a incluir" + (i) (HTML L2451–2452) + badge "{n} diapositivas" (HTML L2453); right-side actions (HTML
        L2456–2465); error banner (HTML L2469); info "Cada módulo de Resultados puede convertirse en una o varias diapositivas.
        Activa el módulo y elige qué gráficas o vistas incluir: cada gráfica seleccionada genera su propia diapositiva con los
        datos actuales del análisis. El orden final se ajusta en Previsualizar." (HTML L2472).
     5. Toggles "Portada" / "Cierre" (HTML L2475–2476).
     6. 7 module rows with chart pills and "Comentarios por slide" (HTML L2479–2533).
     7. "Versión PPT cargada" (HTML L2539–2557).
     8. "Comentarios" + count (HTML L2562–2579).
     9. Footer actions (HTML L2585–2589).
- Components:
  - `Cmp:AppShell`, `Cmp:SegmentedTabs` (analysis tab bar), `Cmp:Button` (variants `primary` `#672DBD`, `secondary` outline, `ai`
    `#49BCD8`, `outlinePrimary` `#672DBD` border) — from SCR-04 / SCR-07
  - `Cmp:Card`, `Cmp:SectionTitle` + `Cmp:InfoToggle` + `Cmp:InfoPanel` (from SCR-07)
  - `Cmp:DataTable` (list; header eyebrow row) with `Cmp:StatusBadge` (Publicado / En revisión / Borrador)
  - `Cmp:AlertBanner` (variants `success` publish banner, `danger` Yarbis error)
  - `Cmp:TextField`, `Cmp:DateField` (from SCR-07)
  - `Cmp:ChoiceChip` (Idioma, Portada / Cierre toggles; from SCR-07)
  - `Cmp:TemplateCard` (120px mini-slide preview in accent + name + description; selected = 2px accent border)
  - `Cmp:CountBadge` ("{n} diapositivas", comments count)
  - `Cmp:AiActionPill` ("✦ Redactar comentarios con Yarbis (n)", "✦ Sugerir con Yarbis"; loading "✦ Yarbis está redactando…")
  - `Cmp:TextLink` ("Seleccionar todo", "Limpiar", "+ Agregar comentario", "Editar", "Quitar", "Reemplazar")
  - `Cmp:ModuleSelectorRow` (18px `Cmp:Checkbox` + label + "{on}/{total} gráficas" + `Cmp:ToggleChip` chart pills)
  - `Cmp:Checkbox`, `Cmp:ToggleChip` ("✓ label" / "+ label")
  - `Cmp:SlideNoteEditor` (row label, amber `Cmp:NotePill`, textarea edit mode with "✦ Redactar con Yarbis" / "Cancelar" /
    "Guardar")
  - `Cmp:NotePill` (`#FFFBEB`/`#FDE68A`/`#78350F`, ellipsis)
  - `Cmp:TextArea` (from SCR-07)
  - `Cmp:FileDropBox` (empty dashed state) and `Cmp:UploadedFileCard` ("PPT" tile `#D24726`, name, meta, actions)
  - `Cmp:CommentThread` + `Cmp:CommentItem` + `Cmp:CommentComposer` (shared with SCR-14)
  - `Cmp:Modal` (OVL-06 `Cmp:SlidePreviewModal`, OVL-07a `Cmp:UploadPptModal`, OVL-07b `Cmp:DownloadModal`)
  - `Cmp:OperationProgress` (download/export `202` + progress, M-06) [inference]
  - `Cmp:AutosaveToast` (builder autosave via `C-28`) [inference]
  - `Cmp:SectionResult` (loading / error wrapper per block)
- Charts: n/a on this screen (chart selection only; slides are rendered in OVL-06 / SCR-14 by the slide renderer, P1-15b).
- Tables:
  - "Presentaciones creadas" (HTML L2369): columns "Nombre" | "Fecha de creación" | "Estado" | "Fecha de publicación" | (actions,
    no header). Seed rows (HTML L3558–3562):
    - "Directorio Ejecutivo T4" · "02 oct 2025" · "Publicado" · "05 oct 2025" (template directorio)
    - "Storytelling de Mercado" · "28 sep 2025" · "En revisión" · "—" (template storytelling)
    - "Resumen Sensibilidades Q3" · "14 ago 2025" · "Borrador" · "—" (template directorio)
  - Status badge colours (HTML L4851): Publicado `#D1FAE5`/`#047857`, En revisión `#FEF3C7`/`#92400E`, Borrador `#F5F6F7`/`#59667C`.
  - Row actions: "Editar" (outline, HTML L2378) and "Ver detalle" (`#672DBD`, HTML L2379).
  - Order: prototype insertion order, new rows appended (HTML L3684). Default sort: creation date desc [inference]. No filters.
    Pagination through `V-40 Page<>` (`page`, default page size 20 [inference]); dates es-CO `dd mmm yyyy`; "—" when not
    published.
- Filters & controls:
  - Builder open/closed: boolean, default closed (HTML L3550), **in URL** as `/nueva` or `/:id/editar`.
  - "Título": text, placeholder "Ej. Directorio Ejecutivo T1 2026" (HTML L2398), default empty; publish falls back to "Nueva
    presentación" (HTML L3682).
  - "Fecha": date, default empty (HTML L2402; P5 shows "dd/mm/aaaa" [Paquete:4_Presentaciones-Crear-presentacion.jpg]).
  - "Idioma": "Español" (default) / "English" (HTML L3802; selected `#672DBD`/white, HTML L3804) — drives slide copy and Yarbis
    drafting language (HTML L3691).
  - "Tipo de presentación": `directorio` | `storytelling` | `analitico`, default none selected; rendering falls back to Directorio
    (HTML L3546, L3683, L4858). Selected card = 2px accent border (HTML L4846; OQ-15).
  - Portada / Cierre: booleans, both on by default (HTML L3551 `presSlideTypes.title` / `.appendix`); on = `#EDE9FE`/`#672DBD`,
    off = `#F5F6F7`/`#98A1B0` (HTML L5416–5417).
  - Module/chart selection: map `moduleId → chartIds`, default = `comp:barras`, `panorama:kpis+heatmap`, `peso:barras`,
    `hallazgos:lista` (HTML L3552) → **7 slides** with Portada and Cierre. "Seleccionar todo" selects every chart of every module
    → **24 slides** (22 charts + Portada + Cierre; HTML L5420); "Limpiar" clears all charts (HTML L5421), Portada/Cierre unchanged.
  - Slide order: array of slide keys, default = generation order, edited only in OVL-06 (HTML L4896–4899).
  - All builder fields are saved in the draft via `C-28` (debounced autosave [inference]); none except the route live in the URL.
- States:
  - Loading: `V-40` list skeleton rows; builder `V-41` card skeleton [inference].
  - Empty list: "Aún no hay presentaciones" + "+ Crear presentación" for analysts [inference: no V2 copy].
  - Empty selection: 0 charts and Portada/Cierre off → badge "0 diapositivas"; previews show the `empty` slide "Selecciona al menos
    un módulo para generar diapositivas." (HTML L2124); "Publicar presentación" disabled [inference].
  - Error: list / builder load → `Cmp:SectionResult` error with retry; Yarbis draft failure → banner "Yarbis no pudo redactar el
    comentario. Intenta de nuevo en unos segundos." (HTML L3707, `#FEE2E2`/`#991B1B`, HTML L2469); publish failure →
    `Cmp:AlertBanner` danger above the footer [inference].
  - Busy: Yarbis per-slide / batch loading "✦ Yarbis está redactando…" (HTML L2461, L2504, L2521) disables the triggering control;
    upload/download progress inside OVL-07a/07b.
  - No permission: non-analysts never see the toggle button, builder, "Editar" or unpublished rows (`V-40` returns published
    only); explorer_viewer → `/403`.
  - Uploaded version present: `Cmp:UploadedFileCard` replaces the drop box (HTML L2547–2557).
- Interactions:
  - "+ Crear presentación" ↔ "Cancelar" toggles the builder (HTML L5448). "Cancelar" closes without deleting the draft; the draft
    stays as "Borrador" [inference].
  - Row "Editar" → `/presentaciones/:id/editar` (V2 only sets the template, HTML L4854 — CF-81); row "Ver detalle" → SCR-14
    `/presentaciones/:id` (HTML L4855).
  - Template card click selects it (HTML L4848); "Idioma" chip click selects the language (HTML L3803).
  - Module checkbox (or label) toggles every chart of the module on/off (HTML L4875); chart pill toggles one chart (HTML L4889);
    unchecking the last chart unchecks the module.
  - Portada / Cierre chips toggle cover / closing slides (HTML L2475–2476).
  - "Comentarios por slide" (per selected chart, HTML L4876–4886): "+ Agregar comentario" opens the editor; "✦ Sugerir con Yarbis"
    drafts directly into the note (`C-32`); in edit mode "✦ Redactar con Yarbis" drafts into the textarea (not saved until
    "Guardar"); "Guardar" trims and saves (empty = remove); "Cancelar" discards; "Editar" / "Quitar" on an existing note. Notes are
    keyed `moduleId|chartId`; a note shortens the slide's data rows (renderer rule, P1-15b). Seed note on "Barras GE vs. pares":
    "Destacar que GE supera al promedio en margen EBITDA pese a la caída del Brent." (HTML L3553).
  - Batch "✦ Redactar comentarios con Yarbis ({pending})" (HTML L2458): shown only while some chart slide has no note (pending
    default 4 = 5 chart slides − 1 seeded, HTML L4913–4914); drafts up to 8 notes sequentially (HTML L3711); drafts are marked
    `status:'suggestion'` and editable (OQ-19) [inference for the marker].
  - Yarbis drafting prompt: 1–2 sentences, ≤ 35 words, in the chosen Idioma, only figures present in the analysis (HTML
    L3689–3698) — moves to `C-32` server-side; `canDraftWithAssistant` gates it.
  - "↑ Cargar versión PPT" / "Reemplazar" / footer "↑ Cargar PPT" → OVL-07a (`C-30`, .ppt/.pptx ≤ 50 MB); "Quitar" → `C-31`.
  - "Previsualizar y ordenar" → OVL-06 (slide preview + "Orden de diapositivas", reorder ▲/▼ persisted with `C-28`; HTML L4899,
    L4916–4919, L4947).
  - "↓ Descargar" → OVL-07b (PowerPoint (.pptx) / PDF → `C-14` `presentation-pptx|presentation-pdf` → `202` → progress →
    mediated download).
  - "Compartir" (no handler in V2, HTML L2588) → copy the current deep link + toast "✓ Copiado" (OQ-18).
  - "Publicar presentación" (HTML L2589, `#49BCD8`) → `C-29` → row appears as "Publicado" with creation/publication dates, builder
    closes, 3 s banner (HTML L3680–3688). Publish uses the uploaded PPT when present, else the generated slides (HTML L2543 copy).
  - Comments "Comentarios" composer: input "Deja un comentario sobre esta presentación..." (HTML L2578) + "Enviar" (HTML L2579) →
    `C-10` (entityType `presentation`); author shown as "Camila B." in V2 (HTML L5425) → `session.user.displayName`.
  - Yarbis panel (SCR-04): tip "Puedo generar el mensaje ejecutivo de cada categoría automáticamente. Elige una plantilla para
    empezar." (HTML L3234); chips "Ayúdame con el mensaje clave", "¿Qué plantilla recomiendas?" (HTML L5164).
- Data fields:
  - `V-40 GET /api/v1/views/presentations?analysisId=&page=` → `Page<{ id, name: string, createdOn: ISO date, status:
    'published'|'in_review'|'draft', publishedOn: ISO date|null }>`, `permissions{ canCreate }`, per row `{ canEdit, canView }`.
  - `V-41 GET /api/v1/views/presentation-builder/:presentationId` → `meta{ title, date, language: 'es'|'en', templateId:
    'directorio'|'storytelling'|'analitico'|null }`, `templates[]{ id, name, description, accentKey }`, `modules[]{ id, label,
    charts[]{ id, label, isSelected } }` (7 modules: `hom` 2, `comp` 8, `pvc` 5, `resumen` 1, `panorama` 4, `peso` 1, `hallazgos` 1 —
    HTML L4859–4867), `includeCover`, `includeClosing`, `slideCount: int`, `notes{ [slideKey]: text }`, `uploadedVersion?{ fileName,
    sizeLabel, uploadedAt }`, `commentCount`, `permissions{ canEdit, canPublish, canUpload, canDraftWithAssistant }`.
  - `V-42 GET /api/v1/views/presentation-slides/:presentationId?order=` → `slides[]` discriminated union by `kind` (14 kinds:
    `title`, `bars`, `table`, `pvc`, `hom`, `homMissing`, `radar`, `hallazgos`, `summary`, `ranking`, `categories`, `findings`,
    `appendix`, `empty`) with `note?`, `pageLabel` — fields per kind in `slide-renderer.md` (P1-15b); `permissions.canReorder`.
  - Commands: `C-27 POST /api/v1/presentations` `{ analysisId }`; `C-28 PATCH /api/v1/presentations/:id` (meta, template,
    modules/charts, cover/closing, order, notes); `C-29 POST /api/v1/presentations/:id/publication`; `C-30 PUT
    /api/v1/presentations/:id/uploaded-version` (multipart); `C-31 DELETE …/uploaded-version`; `C-32 POST
    /api/v1/slide-comment-drafts` `{ presentationId, slideKey, language }` → `{ text, status:'suggestion', generatedBy }`; `C-14 POST
    /api/v1/exports`; `C-10 POST /api/v1/review-comments`.
  - Display: slide count integer; file size label from BFF (e.g. "2,4 MB"); dates es-CO.
- Role visibility:
  - `analyst_creator`: list (all statuses) + create, edit, reorder, Yarbis drafting, upload, download, publish, comment.
  - `explorer_integral`, `executive_viewer`, `executive_integral`: list of **published** presentations with "Ver detalle" only (no
    "Editar", no "+ Crear presentación", no builder) — §1.19 "Presentaciones: view published".
  - `executive_integral`: may comment (F32) on presentations it can view [inference: §1.19 comment row].
  - `explorer_viewer`: no access (sidebar item locked 🔒, SCR-04; `/403`) — board 09, CF-39.
  - Yarbis drafting (`canDraftWithAssistant`): analyst only (CF-40).
- Open questions / assumptions:
  - CF-16: V2 module → chart builder replaces README's flat slide-type chips + "Todos".
  - CF-45: "+ Crear presentación" (V2) over "Crear nueva presentación".
  - CF-46 / OQ-14: analysis context of the tab bar on the sidebar-level route (default `session.analysisContext.defaultAnalysisId`).
  - OQ-15: template selected state is only a 2px accent border and is not distinguishable in the Paquete capture
    [Paquete:4_Presentaciones-Crear-presentacion.jpg]; default kept; no template pre-selected (renders as Directorio).
  - OQ-18: "Compartir" semantics — default copy deep link + toast.
  - OQ-19: which Yarbis texts are LLM-backed — V2 calls a live LLM only for slide comments (HTML L3692); default `C-32` via mock
    `LanguageModelProvider`, drafts flagged as suggestion.
  - CF-51: "Storytelling de Mercado" is a presentation template, kept although storytelling is out of scope as a module.
  - CF-81: "Editar" (row) and "Compartir" have no V2 handler — resolved as builder with saved config / deep link.
  - M-04 / M-05 (PLAN §3): preview lifecycle and the analyst side of F32/F33 are specified with P1-12; this screen only hosts the
    comment thread.
  - [inference] Directorio's "Máximo 6 diapositivas." is descriptive copy only; V2 does not cap the slide count — no cap enforced.
  - [inference] Cancelling the builder keeps the draft; list shows drafts to their analyst only.
  - [inference] P5 shows Portada/Cierre as fixed chips [Paquete:4_Presentaciones-Crear-presentacion.jpg]; V2 makes them toggles
    (HTML L2475–2476) — V2 kept.
