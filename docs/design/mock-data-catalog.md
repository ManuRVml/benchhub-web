# Mock Data Catalog — Eco-Comparador Phase 1

> **Note**: This catalog documents the mock data values used in the Eco-Comparador prototype and application. All datasets are derived from the BencHUD prototype (BencHUD.dc.html, root copy) and design source files. Source column entries point to the exact file and line/section where values are defined.

---

## Part A

### TIER_NAMES (Prototype: `TIER_NAMES`)

| Tier | Label (Spanish) | Source |
|---|---|---|
| `super-majors` | Super Majors | `02-prototype-html.md:512` (COMPANY_GROUPS definition) |
| `iocs` | IOCs | `02-prototype-html.md:512` |
| `nocs` | NOCs | `02-prototype-html.md:512` |
| `junior-latam` | Junior Latam | `02-prototype-html.md:512` |
| `energeticos` | Energéticos | `02-prototype-html.md:512` (Utilities & Renovables, Transmisión & Energía) |
| `transmision-energia` | Transmisión & Energía | `02-prototype-html.md:512` |

### CATEGORIES (Prototype: `CATEGORIES`)

| Category | Count | Indicators (Spanish) | Source |
|---|---|---|---|
| `rentabilidad` | 3 | ROACE (%), Margen EBITDA (%), Crecimiento EBITDA (%) | `02-prototype-html.md:199` |
| `liquidez` | 2 | Prueba ácida (x), Razón corriente (x) | `02-prototype-html.md:199` |
| `operacional` | 1 | Crecimiento Producción (%) | `02-prototype-html.md:199` |
| `competitividad-opex` | 2 | Costo de Levantamiento (USD/B), Costo de ventas/BI (USD/B) | `02-prototype-html.md:199` |
| `solvencia` | 4 | Crecimiento de Deuda (%), Cobertura de intereses (veces), D. Neta/(D.Neta/Equity) (x), Deuda Bruta/EBITDA (x) | `02-prototype-html.md:199` |
| `esg` | 3 | Gobernanza (puntos), Medio ambiente (puntos), Social (puntos) | `05-uploads-png-batch-1.md:129` |

### PARES_METRICS (Prototype: `PARS_METRICS`)

| Metric Code | Label (Spanish) | Category | Source |
|---|---|---|---|
| `PAR-01` | ROACE (%) | rentabilidad | `02-prototype-html.md:199` |
| `PAR-02` | Margen EBITDA (%) | rentabilidad | `02-prototype-html.md:199` |
| `PAR-03` | Crecimiento EBITDA (%) | rentabilidad | `02-prototype-html.md:199` |
| `PAR-04` | Prueba ácida (x) | liquidez | `02-prototype-html.md:199` |
| `PAR-05` | Razón corriente (x) | liquidez | `02-prototype-html.md:199` |
| `PAR-06` | Crecimiento Producción (%) | operacional | `02-prototype-html.md:199` |
| `PAR-07` | Costo de Levantamiento (USD/B) | competitividad-opex | `02-prototype-html.md:199` |
| `PAR-08` | Costo de ventas/BI (USD/B) | competitividad-opex | `02-prototype-html.md:199` |
| `PAR-09` | Crecimiento de Deuda (%) | solvencia | `02-prototype-html.md:199` |
| `PAR-10` | Cobertura de intereses (veces) | solvencia | `02-prototype-html.md:199` |
| `PAR-11` | D. Neta/(D.Neta/Equity) (x) | solvencia | `02-prototype-html.md:199` |
| `PAR-12` | Deuda Bruta/EBITDA (x) | solvencia | `02-prototype-html.md:199` |
| `PAR-13` | Gobernanza (puntos) | esg | `02-prototype-html.md:199` |
| `PAR-14` | Medio ambiente (puntos) | esg | `02-prototype-html.md:199` |
| `PAR-15` | Social (puntos) | esg | `02-prototype-html.md:199` |

### TBGILP_METRICS (Prototype: Qualitative per-dimension metrics)

| Dimension | Metrics (Spanish) | Source |
|---|---|---|
| **Financiera** | Flujo de Caja Libre (FCL), ROACE relativo, Deuda Bruta / EBITDA, Cobertura de Intereses, Eficiencias, ROACE, Flujo de Caja Operativo, Punto de equilibrio de caja, Retorno sobre patrimonio | `02-prototype-html.md:501-504`, `06-uploads-png-batch-2.md:146-151` |
| **Operativa** | Crecimiento Producción, Programa de Mejora de la Competitividad, Confiabilidad y Disponibilidad de la Refinería, Excelencia en gestión de activos, Excelencia en clientes, Volumen de LNG, Producción de hidrocarburos | `02-prototype-html.md:501-504`, `06-uploads-png-batch-2.md:146-151` |
| **Transversal** | Reducción de Emisiones GEI, TRIF, Índice de seguridad, Desarrollo de otras plataformas Low Carbon, IFSP N1 y N2, Descarbonización de clientes | `02-prototype-html.md:501-504`, `06-uploads-png-batch-2.md:146-151` |

