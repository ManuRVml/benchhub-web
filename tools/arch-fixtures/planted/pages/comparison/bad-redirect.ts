// Violates the routes rule: redirect() with a literal route path outside src/shared/config/routes.ts.
declare function redirect(url: string): Response;

export const loader = () => redirect('/inicio');
