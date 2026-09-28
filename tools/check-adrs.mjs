import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const adrsDir = path.join(__dirname, '..', 'docs', 'architecture', 'adr');

const requiredHeadings = ['Status', 'Context', 'Decision', 'Consequences'];
const ADR_FILE = /^\d{4}-.*\.md$/;

function hasRequiredHeadings(content) {
  const lines = content.split('\n');
  const headings = new Set();
  for (const line of lines) {
    if (line.startsWith('## ')) {
      headings.add(line.substring(3).trim());
    }
  }
  return requiredHeadings.every((h) => headings.has(h));
}

function hasSourceCitation(content) {
  // Check for path+line citations in the Sources: line or elsewhere
  const sourcePattern = /Sources:.*(?:\.plan|prompt_Start_Eco\.md).*L\d+/i;
  return sourcePattern.test(content);
}

function checkADR(filename) {
  const filepath = path.join(adrsDir, filename);
  const content = fs.readFileSync(filepath, 'utf8');

  const headingsOk = hasRequiredHeadings(content);
  const sourcesOk = hasSourceCitation(content);

  return {
    file: filename,
    headingsOk,
    sourcesOk,
  };
}

function checkREADME() {
  const readmePath = path.join(adrsDir, 'README.md');
  const readmeContent = fs.readFileSync(readmePath, 'utf8');

  // Find all ADR files (NNNN-*.md, any number)
  const adrFiles = fs.readdirSync(adrsDir).filter((f) => ADR_FILE.test(f));

  let readmeOk = true;
  for (const file of adrFiles) {
    // Extract the ID from the filename (e.g., 0001 from 0001-source-precedence.md)
    const id = file.substring(0, 4);
    // Check if README.md contains a link to this ID
    const linkPattern = new RegExp(`\\[${id}\\]\\(${file}\\)`);
    if (!linkPattern.test(readmeContent)) {
      console.log(`README.md missing link for ${file}`);
      readmeOk = false;
    }
  }

  return readmeOk;
}

function main() {
  // ADR-0001 predates the template; every later ADR must have the headings and source citations.
  const files = fs
    .readdirSync(adrsDir)
    .filter((f) => ADR_FILE.test(f) && Number(f.slice(0, 4)) >= 2)
    .sort();

  let allPassed = true;

  for (const file of files) {
    const result = checkADR(file);
    if (!result.headingsOk || !result.sourcesOk) {
      allPassed = false;
      console.log(`${file}:`);
      if (!result.headingsOk)
        console.log(`  Missing required headings: ${requiredHeadings.join(', ')}`);
      if (!result.sourcesOk) console.log(`  Missing source citations`);
    }
  }

  const readmeOk = checkREADME();
  if (!readmeOk) {
    allPassed = false;
  }

  if (allPassed) {
    console.log(
      `All ADRs ${files[0]?.slice(0, 4) ?? '-'}-${files.at(-1)?.slice(0, 4) ?? '-'} have required headings and source citations`,
    );
    console.log('README.md lists all ADR files');
    process.exit(0);
  } else {
    console.log('Validation failed');
    process.exit(1);
  }
}

main();
