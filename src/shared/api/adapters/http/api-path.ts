/**
 * Tagged template for API paths below `/api/v1`: every interpolated value is a path parameter and is URI-encoded, so an
 * id such as `a/b c` becomes `a%2Fb%20c` and can never change the route.
 *
 * @example apiPath`/views/results-header/${analysisId}`
 */
export function apiPath(strings: TemplateStringsArray, ...params: readonly string[]): string {
  return strings.reduce(
    (path, chunk, index) =>
      path + chunk + (index < params.length ? encodeURIComponent(params[index] ?? '') : ''),
    '',
  );
}
