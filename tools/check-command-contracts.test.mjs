// @vitest-environment node
// Selftest of tools/check-command-contracts.mjs: the single-block form, the two-mode (discriminated) form of C-24, and
// the failure paths, over small in-file contract docs; plus one CLI run over the real mirrored docs.
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { validateContract } from './check-command-contracts.mjs';

const SCRIPT = fileURLToPath(new URL('./check-command-contracts.mjs', import.meta.url));
const FENCE = '```';

/** The bullets every contract needs besides request/response, then the caller's request/response text. */
function contract({ request, response }) {
  return [
    '# C-99 — Example',
    '',
    '- Endpoint: `POST /api/v1/examples`',
    '- Triggered from: SCR-99',
    ...(request === undefined ? [] : [request]),
    response,
    '- Permission required: `analyst_creator` role',
    '- Validation / errors:',
    '  - FORBIDDEN: not allowed',
    '- Side effects: none',
    '- budgetBytes: 4096',
    '',
  ].join('\n');
}

const SINGLE_REQUEST = [
  '- Request (minimal JSON):',
  `  ${FENCE}json`,
  '  { "name": "x" }',
  `  ${FENCE}`,
].join('\n');
const SINGLE_RESPONSE = ['- Response:', `  ${FENCE}json`, '  { "saved": true }', `  ${FENCE}`].join(
  '\n',
);

const WEIGHTS_REQUEST_MODE = [
  '  - `weights` mode:',
  `    ${FENCE}json`,
  '    { "mode": "weights", "weights": [] }',
  `    ${FENCE}`,
];
const SCENARIO_REQUEST_MODE =
  '  - `scenario` mode: `{ "mode": "scenario", "productivity": -5..10, "operatingCosts": -15..10 }` (step 1).';
const TWO_MODE_RESPONSE = (secondMode) =>
  [
    '- Response: two modes, discriminated by `mode`.',
    '  - `weights` mode:',
    `    ${FENCE}json`,
    '    { "mode": "weights", "score": 85 }',
    `    ${FENCE}`,
    '  - `scenario` mode:',
    `    ${FENCE}json`,
    secondMode,
    `    ${FENCE}`,
  ].join('\n');
const TWO_MODE_REQUEST = (scenarioLine) =>
  ['- Request: two modes, discriminated by `mode`.', ...WEIGHTS_REQUEST_MODE, scenarioLine].join(
    '\n',
  );

describe('check-command-contracts', () => {
  it('accepts the single-block form', () => {
    expect(
      validateContract(
        'C-99-example.md',
        contract({ request: SINGLE_REQUEST, response: SINGLE_RESPONSE }),
      ),
    ).toEqual([]);
  });

  it('accepts the two-mode form, with a fenced block and an inline JSON span carrying a numeric range', () => {
    const doc = contract({
      request: TWO_MODE_REQUEST(SCENARIO_REQUEST_MODE),
      response: TWO_MODE_RESPONSE('    { "mode": "scenario", "gapClosedPct": 45 }'),
    });
    expect(validateContract('C-99-example.md', doc)).toEqual([]);
  });

  it('fails a two-mode request whose second (inline) mode is not valid JSON', () => {
    const doc = contract({
      request: TWO_MODE_REQUEST('  - `scenario` mode: `{ "mode": "scenario", "productivity": }`.'),
      response: TWO_MODE_RESPONSE('    { "mode": "scenario", "gapClosedPct": 45 }'),
    });
    const problems = validateContract('C-99-example.md', doc);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(/^C-99-example\.md: JSON parse error: request inline block 2:/);
  });

  it('fails a two-mode response whose second (fenced) mode is not valid JSON', () => {
    const doc = contract({
      request: TWO_MODE_REQUEST(SCENARIO_REQUEST_MODE),
      response: TWO_MODE_RESPONSE('    { "mode": "scenario", "gapClosedPct": 45, }'),
    });
    const problems = validateContract('C-99-example.md', doc);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(/^C-99-example\.md: JSON parse error: response fenced block 2:/);
  });

  it('fails the single-block form when its JSON is invalid', () => {
    const broken = SINGLE_REQUEST.replace('"x" }', '"x" ');
    const problems = validateContract(
      'C-99-example.md',
      contract({ request: broken, response: SINGLE_RESPONSE }),
    );
    expect(problems.join('\n')).toMatch(/JSON parse error: request fenced block 1/);
  });

  it('still fails a doc with no request at all with "missing bullets: request"', () => {
    const problems = validateContract(
      'C-99-example.md',
      contract({ request: undefined, response: SINGLE_RESPONSE }),
    );
    expect(problems).toEqual(['C-99-example.md: missing bullets: request']);
  });

  it('ignores an inline brace span that is not in a "... mode" bullet', () => {
    const doc = contract({
      request: [SINGLE_REQUEST, '  - Note: the body looks like `{ not: json }`.'].join('\n'),
      response: SINGLE_RESPONSE,
    });
    expect(validateContract('C-99-example.md', doc)).toEqual([]);
  });

  it('validates every real mirrored contract (the CLI exits 0)', () => {
    const result = spawnSync(process.execPath, [SCRIPT], { encoding: 'utf8' });
    expect(result.stdout).toContain('All 41 contracts validated successfully');
    expect(result.status).toBe(0);
  });
});
