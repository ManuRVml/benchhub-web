// Violates the routes rule: route paths are spelled only in src/shared/config/routes.ts.
function Link({ to, children }: { readonly to: string; readonly children: string }) {
  return <a href={to}>{children}</a>;
}

export function BackLink() {
  return <Link to="/analisis">Volver</Link>;
}
