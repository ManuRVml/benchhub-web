#!/usr/bin/env node
// Checks the command contracts (C-01..C-41) in docs/design/view-data-contracts/. A request/response is either a single
// block (`- Request (minimal JSON):` / `- Response:` followed by one ```json fence) or, since C-24, several modes
// (`- Request: two modes, ...` with one nested ```json fence, or an inline `{...}` span in a "... mode" bullet, per
// mode). Every JSON block found under either bullet must parse.
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contractsDir = path.join(__dirname, '..', 'docs', 'design', 'view-data-contracts');

const REQUEST_BULLETS = [
  '- **Request (minimal JSON):**',
  '- Request (minimal JSON):',
  '- **Request:**',
  '- Request:',
];
const RESPONSE_BULLETS = ['- **Response:**', '- Response:'];

/** Docs annotate numeric ranges inline (`-5..10`); replace one with its lower bound so the span can be JSON-parsed. */
function normalizeRanges(text) {
  return text.replace(/(-?\d+(?:\.\d+)?)\.\.-?\d+(?:\.\d+)?/g, '$1');
}

/** Inline `{...}` JSON spans (backticked) of a nested "... mode" bullet. */
function inlineJsonSpans(line) {
  if (!/^\s+- /.test(line) || !/\bmode\b/.test(line)) return [];
  return [...line.matchAll(/`(\{[^`]*\})`/g)].map((m) => m[1]);
}

export function parseContract(content) {
  const lines = content.split('\n');

  const bullets = {
    endpoint: false,
    triggeredFrom: false,
    request: false,
    response: false,
    permission: false,
    validation: false,
    sideEffects: false,
    budgetBytes: false,
  };

  const sections = {
    requestBlocks: [],
    responseBlocks: [],
    errors: [],
    parseErrors: [],
  };

  let inRequestBlock = false;
  let inResponseBlock = false;
  let currentSection = null;
  let blockBuffer = '';

  for (const line of lines) {
    const trimmed = line.trim();

    // Check for bullet points
    if (trimmed.startsWith('- **Endpoint:**') || trimmed.startsWith('- Endpoint:'))
      bullets.endpoint = true;
    if (trimmed.startsWith('- **Triggered from:**') || trimmed.startsWith('- Triggered from:'))
      bullets.triggeredFrom = true;
    if (REQUEST_BULLETS.some((b) => trimmed.startsWith(b))) bullets.request = true;
    if (RESPONSE_BULLETS.some((b) => trimmed.startsWith(b))) bullets.response = true;
    if (
      trimmed.startsWith('- **Permission required:**') ||
      trimmed.startsWith('- Permission required:')
    )
      bullets.permission = true;
    if (
      trimmed.startsWith('- **Validation / errors:**') ||
      trimmed.startsWith('- Validation / errors:')
    )
      bullets.validation = true;
    if (trimmed.startsWith('- **Side effects:**') || trimmed.startsWith('- Side effects:'))
      bullets.sideEffects = true;
    if (trimmed.startsWith('- **budgetBytes:**') || trimmed.startsWith('- budgetBytes:'))
      bullets.budgetBytes = true;

    // Check for code block start/end
    if (trimmed.startsWith('```')) {
      if (inRequestBlock || inResponseBlock) {
        (inRequestBlock ? sections.requestBlocks : sections.responseBlocks).push({
          kind: 'fenced',
          text: blockBuffer.trim(),
        });
        inRequestBlock = false;
        inResponseBlock = false;
        blockBuffer = '';
      } else if (trimmed === '```json') {
        if (currentSection === 'request') inRequestBlock = true;
        else if (currentSection === 'response') inResponseBlock = true;
      }
    } else if (inRequestBlock || inResponseBlock) {
      blockBuffer += line + '\n';
    } else if (currentSection) {
      const target =
        currentSection === 'request' ? sections.requestBlocks : sections.responseBlocks;
      for (const span of inlineJsonSpans(line)) target.push({ kind: 'inline', text: span });
    }

    // Track which section we're in
    if (trimmed.startsWith('# ')) currentSection = null;
    else if (
      trimmed.includes('Request (minimal JSON)') ||
      REQUEST_BULLETS.some((b) => trimmed.startsWith(b))
    )
      currentSection = 'request';
    else if (trimmed.includes('Response:')) currentSection = 'response';
  }

  // Every block must parse
  for (const [name, blocks] of [
    ['request', sections.requestBlocks],
    ['response', sections.responseBlocks],
  ]) {
    blocks.forEach((block, i) => {
      try {
        JSON.parse(block.kind === 'inline' ? normalizeRanges(block.text) : block.text);
      } catch (e) {
        sections.parseErrors.push(`${name} ${block.kind} block ${i + 1}: ${e.message}`);
      }
    });
  }

  // Extract error codes from validation section
  if (bullets.validation) {
    const validationLine = lines.find((l) => l.includes('Validation / errors'));
    if (validationLine) {
      const errorCodes = validationLine.match(/[A-Z_][A-Z0-9_]*/g);
      if (errorCodes) {
        sections.errors = errorCodes.filter((e) => e.length > 2);
      }
    }
  }

  return { bullets, sections };
}

