# Reference Image Catalogue

Reference copies (sRGB PNG) of the source images, used as visual-regression references. Every file below is in this
folder (regenerated from the folder contents in P1-26d; each copy was matched to its original by pixel comparison).
Original paths are relative to `D:\Personal\Eco-Comparador` (the parent of this repository). Screens without a reference
image use the P1-03 prototype renders in `docs/design/screenshots/prototype/` as their baseline. Checked by
`python tools/check-reference-catalogue.py`.

## Screen Inventory

| SCR | Name | Files | Original Source |
|-----|------|-------|-----------------|
| SCR-01 | Login | `pq-6-login.png`, `ho-01-login.png` (degraded capture: broken images) | `Paquete_de_Pantallas_24_08_2026/6_login.png`, `V2 _CUAN_ECO_Comparador 2/design_handoff_benchud_comparador/screenshots/01-login.png` |
| SCR-02 | Access gate | none (render only; the source capture `V2 _CUAN_ECO_Comparador 2/uploads/Captura de pantalla 2026-09-17 a la(s) 7.41.26 p.m..png` has no reference copy) | — |
| SCR-03 | Administración | none (render only) | — |
| SCR-04 | App shell | none (render only; the shell is visible in every SCR-05 / SCR-11 / SCR-13 / SCR-15 reference) | — |
| SCR-05 | Inicio | `pq-5-dashboar-inicial.png`, `ho-02-dashboard.png`, `ho-02-01-login.png`; mislabelled Dashboard frames (not baselines for the screens they are named after): `ho-03-analisis.png`, `ho-04-definicion.png`, `ho-05-analisis-list.png`, `ho-06-resultados.png` | `Paquete_de_Pantallas_24_08_2026/5_dashboar_inicial.png`, `V2 _CUAN_ECO_Comparador 2/design_handoff_benchud_comparador/screenshots/02-dashboard.png`, `…/screenshots/02-01-login.png`, `…/screenshots/03-analisis.png`, `…/screenshots/04-definicion.png`, `…/screenshots/05-analisis-list.png`, `…/screenshots/06-resultados.png` |
| SCR-06 | Análisis — "Todos los análisis creados" | none (render only; `ho-05-analisis-list.png` and `ho-03-analisis.png` show the Dashboard) | — |
| SCR-07 | Definición wizard | none (render only; `ho-04-definicion.png` shows the Dashboard) | — |
| SCR-08 | Resultados | `pq-3-tablero-alejandra-cuantitativo.png`, `pq-3-1-tablero-andrea-cualitativo.png` (`ho-06-resultados.png` shows the Dashboard) | `Paquete_de_Pantallas_24_08_2026/3_Tablero_Alejandra_Cuantitativo.png`, `Paquete_de_Pantallas_24_08_2026/3_1_Tablero_Andrea_Cualitativo.jpg` |
| SCR-09 | Visualización | none (render only) | — |
| SCR-10 | Detalle de indicador | none (render only) | — |
| SCR-11 | Monitor de Valor | `pq-1-monitor-de-valor-pantalla.png`, `ho-07-monitor-valor.png` | `Paquete_de_Pantallas_24_08_2026/1_Monitor_de_Valor_pantalla.jpg`, `V2 _CUAN_ECO_Comparador 2/design_handoff_benchud_comparador/screenshots/07-monitor-valor.png` |
| SCR-12 | Sensibilidades | `pq-2-sensibilidades-pantalla-completa.png` | `Paquete_de_Pantallas_24_08_2026/2_Sensibilidades_pantalla_completa.jpg` |
| SCR-13 | Presentaciones | `pq-4-presentaciones-crear-presentacion.png`, `ho-08-presentaciones.png` | `Paquete_de_Pantallas_24_08_2026/4_Presentaciones-Crear-presentacion.jpg`, `V2 _CUAN_ECO_Comparador 2/design_handoff_benchud_comparador/screenshots/08-presentaciones.png` |
| SCR-14 | Presentación · detalle | none (render only) | — |
| SCR-15 | Notificaciones | `ho-09-notificaciones.png` | `V2 _CUAN_ECO_Comparador 2/design_handoff_benchud_comparador/screenshots/09-notificaciones.png` |
| SCR-16 | Configuración | none (render only) | — |
| SCR-17 | Error pages 403/404 | none (render only) | — |

## Other reference files (not screen baselines)

| File | Original Source | What it is |
|------|-----------------|------------|
| `up-2026-08-123.56.42-0-0-0.png` | `V2 _CUAN_ECO_Comparador 2/uploads/Captura de pantalla 2026-08-12 a la(s) 3.56.42 p.m..png` | Ecopetrol design system "Colores \| Tema 3" (token reference, CF-61) |
| `up-2026-08-1811.40.15-0-0-0.png` | `V2 _CUAN_ECO_Comparador 2/uploads/Captura de pantalla 2026-08-18 a la(s) 11.40.15 a.m..png` | TradingView indicator picker (external inspiration, never a spec) |
| `up-2026-08-1911.07.17-0-0-0.png` | `V2 _CUAN_ECO_Comparador 2/uploads/Captura de pantalla 2026-08-19 a la(s) 11.07.17 a.m..png` | Teams stakeholder interview showing the Investor Presentation 2Q26 (context) |
| `up-2026-09-072.53.46-0-0-0.png` | `V2 _CUAN_ECO_Comparador 2/uploads/Captura de pantalla 2026-09-07 a la(s) 2.53.46 p.m..png` | AS-IS T4 2025 benchmark report, "Ficha técnica" (requirements) |
| `up-2026-09-072.54.00-0-0-0.png` | `V2 _CUAN_ECO_Comparador 2/uploads/Captura de pantalla 2026-09-07 a la(s) 2.54.00 p.m..png` | AS-IS T4 2025 benchmark report, "Indicadores" (requirements) |

## Notes

- All images are sRGB PNG copies of their originals (JPEG / Display-ICC sources converted).
- `…/screenshots/` stands for `V2 _CUAN_ECO_Comparador 2/design_handoff_benchud_comparador/screenshots/`.
- The handoff's canonical login capture `01-01-login.png` has no reference copy; `ho-01-login.png` is the degraded `01-login.png`.
