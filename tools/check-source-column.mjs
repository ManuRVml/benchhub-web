/**
 * check-source-column.mjs — Validate mock-data-catalog.md source columns
 *
 * Usage: node tools/check-source-column.mjs <path-to-mock-data-catalog.md>
 *
 * Validates:
 * - Every table has a "Source" column (case-insensitive)
 * - No Source cell is empty (ignoring whitespace-only entries)
 * - All source entries follow the pattern: file:line or file:lines (e.g., "02-prototype-html.md:512", "02-prototype-html.md:199-201")
 *
 * Exit code 0 if all checks pass; 1 otherwise.
 */

import { readFileSync } from 'node:fs';
import { argv } from 'node:process';

const USAGE = `Usage: node tools/check-source-column.mjs <path-to-mock-data-catalog.md>`;

if (argv.length < 3) {
  console.error(USAGE);
  process.exit(1);
}

const filePath = argv[2];

let markdown;
try {
  markdown = readFileSync(filePath, 'utf8');
} catch (err) {
  console.error(`Error reading file: ${err.message}`);
  process.exit(1);
}

const lines = markdown.split('\n');

let tables = [];
let currentTable = null;
let tableStartLine = 0;
let sourceColumnIndex = -1; // -1 means no Source column found
const tablesWithMissingSource = [];
const tablesWithEmptySource = [];
const totalRows = [];

// Helper: check if a line is the markdown table separator (---|---|---)
function isTableSeparator(line) {
  const trimmed = line.trim();
  return trimmed.startsWith('|') && trimmed.includes('|---');
}

// Helper: check if source value is valid (non-empty and contains valid source reference)
function isValidSource(value) {
  const trimmed = value.trim();
  if (trimmed.length === 0) return false;

  // Remove backticks
  const clean = trimmed.replace(/^`|`$/g, '').trim();

  // Pattern: file:line or file:lines (e.g., "02-prototype-html.md:512", "02-prototype-html.md:199-201")
  const pattern = /^[a-zA-Z0-9_-]+\.md:(\d+(-\d+)?|\d+,\d+)/;
  return pattern.test(clean);
}

// Helper: find the Source column index from header parts
function findSourceColumnIndex(parts) {
  for (let i = 0; i < parts.length; i++) {
    const colName = parts[i].trim().toLowerCase();
    if (colName === 'source' || colName === 'fuente' || colName === 'origen') {
      return i;
    }
  }
  return -1;
}

// Process lines with lookahead to detect table headers
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();

  // Check if current line is a potential table header (starts with | and has columns)
  if (trimmed.startsWith('|') && !trimmed.includes('|---')) {
    // Look ahead to see if the next non-empty line is a separator
    let nextNonEmptyLineIdx = i + 1;
    while (nextNonEmptyLineIdx < lines.length && lines[nextNonEmptyLineIdx].trim().length === 0) {
      nextNonEmptyLineIdx++;
    }

    if (nextNonEmptyLineIdx < lines.length && isTableSeparator(lines[nextNonEmptyLineIdx])) {
      // This is a table header - close current table if any and start new one
      if (currentTable) {
        tables.push(currentTable);
        if (sourceColumnIndex === -1) {
          tablesWithMissingSource.push({ startLine: tableStartLine });
        }
        totalRows.push(currentTable.rows.length);
      }

      // Parse header to find Source column index
      const headerParts = line.split('|');
      sourceColumnIndex = findSourceColumnIndex(headerParts);

      currentTable = {
        header: line,
        headerLine: i + 1,
        rows: [],
      };
      tableStartLine = i + 1;
      i = nextNonEmptyLineIdx; // Skip to after the separator
      continue;
    }
  }

  // If we have an open table and this line starts with |, it's a data row
  if (currentTable && trimmed.startsWith('|')) {
    if (sourceColumnIndex !== -1) {
      // Extract source value from the correct column index
      const parts = line.split('|');
      let sourceValue;

      if (sourceColumnIndex >= parts.length - 1 || sourceColumnIndex < 0) {
        // Invalid index, skip
        currentTable.rows.push(line);
        continue;
      }

      sourceValue = parts[sourceColumnIndex].trim();

      if (!isValidSource(sourceValue)) {
        tablesWithEmptySource.push({
          tableStart: tableStartLine,
          rowLine: i + 1,
          value: sourceValue,
        });
      }
    }
    currentTable.rows.push(line);
  }
}

// Close any remaining table at end of file
if (currentTable) {
  tables.push(currentTable);
  if (sourceColumnIndex === -1) {
    tablesWithMissingSource.push({ startLine: tableStartLine });
  }
  totalRows.push(currentTable.rows.length);
}

// Print summary
console.log('=== Mock Data Catalog Source Column Validation ===\n');
console.log(`File: ${filePath}\n`);
console.log('Summary:');
console.log(`  Tables detected: ${tables.length}`);
console.log(`  Total rows: ${totalRows.reduce((a, b) => a + b, 0)}\n`);

if (tablesWithMissingSource.length > 0) {
  console.log('❌ Tables missing "Source" column:');
  tablesWithMissingSource.forEach(({ startLine }) => {
    console.log(`  - Table starting at line ${startLine}`);
  });
}

if (tablesWithEmptySource.length > 0) {
  console.log('❌ Rows with empty/invalid Source values:');
  tablesWithEmptySource.forEach(({ tableStart, rowLine, value }) => {
    const displayValue = value.length > 50 ? value.substring(0, 47) + '...' : value;
    console.log(`  - Line ${rowLine} (table starts at ${tableStart}): "${displayValue}"`);
  });
}

const hasErrors = tablesWithMissingSource.length > 0 || tablesWithEmptySource.length > 0;

if (hasErrors) {
  console.log('\n❌ Validation failed. See above for details.');
  process.exit(1);
} else {
  console.log('✅ Validation passed: all tables have non-empty Source columns with valid format.');
  process.exit(0);
}
