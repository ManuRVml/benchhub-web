import { z } from 'zod';

import { useTypedSearchParams } from '@/shared/lib/url';
import { ToastProvider } from '@/shared/ui/composites/toast';
import { MOCK_DEFAULT_ANALYSIS_ID } from '@/widgets/app-shell';
import { SensitivityDrivers } from '@/widgets/sensitivity-drivers';
import { StrategicPlan } from '@/widgets/strategic-plan';
import { WeightSimulator } from '@/widgets/weight-simulator';

const DEFAULT_INDICATOR = 'ind_roace';

const sensitivitiesSearchParamsSchema = z.object({
  indicador: z.string().min(1).default(DEFAULT_INDICATOR),
});

/**
 * SCR-12 Sensibilidades: §1 "Sensibilidad por indicador" (`sensitivity-drivers`, P5-55), §2-6 (`weight-simulator`)
 * and §7 + OVL-03 (`strategic-plan`), P5-56. `analysisId` (C-14's export, C-25/C-26's plan target) has no route param
 * here (A7: assumed the Monitor de Valor context), so it falls back to the session default like the presentations
 * list did (P5-57), until the real session query lands (P5-04b). One left-aligned 840px column that starts with the
 * drivers card, as in the prototype (BencHUD.dc.html:1467): the app shell header is the page h1 ("Sensibilidades").
 */
export function SensitivitiesPage() {
  const [{ indicador }, setSearchParams] = useTypedSearchParams(sensitivitiesSearchParamsSchema);

  return (
    <ToastProvider>
      <section
        data-testid="sensitivities-page"
        className="flex max-w-(--size-layout-max-width-monitor) flex-col gap-16"
      >
        <SensitivityDrivers
          key={indicador}
          indicatorId={indicador}
          onIndicatorChange={(next) => {
            setSearchParams({ indicador: next });
          }}
        />
        <WeightSimulator />
        <StrategicPlan analysisId={MOCK_DEFAULT_ANALYSIS_ID} />
      </section>
    </ToastProvider>
  );
}