### COMPANIES (Prototype: `COMPANIES` array)

| Company | Sector | Country | Profile Summary | Source |
|---|---|---|---|---|
| `ecopetrol` | Oil & Gas integrado | Colombia | Super Majors peer, ROACE 7.4%, Margen EBITDA 39% | `02-prototype-html.md:452-465`, `05-uploads-png-batch-1.md:122` |
| `shell` | Oil & Gas integrado | Países Bajos / R. Unido | Super Majors peer, ROACE 88% coverage | `02-prototype-html.md:452-465`, `05-uploads-png-batch-1.md:122` |
| `equinor` | Oil & Gas integrado | Noruega | Super Majors peer, TBG/ILP hybrid dimension (17%) | `02-prototype-html.md:452-465`, `06-uploads-png-batch-2.md:146-151` |
| `bp` | Oil & Gas integrado | Reino Unido | Super Majors peer, TBG Financiera 55%, Operativa 15%, Transversal 30% | `02-prototype-html.md:452-465`, `06-uploads-png-batch-2.md:146-151` |
| `totalenergies` | Oil & Gas integrado | Francia | Super Majors peer, TBG Financiera 62%, Operativa 14%, Transversal 24% | `02-prototype-html.md:452-465`, `06-uploads-png-batch-2.md:146-151` |
| `chevron` | Oil & Gas integrado | Estados Unidos | Super Majors peer, TBG Financiera 40%, Operativa 25%, Transversal 35% | `02-prototype-html.md:452-465`, `06-uploads-png-batch-2.md:146-151` |
| `exxon` | Oil & Gas integrado | Estados Unidos | Super Majors peer, TBG Financiera 45%, Operativa 20%, Transversal 35% | `02-prototype-html.md:452-465`, `06-uploads-png-batch-2.md:146-151` |
| `isa` | Transmisión & Energía | Colombia | Energéticos peer, TBG Financiera 50%, Operativa 20%, Transversal 30% | `02-prototype-html.md:452-465`, `06-uploads-png-batch-2.md:146-151` |
| `repsol` | Oil & Gas integrado | España | IOCs peer, TBG Financiera 51%, Operativa 23%, Transversal 26% | `02-prototype-html.md:452-465`, `06-uploads-png-batch-2.md:146-151` |
| `petrobras` | Oil & Gas integrado | Brasil | NOCs peer, TBG Financiera 33%, Operativa 0%, Transversal 67% | `02-prototype-html.md:452-465`, `06-uploads-png-batch-2.md:146-151` |
| `oxy` | Oil & Gas integrado | Estados Unidos | Super Majors peer, TBG Financiera 70%, Operativa 10%, Transversal 20% | `02-prototype-html.md:452-465`, `06-uploads-png-batch-2.md:146-151` |
| `pttep` | Oil & Gas integrado | Tailandia | Junior Latam peer, TBG Financiera 45%, Operativa 20%, Transversal 35% | `02-prototype-html.md:452-465`, `06-uploads-png-batch-2.md:146-151` |
| `ypf` | Oil & Gas integrado | Argentina | NOCs peer, Aspiración 2040: 750 kbpe/d | `03-reference-images.md:438` |
| `pemex` | Oil & Gas integrado | México | NOCs peer, Aspiración 2040: 1.930 kbpe/d | `03-reference-images.md:438` |

### COMPANY_COLOR_MAP (Canonical mapping)

| Company | Color Hex | Source |
|---|---|---|
| `bp` | `#048BA8` | `10-synthesis.md:632-633` |
| `equinor` | `#16DB93` | `10-synthesis.md:632-633` |
| `shell` | `#F29E4C` | `10-synthesis.md:632-633` |
| `totalenergies` | `#B9E769` | `10-synthesis.md:632-633` |
| `oxy` | `#EFEA5A` | `10-synthesis.md:632-633` |
| `petrobras` | `#2C699A` | `10-synthesis.md:632-633` |
| `chevron` | `#7C35EA` | `10-synthesis.md:632-633` |
| `isa` | `#F1C453` | `10-synthesis.md:632-633` |
| `exxon` | `#0D2850` | `10-synthesis.md:632-633` |
| `ecopetrol` | `#83E377` | `10-synthesis.md:632-633` |
| `repsol` | `#DB2777` | `10-synthesis.md:632-633` |
| `ypf` | `#2563EB` | `10-synthesis.md:632-633` |

### TBG_WEIGHTS (Per-dimension weights per company)

