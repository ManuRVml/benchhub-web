# C-37 — Update user settings

- Endpoint: `PATCH /api/v1/user-settings`
- Triggered from: SCR-16 "Configuración" → accessibility + email preferences (HTML L3176–3240)
- Request (minimal JSON):
```json
{
  "fontScale": 1,
  "highContrast": false,
  "emailNotifications": true
}
```
- Response:
```json
{
  "fontScale": 1,
  "highContrast": false,
  "emailNotifications": true
}
```
- Permission required: `analyst_creator` role; user ownership
- Validation / errors:
  - INVALID_ACCESSIBILITY: fontSize must be small|medium|large
  - INVALID_DIGEST: digest must be daily|weekly|off
  - FORBIDDEN: user cannot update these settings
- Side effects: Updates user preference record; persists accessibility and email settings
- budgetBytes: 2048
- Notes: Feature F35
