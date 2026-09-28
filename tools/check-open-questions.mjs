#!/usr/bin/env node
/**
 * Validation script for open-questions.md
 * Counts `| OQ-NN |` rows, exits 1 if any OQ number is skipped/duplicated
 * or any Default/Blocks/Owner cell is empty or '—'/'-', prints the count.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath =
  process.argv[2] || path.join(__dirname, '..', 'docs', 'design', 'open-questions.md');

let content;
try {
  content = fs.readFileSync(filePath, 'utf8');
} catch (err) {
  console.error(`Error reading file: ${err.message}`);
  process.exit(1);
}

// Extract all OQ-NN patterns
const oqPattern = /\| OQ-(\d{2}) \|/g;
const matches = [...content.matchAll(oqPattern)];
const numbers = matches.map((m) => parseInt(m[1], 10)).sort((a, b) => a - b);

// Check for duplicates
const uniqueNumbers = [...new Set(numbers)];
if (uniqueNumbers.length !== numbers.length) {
  console.error('Error: Duplicate OQ numbers found.');
  process.exit(1);
}

// Check for gaps
for (let i = 1; i <= numbers.length; i++) {
  if (numbers[i - 1] !== i) {
    console.error(
      `Error: Gap in OQ numbering at position ${i}, found OQ-${numbers[i - 1].toString().padStart(2, '0')}`,
    );
    process.exit(1);
  }
}

// Extract lines for Default, Blocks, and Owner columns
const lines = content.split('\n');
let defaultEmpty = false;
let blocksEmpty = false;
let ownerEmpty = false;

for (const line of lines) {
  if (line.trim().startsWith('| OQ-')) {
    // Split by | without filtering empty cells
    // Line format: | OQ-NN | Question | Default | Owner | Blocks |
    // parts[0] = empty, parts[1] = OQ-NN, parts[2] = Question, parts[3] = Default, parts[4] = Owner, parts[5] = Blocks
    const parts = line.split('|');

    if (parts.length >= 6) {
      const oqPart = parts[1].trim();
      const defaultValue = parts[3].trim();
      const ownerValue = parts[4].trim();
      const blocksValue = parts[5].trim();

      // Check Default
      if (!defaultValue || defaultValue === '-') {
        defaultEmpty = true;
        console.error(`Error: Empty Default cell for ${oqPart}`);
      }

      // Check Owner: must not be empty, '—', or '-'
      if (!ownerValue || ownerValue === '—' || ownerValue === '-' || ownerValue === '') {
        ownerEmpty = true;
        console.error(`Error: Empty or invalid Owner cell for ${oqPart}`);
      }

      // Check Blocks
      if (!blocksValue || blocksValue === '-') {
        blocksEmpty = true;
        console.error(`Error: Empty Blocks cell for ${oqPart}`);
      }
    }
  }
}

if (defaultEmpty || ownerEmpty || blocksEmpty) {
  process.exit(1);
}

console.log(numbers.length);
process.exit(0);
