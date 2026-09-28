// Extracts contract examples from view-data-contracts docs as fixture files.
// Usage: pnpm contract:fixtures (writes) or pnpm contract:fixtures --check (validates)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTRACTS_DIR = path.join(__dirname, '../../docs/design/view-data-contracts');
const FIXTURES_DIR = path.join(__dirname, '../../src/test/fixtures/contracts');

// Get all contract files and extract IDs
function getContractIds() {
  const files = fs.readdirSync(CONTRACTS_DIR);
  const ids = new Set();

  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    // Extract ID from filename like V-03-home.md, C-01-create-analysis-draft.md
    const match = file.match(/^([A-Z]-\d{2})-/);
    if (match) {
      ids.add(match[1]);
    }
  }

  return Array.from(ids).sort();
}

// Extract JSON block after a given marker line (e.g., "- Request" or "- Response")
// Uses the exact same logic as the check script
function processContractFile(filePath, id) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let kind = null;
  let firstViewDone = false;
  const fixtures = {};

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/^- Request\b/.test(l)) kind = 'request';
    else if (/^- Response\b/.test(l)) kind = 'response';
    else if (/^- /.test(l) && !l.startsWith('- Response') && !l.startsWith('- Request'))
      kind = kind && null;
    if (l.trim() === '```json') {
      const end = lines.findIndex((x, j) => j > i && x.trim() === '```');
      const body = lines.slice(i + 1, end).join('\n');
      i = end;
      let k = kind;
      if (!k && /^[VO]-/.test(id) && !firstViewDone) k = 'response';
      if (!k) continue;
      if (k === 'response') firstViewDone = true;
      // Only keep the first block per (id, kind)
      if (fixtures[k] === undefined) {
        fixtures[k] = body;
      }
      kind = null;
    }
  }

  return fixtures;
}

// Write fixture files
function writeFixtures(id, fixtures) {
  if (!fs.existsSync(FIXTURES_DIR)) {
    fs.mkdirSync(FIXTURES_DIR, { recursive: true });
  }

  if (fixtures.request) {
    const value = JSON.parse(fixtures.request);
    fs.writeFileSync(
      path.join(FIXTURES_DIR, `${id}.request.json`),
      JSON.stringify(value, null, 2) + '\n',
      'utf8',
    );
  }

  if (fixtures.response) {
    const value = JSON.parse(fixtures.response);
    fs.writeFileSync(
      path.join(FIXTURES_DIR, `${id}.response.json`),
      JSON.stringify(value, null, 2) + '\n',
      'utf8',
    );
  }
}

// Deep equality check for JSON objects
function isDeepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  const checkMode = args.includes('--check');

  const contractIds = getContractIds();
  const expectedFiles = new Set();
  const allMissing = [];
  const allDifferent = [];

  // Process each contract
  for (const id of contractIds) {
    const contractFiles = fs
      .readdirSync(CONTRACTS_DIR)
      .filter((f) => f.startsWith(`${id}-`) && f.endsWith('.md'));

    for (const contractFile of contractFiles) {
      try {
        const fixtures = processContractFile(path.join(CONTRACTS_DIR, contractFile), id);

        if (checkMode) {
          // Check for missing/different fixtures
          if (fixtures.request) {
            const requestPath = path.join(FIXTURES_DIR, `${id}.request.json`);
            expectedFiles.add(`${id}.request.json`);
            if (fs.existsSync(requestPath)) {
              const existing = JSON.parse(fs.readFileSync(requestPath, 'utf8'));
              const expected = JSON.parse(fixtures.request);
              if (!isDeepEqual(existing, expected)) {
                allDifferent.push(`${id}.request.json`);
              }
            } else {
              allMissing.push(`${id}.request.json`);
            }
          }

          if (fixtures.response) {
            const responsePath = path.join(FIXTURES_DIR, `${id}.response.json`);
            expectedFiles.add(`${id}.response.json`);
            if (fs.existsSync(responsePath)) {
              const existing = JSON.parse(fs.readFileSync(responsePath, 'utf8'));
              const expected = JSON.parse(fixtures.response);
              if (!isDeepEqual(existing, expected)) {
                allDifferent.push(`${id}.response.json`);
              }
            } else {
              allMissing.push(`${id}.response.json`);
            }
          }
        } else {
          writeFixtures(id, fixtures);
        }
      } catch (e) {
        process.stderr.write(`Error processing ${contractFile}: ${e.message}\n`);
        process.exitCode = 1;
      }
    }
  }

  if (checkMode) {
    // Check for extra files
    if (fs.existsSync(FIXTURES_DIR)) {
      const actualFiles = fs.readdirSync(FIXTURES_DIR);
      const extra = actualFiles.filter((f) => !expectedFiles.has(f));
      if (extra.length > 0) {
        for (const f of extra) {
          console.error(`FAIL unexpected fixture ${f}`);
        }
        process.exit(1);
      }
    }

    if (allMissing.length > 0) {
      for (const f of allMissing) {
        console.error(`FAIL missing ${f}`);
      }
      process.exit(1);
    }

    if (allDifferent.length > 0) {
      for (const f of allDifferent) {
        console.error(`FAIL ${f} differs`);
      }
      process.exit(1);
    }

    console.log(`All ${expectedFiles.size} fixtures match expected content`);
  }
}

main();
