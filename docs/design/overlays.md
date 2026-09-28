# Overlays catalogue (OVL)

> Modal base: scrim `rgba(28,37,53,.5)`, card `#fff` radius 14 padding 26, shadow `0 20px 50px rgba(28,37,53,.3)`, "✕"
> `#98A1B0` 18px, click-outside closes.

| OVL | Title (verbatim) | Trigger | z / width | Endpoint | Source |
|---|---|---|---|---|---|
| OVL-01 | "✦ Recomendaciones de Yarbis" | Visualización / Horizonte / Peso pills | 29 / 520 | V-23 | HTML L1106 (pill trigger), L1312 (modal title) |
| OVL-02 | "Recomendaciones estratégicas de Yarbis" | Monitor header button | 29 / 520 | V-35 | HTML L1769 |
| OVL-03 | "Plan estratégico sugerido" | Sensibilidades "Generar plan estratégico" | 29 / 640 | C-25/C-26 | HTML L1648 (trigger button), L1655 (modal title) |
| OVL-04 | Comentarios drawer (right, 320) | unreachable in V2 → **not built** | 28 | — | [not built — no live trigger found in HTML] |
| OVL-05 | "Añadir indicador" (tabs Referenciamiento de pares / TBG / ILP) | Monitor config | 29 / 520 | V-34, C-18 | HTML L1877 (trigger button), L1884 (modal title) |
| OVL-06 | "Vista previa · {module} · diapositiva n/N" + "Orden de diapositivas" | Previsualizar y ordenar | 30 / 1180 | V-42, C-28 | HTML L2624 |
| OVL-07a | "Cargar versión PPT" (select/confirm/loading/done; .ppt/.pptx ≤ 50 MB) | Cargar PPT / Reemplazar | 32 / 480 | C-30 | HTML L2544 (trigger), L2869 (modal title) |
| OVL-07b | "Descargar presentación" (PowerPoint (.pptx) / PDF; config/loading/done) | Descargar | 32 / 480 | C-14, O-01, O-03 | HTML L2911 |
| OVL-08 | "Narrativa ejecutiva · {title}" ("Copiar texto", "Usar en presentación") | Resultados pills | 29 / 560 | C-15 | HTML L3043 |
| OVL-09 | Narrativa ejecutiva (Monitor) | Monitor pill | 29 / 520 | C-15 | HTML L3067 |
| OVL-10 | "Análisis publicado" ("Entendido") | Visualización Publicar | 29 / 420 | C-09 | HTML L3025 |
| OVL-11 | KVI traceability (CATEGORÍA, FUENTE, FECHA DE CAPTURA, RESPONSABLE, UNIDAD) | KVI name | 29 / 420 | V-33 | HTML L3091-3096 |
| OVL-12 | "Ayuda y documentación" (4 Q&A + "Contactar soporte") | header "?" | 29 / 440 | static i18n | HTML L3112 |
| OVL-13 | Company profile (PAÍS, CATEGORÍA, NEGOCIO, SEGMENTOS, "Noticias recientes") | company names/(i) | 29 / 420 | V-25 | HTML L3137-3142 |
| OVL-14 | Yarbis chat panel | FAB | 20 / 320 | V-46, C-33, C-34 | HTML L3176 (FAB button), L30 (`aiPulse` keyframe) |
| OVL-15 | "Detalle por compañía (TBG e ILP)" [inference: content = per-company TBG/ILP items] | Horizonte button | 29 | V-17 | [inference] HTML L5271-5278 (`qualDetailModalOpen`/`qualDetailDim`/`qualDetailCompanyTabs` logic; no template block in either HTML) |
| OVL-16 | "Seleccionar revisores" [proposed per M-04] | SCR-09 header action "Habilitar vista previa" (analyst, lifecycle `preparacion`) [proposed] | 29 / 480 | C-41 [proposed] | [proposed] no HTML source — new per critic M-04 (board 09 lane A.4/B.8: preview enabled from the analysis); trigger per docs/design/screen-inventory/SCR-09-visualizacion.md States (lifecycle) |

## Toasts

| Type | Position | z-index | Duration | Copy | Source |
|---|---|---|---|---|---|
| autosave | bottom-right | 35 | 500 ms + 1.8 s | (auto-hide after save) | HTML L3035 ("Cambios guardados automáticamente") |
| undo remove company | bottom-center | 35 | 5 s | "Deshacer" `#83E377` | HTML L3104 |
| export row | bottom-center | 35 | 3 s | (export confirmation) | [inference — no literal export-toast copy found in HTML; pattern inferred from the other confirmation toasts] |
| "✓ Cambios guardados" | bottom-center | 35 | 2.2 s | (save confirmation) | HTML L841 |
| "✓ Vista guardada" | bottom-center | 35 | 2.5 s | (view save confirmation) | HTML L1696 |
| "✓ Presentación publicada correctamente." | bottom-center | 35 | 3 s | (publish confirmation) | HTML L2386 |
| "✓ Copiado" | bottom-center | 35 | 1.6 s | (copy to clipboard confirmation) | HTML L5319 (`resNarrativaCopyLabel` state) |