| Company | Financiera | Operativa | Transversal | Source |
|---|---|---|---|---|
| `bp` | 55% | 15% | 30% | `06-uploads-png-batch-2.md:146-151`, `06-uploads-png-batch-2.md:158` |
| `equinor` | 33% | 34% | 33% | `06-uploads-png-batch-2.md:146-151`, `06-uploads-png-batch-2.md:158` |
| `oxy` | 70% | 10% | 20% | `06-uploads-png-batch-2.md:146-151`, `06-uploads-png-batch-2.md:158` |
| `petrobras` | 33% | 0% | 67% | `06-uploads-png-batch-2.md:146-151`, `06-uploads-png-batch-2.md:158` |
| `repsol` | 51% | 23% | 26% | `06-uploads-png-batch-2.md:146-151`, `06-uploads-png-batch-2.md:158` |
| `shell` | 35% | 40% | 25% | `06-uploads-png-batch-2.md:146-151`, `06-uploads-png-batch-2.md:158` |
| `totalenergies` | 62% | 14% | 24% | `06-uploads-png-batch-2.md:146-151`, `06-uploads-png-batch-2.md:158` |
| `ecopetrol` | 40% | 35% | 25% | `06-uploads-png-batch-2.md:146-151`, `06-uploads-png-batch-2.md:158` |
| `chevron` | 40% | 25% | 35% | `03-reference-images.md:426` |
| `isa` | 50% | 20% | 30% | `03-reference-images.md:426` |
| `exxon` | 45% | 20% | 35% | `03-reference-images.md:426` |
| `pttep` | 45% | 20% | 35% | `03-reference-images.md:426` |

### TBG_AVERAGES (Per-dimension averages)

| Dimension | Average (v1) | Average (v2) | Source |
|---|---|---|---|
| **Financiera** | 47% | 47% | `06-uploads-png-batch-2.md:146-151`, `06-uploads-png-batch-2.md:160` |
| **Operativa** | 25% | 21% | `06-uploads-png-batch-2.md:146-151`, `06-uploads-png-batch-2.md:160` |
| **Transversal** | 32% | 31% | `06-uploads-png-batch-2.md:146-151`, `06-uploads-png-batch-2.md:160` |

### TBG_PER_COMPANY_DETAILS (Shell TBG breakdown)

| Component | Financiera (35%) | Operativa (40%) | Transversal (25%) | Source |
|---|---|---|---|---|
| **Financiera items** | Flujo de caja operativo (35%) | — | — | `06-uploads-png-batch-2.md:147-148` |
| **Operativa items** | — | Excelencia en gestión de activos (15%)<br>Gestión de CAPEX / ejecución (10%)<br>Excelencia en clientes (10%)<br>Volumen de LNG (5%) | — | `06-uploads-png-batch-2.md:147-148` |
| **Transversal items** | — | — | Reducción de Emisiones GEI (5%)<br>Descarbonización de clientes (5%)<br>Severidad de Accidentalidad (7.5%)<br>IFSP N1 y N2 (7.5%) | `06-uploads-png-batch-2.md:147-148` |

### TBG_PER_COMPANY_DETAILS (TotalEnergies TBG breakdown)

| Component | Financiera (62%) | Operativa (14%) | Transversal (24%) | Source |
|---|---|---|---|---|
| **Financiera items** | Flujo de caja operativo (6%)<br>Nivel de endeudamiento orgánico (11%)<br>Punto de equilibrio de caja (17%)<br>Retorno sobre patrimonio (17%)<br>ROACE relativo (11%) | — | — | `02-prototype-html.md:501-504` |
| **Operativa items** | — | Hito: Avance en la transición energética (8%)<br>Hito: Crecimiento en renovables y electricidad (6%) | — | `02-prototype-html.md:501-504` |
| **Transversal items** | — | — | Evolución de emisiones GEI (6%)<br>Evolución de incidentes de proceso (Tier 1 y 2) (4%)<br>Hito: Responsabilidad Social Empresarial (3%)<br>Tasa de incidentes fatales (3%)<br>TRIF (8%) | `02-prototype-html.md:501-504` |

### ASPIRATION_2040 (Producción proyectada kbpe/d)

| Company | Producción 2040+ (kbpe/d) | Posición | Peso bajas emisiones | Source |
|---|---|---|---|---|
| `exxon` | 4.750 | 1 | — | `03-reference-images.md:438` |
| `petrobras` | 3.370 | 2 | — | `03-reference-images.md:438` |
| `chevron` | 3.120 | 3 | — | `03-reference-images.md:438` |
| `shell` | 3.070 | 4 | — | `03-reference-images.md:438` |
| `totalenergies` | 2.930 | 5 | — | `03-reference-images.md:438` |
| `bp` | 2.410 | 6 | — | `03-reference-images.md:438` |
| `equinor` | 2.060 | 7 | — | `03-reference-images.md:438` |
| `pemex` | 1.930 | 8 | — | `03-reference-images.md:438` |
| `ecopetrol` | 855 | 9 | 11% vs. 9% (pares) | `03-reference-images.md:438` |
| `ypf` | 750 | 10 | — | `03-reference-images.md:438` |

