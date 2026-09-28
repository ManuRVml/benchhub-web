import type { AssistantScreen } from './assistant-events';
import type { AssistantContextScreen } from '@/shared/api';

/**
 * C-33 `context.screen` → V-46 `?screen=`. Both contracts describe the same screens, but name three of them
 * differently (the indicator detail, the Monitor de Valor and the presentation viewer); a full record, so a screen
 * added to either enum fails the typecheck here.
 */
const CONTEXT_SCREEN: Record<AssistantScreen, AssistantContextScreen> = {
  inicio: 'inicio',
  analisis: 'analisis',
  definicion: 'definicion',
  resultados: 'resultados',
  visualizacion: 'visualizacion',
  'detalle-indicador': 'detalle',
  'monitor-valor': 'valor',
  sensibilidades: 'sensibilidades',
  presentaciones: 'presentaciones',
  'presentacion-detalle': 'presentaciones',
  notificaciones: 'notificaciones',
  configuracion: 'configuracion',
};

export function toAssistantContextScreen(screen: AssistantScreen): AssistantContextScreen {
  return CONTEXT_SCREEN[screen];
}
