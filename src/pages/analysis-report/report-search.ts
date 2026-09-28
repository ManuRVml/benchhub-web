import { z } from 'zod';

// URL state of SCR-09 (routes.analysisReport): `ranking=fin|op|trans`, absent = `fin` (P5-47b, "Ranking por
// categoría" dimension chips); `categoria`, absent = `rentabilidad` (P5-47c, "Categorías" cards). Category ids come
// from V-20's own `categories[]`, not a fixed enum, so it stays a plain string. `peso=fin|op|trans`, absent = `fin`
// (P5-48, "Composición de peso" dimension tabs).
export const reportSearchSchema = z.object({
  ranking: z.enum(['fin', 'op', 'trans']).default('fin'),
  categoria: z.string().default('rentabilidad'),
  peso: z.enum(['fin', 'op', 'trans']).default('fin'),
});
