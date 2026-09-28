# ADR-0008: Locale and formatting — es-CO via Intl, format library only

## Status

Accepted.

## Context

The application targets Colombian users with es-CO locale. The decision must balance formatting (numbers, dates, currency) with business logic separation.

Constraints:
- Formatters are in `src/shared/lib/format/` only (no business math).
- Units: COP, USD, %, pts, x, KBOE, USD/B.
- Period labels: 'T4 2025' per prototype.

Sources: `prompt_Start_Eco.md` §5.7 (L516), `.plan/source-map/10-synthesis.md` §2.9.

## Decision

1. **es-CO locale** via `Intl` APIs:
   - `Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' })`
   - `Intl.DateTimeFormat('es-CO', { year: 'numeric', month: 'long' })`

2. **Format library location**: `src/shared/lib/format/` with one module per concern:
   ```ts
   // src/shared/lib/format/currency.ts
   export const formatCurrency = (amount: number, currency: 'COP' | 'USD' = 'COP') => {
     const formatter = new Intl.NumberFormat('es-CO', {
       style: 'currency',
       currency,
       minimumFractionDigits: 0,
       maximumFractionDigits: 2,
     });
     return formatter.format(amount);
   };
   ```

3. **Units supported**:
   - Currency: COP, USD
   - Percentage: %
   - Points: pts
   - Multiplier: x
   - Energy: KBOE
   - Price: USD/B

4. **Period labels**: 'T1 2025', 'T2 2025', etc. via helper:
   ```ts
   // src/shared/lib/format/period.ts
   export const formatPeriod = (quarter: 1 | 2 | 3 | 4, year: number) =>
     `T${quarter} ${year}`;
   ```

5. **No business math**: Formatters only format; calculations happen in domain logic.

## Alternatives considered

- **date-fns/dayjs**: Extra dependencies for basic formatting; Intl is sufficient.
- **Custom format functions**: Would duplicate Intl functionality; error-prone.
- **Format in components**: Violates separation; formatters are reusable.

## Consequences

- Positive: Native Intl support; no dependencies.
- Positive: Clear separation of formatting vs business logic.
- Positive: Consistent unit handling across the app.
- Negative: Need to export locale codes (es-CO) to consumers.
- Negative: Some formatting (e.g., KBOE) requires custom logic.
