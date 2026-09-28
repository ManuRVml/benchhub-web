// `pnpm check:architecture:selftest`: proves the architecture rules reject the planted fixtures without touching the
// tracked tree. Every bad-* file must be reported by exactly the expected rule; support files must stay clean.
// Exits 0 only when every planted violation is caught.
import path from 'node:path';

import { ESLint } from 'eslint';

const PLANTED = 'tools/arch-fixtures/planted';
const EXPECTED = {
  'shared/lib/bad-upward-import.ts': 'boundaries/dependencies',
  'entities/company/bad-upward-import.ts': 'boundaries/dependencies',
  'features/select-company/bad-cross-slice.ts': 'boundaries/dependencies',
  'widgets/company-panel/bad-deep-import.ts': 'boundaries/dependencies',
  'pages/comparison/bad-echarts-import.ts': 'no-restricted-imports',
  'pages/comparison/bad-generated-import.ts': 'no-restricted-imports',
  'pages/comparison/bad-string-route.tsx': 'no-restricted-syntax',
  'pages/comparison/bad-template-route.tsx': 'no-restricted-syntax',
  'pages/comparison/bad-redirect.ts': 'no-restricted-syntax',
  'pages/comparison/bad-route-object.ts': 'no-restricted-syntax',
};

const eslint = new ESLint({
  overrideConfigFile: 'tools/architecture/eslint.architecture.config.js',
});
const results = await eslint.lintFiles([PLANTED]);
const failures = [];
const seen = new Set();

for (const result of results) {
  const file = path.relative(PLANTED, result.filePath).split(path.sep).join('/');
  const errors = result.messages.filter((m) => m.severity === 2);
  const expectedRule = EXPECTED[file];
  if (!expectedRule) {
    if (errors.length)
      failures.push(
        `${file}: support file must be clean, got ${errors.map((e) => e.ruleId).join(', ')}`,
      );
    continue;
  }
  seen.add(file);
  if (errors.length === 1 && errors[0].ruleId === expectedRule) {
    console.log(`REJECTED ${file} (${expectedRule}): ${errors[0].message}`);
  } else {
    failures.push(
      `${file}: expected exactly one ${expectedRule} error, got [${errors.map((e) => e.ruleId).join(', ')}]`,
    );
  }
}
for (const file of Object.keys(EXPECTED))
  if (!seen.has(file)) failures.push(`${file}: planted fixture missing`);

if (failures.length) {
  for (const f of failures) console.error(`SELFTEST FAIL ${f}`);
  process.exitCode = 1;
} else {
  console.log(`architecture selftest OK: ${seen.size} planted violations rejected`);
}