### ASPIRATION_ECO_PERFIL (Ecopetrol performance by profile)

| Profile | Business Type | Peers | Año | Puntaje | Pares | Brecha | Posición | Source |
|---|---|---|---|---|---|---|---|---|
| `Perfil 1` | Descarbonización · Renovables | Shell, Equinor | 2025 | 64.8 | 77.2 | -12.4 pts | 3 de 3 | `03-reference-images.md:455` |
| `Perfil 2` | Hidrocarburos · Upstream | Exxon, Chevron, Petrobras, Pemex | 2025 | 66.2 | 70.5 | -4.3 pts | 4 de 5 | `03-reference-images.md:455` |
| `Perfil 3` | Gas y GNL · Equinor, Shell, TotalEnergies, YPF | Equinor, Shell, TotalEnergies, YPF | 2024 | 62.1 | 70.8 | -8.7 pts | 4 de 5 | `03-reference-images.md:455` |

### KVI_DATA_BASE (Monitor de Valor — KVIs)

| Category | Indicador | Code | Unidad | Peso | Responsable | Meta 2025 | Meta Reto | Real 2025 | Monitor | Reto | Source |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Financiero (60%)** | Flujo de Caja Libre | KVI-FCL | BCOP | 10% | Diego Gómez | 7,19 | 10,53 | 10,69 | 149% | 102% | `02-prototype-html.md:530-531` |
| | Deuda Bruta / EBITDA (lower) | KVI-DEUDA | Veces | 5% | Kellin Sánchez | 2,5 | 1,5 | 2,32 | 108% | 65% | `02-prototype-html.md:530-531` |
| | Cobertura de Intereses | KVI-COBERTURA | MUSD | 5% | Juan Carlos López | 8,14 | 26,5 | 6,1 | 75% | 23% | `02-prototype-html.md:530-531` |
| | Eficiencias | KVI-EFIC | mMCOP | 15% | Jimmy Morales | 4,56 | 6,63 | 6,64 | 146% | 100% | `02-prototype-html.md:530-531` |
| | ROACE | KVI-ROACE | % | 15% | Liz Cardona | 7.9% | 12.3% | 7.4% | 94% | 60% | `02-prototype-html.md:530-531` |
| **Estratégico (40%)** | Diversificación | KVI-DIVERSIF | % | 2 | — | 19% | 27% | 19% | 100% | 70% | `06-uploads-png-batch-2.md:406` |

### KVI_MISSING_DATA (Computed-only fields, not in source)

| Indicator | Code | Status | Source |
|---|---|---|---|
| ROACE menos WACC | KVI-ROACEWACC | null (TBD) | `02-prototype-html.md:530-531`, `06-uploads-png-batch-2.md:400` |
| TIR Activos Pareto Upstream | KVI-TIRPARETO | null | `06-uploads-png-batch-2.md:400` |
| EFI Activos Pareto Upstream | KVI-EFIPARETO | null | `06-uploads-png-batch-2.md:400` |
| Margen EBITDA ISA | KVI-MARGEN-ISA | 53.3 (Meta ECP) vs 72.2 (normalizada) | `06-uploads-png-batch-2.md:406-410` |

### AS-IS_BENCHMARK_COMPANIES (From AS-IS report)

| Company | ROACE (%) | Margen EBITDA (%) | Crecimiento EBITDA (%) | Source |
|---|---|---|---|---|
| `conocophillips` | — | — | — | `05-uploads-png-batch-1.md:122` |
| `oxy` | — | — | — | `05-uploads-png-batch-1.md:122` |
| `total` | 19,5% | 18,0% | -1,5% | `05-uploads-png-batch-1.md:122` |
| `ecopetrol` | 13,4% | 11,5% | -13,8% | `05-uploads-png-batch-1.md:122` |
| `ecopetrol-hidroc` | 10,9% | 9,4% | -14,3% | `05-uploads-png-batch-1.md:122` |

### AS-IS_BENCHMARK_INDICATORS (6 Categorías / 34 Indicadores)