function checkBudgetBytes(value) {
  if (typeof value === 'number') return value > 0;
  if (typeof value === 'string') {
    const num = parseInt(value, 10);
    return !isNaN(num) && num > 0;
  }
  return false;
}

/** Problems of one contract file, as the lines the CLI prints (empty when the contract is valid). */
export function validateContract(file, content) {
  const result = parseContract(content);
  const problems = [];

  const missingBullets = Object.entries(result.bullets)
    .filter(([_, present]) => !present)
    .map(([key]) => key);
  if (missingBullets.length > 0)
    problems.push(`${file}: missing bullets: ${missingBullets.join(', ')}`);

  for (const parseError of result.sections.parseErrors)
    problems.push(`${file}: JSON parse error: ${parseError}`);

  // Check budgetBytes
  const budgetBytesLine = content.split('\n').find((l) => l.includes('budgetBytes:'));
  if (budgetBytesLine) {
    const match = budgetBytesLine.match(/budgetBytes:\s*(\S+)/);
    if (match && !checkBudgetBytes(match[1]))
      problems.push(`${file}: budgetBytes must be positive integer, got "${match[1]}"`);
  }

  // Check error codes are UPPER_SNAKE_CASE
  for (const error of result.sections.errors) {
    if (!/^[A-Z_][A-Z0-9_]*$/.test(error))
      problems.push(`${file}: invalid error code format: ${error}`);
  }

  return problems;
}

function main() {
  const files = fs.readdirSync(contractsDir).filter((f) => f.match(/^C-[0-9]{2}-.*\.md$/));

  // Check we have exactly C-01..C-41
  const expected = Array.from({ length: 41 }, (_, i) => `C-${String(i + 1).padStart(2, '0')}`);
  const found = files.map((f) => f.match(/^(C-\d{2})-/)[1]);

  const missing = expected.filter((id) => !found.includes(id));
  const extra = found.filter((id) => !expected.includes(id));

  let allPassed = true;

  if (missing.length > 0) {
    console.log(`Missing contracts: ${missing.join(', ')}`);
    allPassed = false;
  }

  if (extra.length > 0) {
    console.log(`Extra contracts: ${extra.join(', ')}`);
    allPassed = false;
  }

  if (files.length !== 41) {
    console.log(`Expected 41 contracts, found ${files.length}`);
    allPassed = false;
  }

  // Check each contract
  for (const file of files) {
    const problems = validateContract(file, fs.readFileSync(path.join(contractsDir, file), 'utf8'));
    for (const problem of problems) console.log(problem);
    if (problems.length > 0) allPassed = false;
  }

  if (allPassed) {
    console.log('All 41 contracts validated successfully');
    process.exit(0);
  } else {
    console.log('Validation failed');
    process.exit(1);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href)
  main();
