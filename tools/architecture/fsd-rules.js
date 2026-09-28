// Feature-Sliced Design rules for the web app, shared by eslint.config.js (`pnpm lint`) and the architecture checks
// (`pnpm check:architecture`, `pnpm check:architecture:selftest`).
//
// Layers, top to bottom: app → pages → widgets → features → entities → shared. A layer imports only layers below it;
// slices of the same layer never import each other; another slice is imported only through its public API (index.ts).
// app and shared have no slices (their segments import each other freely).
import boundaries from 'eslint-plugin-boundaries';

/** Trees that follow the FSD layout: the real app and the architecture fixtures. */
export const FSD_ROOTS = ['src', 'tools/arch-fixtures/valid', 'tools/arch-fixtures/planted'];

const SLICED_LAYERS = ['pages', 'widgets', 'features', 'entities'];
const ORDER = ['app', 'pages', 'widgets', 'features', 'entities', 'shared'];
const PUBLIC_API = 'index.{ts,tsx}';

// Folder mode: a pattern matches the element folder from the right (`features/*` = one slice folder). The same
// layout is repeated under every FSD root, so the folder names alone identify the layer.
const element = (layer) =>
  SLICED_LAYERS.includes(layer)
    ? { type: layer, pattern: `${layer}/*`, capture: ['slice'] }
    : { type: layer, pattern: layer };

const lowerLayers = (layer) => ORDER.slice(ORDER.indexOf(layer) + 1);

/** One allow policy per lower layer: sliced layers only through their public API, shared through any file. */
const policiesFor = (layer) =>
  lowerLayers(layer).map((target) => ({
    from: { element: { type: layer } },
    allow: {
      to: {
        element: SLICED_LAYERS.includes(target)
          ? { type: target, fileInternalPath: PUBLIC_API }
          : { type: target },
      },
    },
  }));

const ROUTE_MESSAGE =
  'Spell route paths only in src/shared/config/routes.ts and reference them from there (routes.<key>.build / .path).';
const NAVIGATION_CALLS = 'navigate|redirect|redirectDocument|replace';
/** A string literal or a template literal whose first chunk starts with "/". */
const pathLike = (parent) => [
  `${parent} > Literal[value=/^\\//]`,
  `${parent} > TemplateLiteral[quasis.0.value.raw=/^\\//]`,
];

/** no-restricted-syntax entries of the routes rule. */
function routeLiteralSelectors() {
  const selectors = [
    ...pathLike('JSXAttribute[name.name=/^(to|href)$/]'),
    ...pathLike('JSXAttribute[name.name=/^(to|href)$/] > JSXExpressionContainer'),
    ...pathLike(`CallExpression[callee.name=/^(${NAVIGATION_CALLS})$/]`),
    ...pathLike(`CallExpression[callee.property.name=/^(${NAVIGATION_CALLS})$/]`),
    // Route objects (createBrowserRouter / RouteObject): any literal path, including the "*" catch-all.
    'Property[key.name="path"] > Literal',
    'Property[key.name="path"] > TemplateLiteral',
  ];
  return selectors.map((selector) => ({ selector, message: ROUTE_MESSAGE }));
}

/** Import fences: a module (or folder) that only one place of `shared` may import. */
const IMPORT_FENCES = [
  {
    // D3: ECharts stays behind the chart wrappers.
    home: 'shared/ui/charts',
    paths: [{ name: 'echarts', message: 'Import echarts only inside src/shared/ui/charts/ (D3).' }],
    patterns: [
      {
        group: ['echarts/*', 'zrender', 'zrender/*'],
        message: 'Import echarts only inside src/shared/ui/charts/ (D3).',
      },
    ],
  },
  {
    // ADR-0004: the Orval output (types + Zod) is consumed only by the API layer, which re-exports what the app needs.
    home: 'shared/api',
    paths: [],
    patterns: [
      {
        regex: '(^|/)shared/api/generated(/|$)',
        message:
          'Import the generated contract only inside src/shared/api/ (ADR-0004); use the shared/api public API.',
      },
    ],
  },
];

/**
 * One no-restricted-imports block outside every fence home plus one block per home (which gets the other fences), so
 * no block overrides another's options. The homes are disjoint folders.
 */
function importFenceConfigs(roots) {
  const sources = (dir) =>
    roots.flatMap((root) => [`${root}/${dir}**/*.ts`, `${root}/${dir}**/*.tsx`]);
  const homes = (fence) => roots.map((root) => `${root}/${fence.home}/**`);
  const block = (name, blockFiles, ignores, fences) => ({
    name,
    files: blockFiles,
    ignores,
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: fences.flatMap((fence) => fence.paths),
          patterns: fences.flatMap((fence) => fence.patterns),
        },
      ],
    },
  });
  return [
    block('eco/import-fences', sources(''), IMPORT_FENCES.flatMap(homes), IMPORT_FENCES),
    ...IMPORT_FENCES.map((fence) =>
      block(
        `eco/import-fences-inside-${fence.home.replaceAll('/', '-')}`,
        sources(`${fence.home}/`),
        [],
        IMPORT_FENCES.filter((other) => other !== fence),
      ),
    ),
  ];
}

/** Flat-config blocks for the files of the given FSD roots. */
export function fsdConfigs(roots = FSD_ROOTS) {
  const files = roots.flatMap((root) => [`${root}/**/*.ts`, `${root}/**/*.tsx`]);
  return [
    {
      name: 'eco/fsd-boundaries',
      files,
      plugins: { boundaries },
      settings: {
        'boundaries/elements': ORDER.map(element),
        // boundaries resolves imports through the eslint-plugin-import resolver interface.
        'import/resolver': { typescript: { alwaysTryTypes: true }, node: true },
      },
      rules: {
        'boundaries/dependencies': [
          'error',
          {
            default: 'disallow',
            message:
              'FSD boundary violated: {{from.type}} may import only lower layers, other slices only through their index.ts.',
            policies: ORDER.flatMap(policiesFor),
          },
        ],
      },
    },
    // `no-restricted-imports` can hold one option set per file, so the two import fences share it: every file gets
    // the fences it is outside of (charts code may import echarts, shared/api code may import the generated contract).
    ...importFenceConfigs(roots),
    {
      // Route paths are spelled only in shared/config/routes.ts (brief §5.4, CF-142); everything else uses routes.<key>.build()
      // or routes.<key>.path. Rejected outside that file: string or template literals starting with "/" in JSX
      // `to` / `href`, in navigate / redirect / redirectDocument / replace calls (also `router.navigate(...)`), and
      // literal `path` values of route objects.
      name: 'eco/routes-only-in-routes-ts',
      files,
      ignores: roots.map((root) => `${root}/shared/config/routes.ts`),
      rules: {
        'no-restricted-syntax': ['error', ...routeLiteralSelectors()],
      },
    },
  ];
}