| Category | Indicators (T4 25 unless noted) | Source |
|---|---|---|
| **Rentabilidad (12)** | ROACE (%), Crecimiento Equity (%), Payout (%) **T4 24**, Crecimiento EBITDA (%), Crecimiento FCO (%), Crecimiento Ingresos (%), EBITDA/BI (USD/B), Margen EBITDA (%), Rentabilidad para accionista (TSR) (%) **T4 24**, Ingresos/Total Activos (x), Crecimiento Utilidad Neta, Utilidad Neta/BI (USD/B) | `05-uploads-png-batch-1.md:129` |
| **Liquidez (4)** | Prueba ácida (x), Razón corriente (x), FCO/Capex (x), FCO/Pasivos Ctes (x) | `05-uploads-png-batch-1.md:130` |
| **Opex (3)** | Costo de levantamiento, Costo de ventas/BI, Gastos Operacional/BI | `05-uploads-png-batch-1.md:131` |
| **Operacional (6)** | Crecimiento Producción (%), EBITDA/Capex (veces), Capex/Producción (USD/B), Crecimiento Reservas (%), IRR (%), Vida media reservas (años) | `05-uploads-png-batch-1.md:132` |
| **Solvencia (6)** | Crecimiento de Deuda (%), Cobertura de intereses (veces), D. Neta/(D.Neta/Equity) (x), Deuda Bruta/EBITDA (x), Deuda / Patrimonio (x), Deuda Neta/EBITDA (x) | `05-uploads-png-batch-1.md:133` |
| **ESG (3)** | Gobernanza (puntos), Medio ambiente (puntos), Social (puntos) **T4 24** | `05-uploads-png-batch-1.md:134` |

---

## Part B

### KVIs (Monitor de Valor — Key Value Indicators)

Screen-parity dataset: the 22 rows of `KVI_DATA_BASE` (HTML L4158–4181) exactly as SCR-11 displays them (Monitor / Reto = round(Real/Meta·100), Meta/Real when lower is better, floor 0, not capped — HTML L4184–4188; TBD rows have no real / meta; the text-mode row shows BB / 100 %). Category weights: Financiero 60 %, Mercado 15 %, Estratégico 20 %, Grupos de Interés 5 % (HTML L4159–4180 `pesoCategoria`). Row weights are the V2 values (Financiero rows sum 50 % + nulls — CF-63).

| Category | Indicador | Code | Unidad | Peso | Responsable | Meta 2025 | Meta Reto | Real 2025 | Monitor | Reto | Source |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Financiero (60%)** | Flujo de Caja Libre | KVI-FCL | BCOP | 10% | Diego Gómez | 7,19 | 10,53 | 10,69 | 149% | 102% | `SCR-11-monitor-valor.md:286` |
|  | Deuda Bruta / EBITDA (lower is better) | KVI-DEUDA | Veces | 5% | Kellin Sánchez | 2,5 | 1,5 | 2,32 | 108% | 65% | `SCR-11-monitor-valor.md:287` |
|  | Cobertura de Intereses | KVI-COBERTURA | MUSD | 5% | Juan Carlos López | 8,14 | 26,5 | 6,1 | 75% | 23% | `SCR-11-monitor-valor.md:289` |
|  | EFI Activos Pareto Upstream | KVI-EFIPARETO | Veces | — | GMV | 0,35 | 0,35 | 0,28 | 80% | 80% | `SCR-11-monitor-valor.md:291` |
|  | TIR Activos Pareto Upstream | KVI-TIRPARETO | % | — | GMV | 25,1 | 25,1 | 20.8% | 83% | 83% | `SCR-11-monitor-valor.md:292` |
|  | Eficiencias | KVI-EFIC | mMCOP | 15% | Jimmy Morales | 4,56 | 6,63 | 6,64 | 146% | 100% | `SCR-11-monitor-valor.md:293` |
|  | ROACE | KVI-ROACE | % | 15% | Liz Cardona | 7,9 | 12,3 | 7.4% | 94% | 60% | `SCR-11-monitor-valor.md:294` |
|  | ROACE menos WACC | KVI-ROACEWACC | % | — | Liz Cardona | TBD | TBD | TBD | TBD | TBD | `SCR-11-monitor-valor.md:295` |
|  | KVI del portafolio | KVI-KVIPORT | - | — | — | TBD | TBD | TBD | TBD | TBD | `SCR-11-monitor-valor.md:296` |
| **Mercado (15%)** | TRR (renta variable) | KVI-TRR | % | 5% | Bloomberg · JVD | 7 | 7 | 24% | 343% | 343% | `SCR-11-monitor-valor.md:297` |
|  | Bond Spread (renta fija) | KVI-BOND | COP | 5% | Valentina Rodríguez | 87,4 | 87,4 | 90,4 | 103% | 103% | `SCR-11-monitor-valor.md:298` |
|  | Precio Objetivo Analistas | KVI-PRECIO | COP | 5% | Bloomberg · JVD | 2104 | 2500 | 1.870 | 89% | 75% | `SCR-11-monitor-valor.md:299` |
|  | Calificación de Riesgo Crediticio (text mode) | KVI-RIESGOCRED | Rating | — | GMV | BB | BB | BB | 100% | 100% | `SCR-11-monitor-valor.md:300` |
| **Estratégico (20%)** | Dividendos Recibidos | KVI-DIVID | mMCOP | 2% | Diego Gómez | 5819 | 8730 | 8.480 | 146% | 97% | `SCR-11-monitor-valor.md:302` |
|  | CT+i | KVI-CTI | MUSD | 2% | M. Alejandra Rodríguez | 304,45 | 587,24 | 548,59 | 180% | 93% | `SCR-11-monitor-valor.md:303` |
|  | EBITDA / Capex (ISA) | KVI-EBITDACAPEX | Veces | — | Daniel González | 1,1 | 1,4 | 1,4 | 127% | 100% | `SCR-11-monitor-valor.md:304` |
|  | Dividendos recibidos / intereses pagados | KVI-DIVINT | Veces | 2% | — | 0,6 | 3,2 | 1,1 | 183% | 34% | `SCR-11-monitor-valor.md:306` |
|  | Margen EBITDA ISA | KVI-MARGENEBITDA | % | 2% | — | 53,3 | 72,2 | 54.2% | 102% | 75% | `SCR-11-monitor-valor.md:307` |
|  | Costo Energía GE (lower is better) | KVI-COSTOENERGIA | $/kWh | 2% | Margarita García / Paola Molina | 441 | 424 | 425 | 104% | 100% | `SCR-11-monitor-valor.md:308` |
|  | IRR | KVI-IRR | % | 8% | Fidel Delgado | 80 | 100 | 121% | 151% | 121% | `SCR-11-monitor-valor.md:310` |
|  | Estrategia Diversificación | KVI-DIVERSIF | % | 2% | Carolina Vargas | 19 | 19 | 27% | 142% | 142% | `SCR-11-monitor-valor.md:311` |
| **Grupos de Interés (5%)** | Aporte al PIB | KVI-PIB | BCOP | 5% | Mauricio Orozco | 1,69 | 1,86 | 1,71 | 101% | 92% | `SCR-11-monitor-valor.md:312` |

