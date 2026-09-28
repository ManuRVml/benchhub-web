# C-17 — Update value monitor configuration

- Endpoint: `PUT /api/v1/value-monitor-configuration`
- Triggered from: SCR-11 "Monitor de Valor" → "Configurar" button (HTML L1685–2098)
- Request (minimal JSON):
```json
{
  "config": {
    "visibleIndicators": ["branded-id", "branded-id"],
    "thresholds": {
      "alert": 70,
      "warning": 85
    },
    "period": "quarter|year"
  }
}
```
- Response:
```json
{
  "saved": true,
  "recalculationOperationId": "optional-branded-id-if-recomputed"
}
```
- Permission required: `analyst_creator` role; monitor configuration ownership
- Validation / errors:
  - FORBIDDEN: user cannot configure this monitor
  - INVALID_CONFIG: config structure or values are invalid
- Side effects: Updates value monitor configuration; may trigger recalculation if indicators or thresholds changed
- budgetBytes: 4096
- Notes: Feature F25; may trigger F22 recalculation
