import { YarbisInsightBanner } from './YarbisInsightBanner';

const INSIGHT_TEXT =
  'Detecté 3 cambios relevantes en el sector durante las últimas 24 horas: caída de margen en Shell, alza de producción en Chevron y una noticia crítica de ISA que bloquea 3 indicadores.';

export default {
  title: 'Widgets/YarbisInsightBanner',
  component: YarbisInsightBanner,
};

export const Default = {
  args: {
    text: INSIGHT_TEXT,
  },
};