**Two-dataset rule (CF-63 / CF-64, OQ-07, OQ-36)**:
- **Table rows** (SCR-11 KVI table, V-31) use the V2 screen-parity dataset above.
- **Aggregates** (KPI tiles "Cumplimiento global" / "Cumplimiento Reto", donut centre, category compliance) use the Excel D4
  methodology dataset in `docs/design/oracles/kvi.json` (`rows` + `expected`), produced by `tools/oracles/print-kvi.mjs`:
  global capped weighted `96,15 %` (tile "96 %") = 94,69×0,60 + 98,91×0,15 + 97,51×0,20 + 100×0,05; Reto `78,56 %` (tile
  "78,6 %") (`06-uploads-png-batch-2.md:253`). The two datasets differ in weights and metas (e.g. FCL 10 % / meta 7,19 in V2 vs 15 % / 8,10
  in D4) until the PO picks one (OQ-36).
- One engine value per concept (OQ-37): the donut centre shows the weighted global (`96,2 %` with one decimal), not V2's
  simple mean of capped results × snapshot factor (V2 donut: 96.1 Abril 2026, 93.2 Enero 2026, 89.3 Octubre 2025, 86.4
  Julio 2025 — kept only as the V2 reference).
- At-risk / TBD tile counts come from the engine over the same dataset (OQ-35); V2's static tiles (1 / 3) do not match the rows.
- Donut colors: Financiero `#518CD1`, Mercado `#49BCD8`, Estratégico `#7C35EA`, Grupos de Interés `#0F9B8E`.

### KVI_MISSING_DATA (Computed-only fields, not in source)

| Indicator | Code | Status | Source |
|---|---|---|---|
| ROACE menos WACC | KVI-ROACEWACC | null (TBD) | `02-prototype-html.md:520-545`, `06-uploads-png-batch-2.md:400` |
| TIR Activos Pareto Upstream | KVI-TIRPARETO | null | `06-uploads-png-batch-2.md:400` |
| EFI Activos Pareto Upstream | KVI-EFIPARETO | null | `06-uploads-png-batch-2.md:400` |
| KVI del portafolio | KVI-KVIPORT | null (TBD) | `02-prototype-html.md:531`, `06-uploads-png-batch-2.md:177` |

### SENSITIVITY_LEVERS (Monitor de Valor — Sensitivity)

| Dimension | Indicator | Base | Meta | Levers | Source |
|---|---|---|---|---|---|
| **ROACE** | ROACE | 7.4% | 7.9% | energía (-0.16), servicios (-0.00016), produccion (+0.3) | `02-prototype-html.md:547-551` |
| **Margen EBITDA ISA** | Margen | 54.2% | 72.2% | (not ready) | `02-prototype-html.md:547-551`, `06-uploads-png-batch-2.md:406-410` |
| **Deuda Bruta / EBITDA** | Deuda | 2.32x | 1.50x | (not ready) | `02-prototype-html.md:547-551` |

### SENSITIVITY_PLANS (Weak indicators, monitor <90%)

