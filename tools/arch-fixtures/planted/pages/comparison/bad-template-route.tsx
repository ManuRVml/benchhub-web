// Violates the routes rule: a template-literal route path outside src/shared/config/routes.ts.
export function AnalysisLink({ id }: { readonly id: string }) {
  return <a href={`/analisis/${id}/resultados`}>Resultados</a>;
}