| Indicator | Peso | Monitor | Plan | Duration | Severity | Source |
|---|---|---|---|---|---|---|
| Deuda Bruta / EBITDA | 6% | 65% | Ajuste incremental: reforzar seguimiento mensual y metas parciales | 90 días | Media | `02-prototype-html.md:549` |
| Cobertura de Intereses | 6% | 23% | Ajuste incremental: reforzar seguimiento mensual y metas parciales | 90 días | Media | `02-prototype-html.md:549` |
| Precio Objetivo Analistas | 5% | 75% | Ajuste incremental | 90 días | Media | `02-prototype-html.md:549` |
| Dividendos / intereses pagados | 2% | 34% | Plan de choque: revisar drivers operativos y de costo del indicador | 30 días | Alta | `02-prototype-html.md:549` |
| Estrategia Diversificación | 2% | 100% | Plan de choque | 30 días | Alta | `02-prototype-html.md:549` |
| Margen EBITDA ISA | 2% | 75% | Ajuste incremental | 90 días | Media | `02-prototype-html.md:549` |

### NOTIFICATIONS (11 items)

| # | Type | Message | Time | Severity | Source |
|---|---|---|---|---|---|
| 1 | Dato | "Nueva actualización disponible: Chevron T4 2025." | Hace 2 horas | INFO | `02-prototype-html.md:553` |
| 2 | Dato | "Cobertura de datos alcanzó 82% del informe de pares." | Hace 5 horas | OK | `02-prototype-html.md:553` |
| 3 | Dato | "ISA no ha remitido información del corte — bloquea 3 indicadores." | Ayer | CRÍTICO | `02-prototype-html.md:553` |
| 4 | Comentario | "Comentario pendiente de Ejecutivo Integral en ROACE." | Ayer | ATENCIÓN | `02-prototype-html.md:553` |
| 5 | Publicación | "Andrea publicó el análisis de Referentes Estratégicos." | Hace 2 días | INFO | `02-prototype-html.md:553` |
| 6 | Yarbis | "Yarbis detectó una anomalía en Margen EBITDA frente al histórico." | Hace 3 días | ATENCIÓN | `02-prototype-html.md:553` |
| 7 | Noticia | "Nueva noticia de alto impacto: caída sostenida del Brent." | Hace 3 días | CRÍTICO | `02-prototype-html.md:553` |
| 8 | Colaboración | "Se agregó Petrobras como nuevo competidor en el análisis TBG." | Hace 4 días | INFO | `02-prototype-html.md:553` |
| 9 | Comentario | "Presentación \"Storytelling de Mercado\" recibió un comentario nuevo." | Hace 5 días | INFO | `02-prototype-html.md:553` |
| 10 | Dato | "Homologación de datos completada al 100% para BP y Shell." | Hace 6 días | OK | `02-prototype-html.md:553` |
| 11 | Sistema | "Mantenimiento programado del sistema el sábado de 10pm a 12am." | Hace 6 días | INFO | `02-prototype-html.md:553` |

### PRESENTATIONS ( SCR-13)

#### Seed Presentations

| Name | Date | State | Source |
|---|---|---|---|
| "Directorio" | — | — | `02-prototype-html.md:298-320` |
| "Storytelling de Mercado" | — | — | `02-prototype-html.md:553` |

#### Slide Kinds (14 types)

| Kind | Purpose | Source |
|---|---|---|
| **Resumen** | Executive summary per category | `02-prototype-html.md:324-344` |
| **Benchmark** | GE vs pares comparison | `02-prototype-html.md:324-344` |
| **Valor** | Monitor de Valor KVI table and radar | `02-prototype-html.md:165-198`, `06-uploads-png-batch-2.md:165-198` |
| **Sensibilidades** | What-if simulation results | `02-prototype-html.md:547-551` |
| **Hallazgos** | AI-generated findings and narratives | `02-prototype-html.md:324-344` |
| **Peso en TBG** | TBG/ILP dimension weights per company | `02-prototype-html.md:146-151`, `06-uploads-png-batch-2.md:146-151` |
| **Peso en ILP** | ILP dimension weights per company | `02-prototype-html.md:501-504`, `06-uploads-png-batch-2.md:146-151` |
| **Aspiración 2040+** | Multi-energy and decarbonization strategy | `06-uploads-png-batch-2.md:272-284` |
| **Principales indicadores** | Top indicators per dimension | `06-uploads-png-batch-2.md:272-284` |
| **Análisis cualitativo** | TBG/ILP qualitative breakdown | `02-prototype-html.md:501-504`, `06-uploads-png-batch-2.md:146-151` |
| **Peso en TBG por dimensión · GE vs. pares** | Dynamic weight comparison | `06-uploads-png-batch-2.md:272-284` |
| **Radar competitivo** | Competitive positioning radar | `02-prototype-html.md:1247-1249`, `06-uploads-png-batch-2.md:272-284` |
| **Heatmap** | Heatmap of indicators per dimension | `02-prototype-html.md:1247-1249` |
| **Donut** | Monitor de Valor donut center with KVI compliance | `06-uploads-png-batch-2.md:165-198` |

### COMMENT_SEEDS (F32 — Review Comments)

| User | Role | Type | Message | Time | Source |
|---|---|---|---|---|---|
| **Pendientes** | | | | | `02-prototype-html.md:557` |
| Jorge Salas | Ejecutivo visualizador | Comentario | "¿Podemos profundizar en la brecha de Solvencia vs. pares?" | hace 1 día | `02-prototype-html.md:557` |
| **En análisis** | | | | | `02-prototype-html.md:557` |
| Alejandra Ríos | Ejecutivo integral | Comentario | "Solicito ampliar el histórico de ROACE a 10 años." | hace 3 días | `02-prototype-html.md:557` |
| **Resueltos** | | | | | `02-prototype-html.md:557` |
| Camila Bravo | Analista creador | Comentario | "Se corrigió el valor atípico de Cobertura de Intereses." | hace 1 semana | `02-prototype-html.md:557` |
| **Report comment seed (unrendered)** | | | | | `02-prototype-html.md:557` |
| Alejandra Ríos | Ejecutivo integral | Comentario | "¿Podemos añadir una columna de variación % vs. el trimestre anterior?" | — | `02-prototype-html.md:557` |

### AI_TEXTS (Yarbis — AI Copilot)

| Type | Content | Source |
|---|---|---|
| **System prompt** | "Eres Yarbis, analista financiero senior de Ecopetrol. Redactas el comentario ejecutivo que acompaña una diapositiva de una presentación de referenciamiento competitivo para la alta dirección. Escribe 1 o 2 frases (máximo 35 palabras), en {lang}, sin viñetas, sin comillas, sin saludo. Usa solo cifras presentes en los datos. Enfócate en la implicación estratégica para Ecopetrol." | `02-prototype-html.md:3693`, `02-prototype-html.md:598` |
| **lang variable note** | `lang = español / inglés per the presentation language` (defined in HTML L3691, used in the system prompt at HTML L3693) | `02-prototype-html.md:597-598` |
| **User message template** | "Datos del análisis (Grupo Ecopetrol vs. promedio de pares):\n{ctx}\n\nMódulo: {module}\nDiapositiva: {chart}\n\nRedacta el comentario para esta diapositiva." | `02-prototype-html.md:598` |
| **Yarbis call** | `window.claude.complete({system, messages, max_tokens:200})` | `02-prototype-html.md:39`, `02-prototype-html.md:598` |
| **AI chat UI** | Cyan accent `#49BCD8` (FAB), `#0E7490` (link hover), `#E3F6FA` (bg), `#A8E6EC` (border) | `02-prototype-html.md:606` |
| **Comment seed (anomaly)** | "Yarbis detectó una anomalía en Margen EBITDA frente al histórico." | `02-prototype-html.md:553` |
| **Alert (weight sum)** | "⚠ {names} supera(n) el 100% en la sumatoria de pesos (Financiera + Operativa + Transversal). Ajusta los valores antes de guardar." | `02-prototype-html.md:119`, `07-uploads-png-batch-3.md:119` |
| **AI findings, narratives & recommendations** | Per-module AI insights (F18) | `02-prototype-html.md:663` |
| **Suggestion chips** | `#EDE9FE`/`#672DBD` (rounded pill badges) | `02-prototype-html.md:606` |

---

## Conflict Summary

---

## Conflict Summary

| Conflict | Source | Resolution |
|---|---|---|
| **T4 24 vs T4 25** | `05-uploads-png-batch-1.md:129` | Prototype uses T4 25 for most; ESG uses T4 24. Documented separately. |
| **TBG weights: Shell IFSP** | `06-uploads-png-batch-2.md:148` | Source: 7.5% + 7.5% = 15%; Prototype: 8% + 8% = 16%. Discrepancy noted. |
| **TBG weights: BP IFSP** | `06-uploads-png-batch-2.md:158` | Source: 7.5% + 7.5% = 15%; Prototype: 8% + 8% = 16%. Discrepancy noted. |
| **KVI weights** | `06-uploads-png-batch-2.md:395-400` | Excel: Eficiencias 10%, ROACE 15%; Prototype: Eficiencias 15%, ROACE 15%. Weights swapped. |
| **Ecopetrol color** | `10-synthesis.md:632-633` | Rule: Ecopetrol reserved `#83E377`; Prototype: Shell `#83E377`, Ecopetrol `#10B981`. Conflict documented. |
| **Dimension colors** | `10-synthesis.md:632-633` | README: Financiera `#672DBD`, Operativa `#49BCD8`, Transversal `#FBBF24`; Prototype bars: `#2C699A`/`#0DB39E`/`#F1C453`. Internal inconsistency. |

> **Rule**: Cross-module inconsistencies are documented here (see conflict summary), not silently unified. Real data from the BFF will resolve these discrepancies.
