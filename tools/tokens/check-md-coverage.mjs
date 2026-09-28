import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Paths are resolved from the repository root (they were absolute paths of one machine / worktree before P1-26b).
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const jsonPath = path.join(repoRoot, 'docs', 'design', 'design-tokens.json');
const mdPath = path.join(repoRoot, 'docs', 'design', 'design-tokens.md');

// Read JSON and extract all token paths
const json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

function getAllPaths(obj, prefix = '', paths = []) {
  for (const [key, val] of Object.entries(obj)) {
    if (key.startsWith('$')) continue;
    const path = prefix ? prefix + '.' + key : key;
    if (val.$value !== undefined || val.$type !== undefined) {
      paths.push(path);
    }
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      getAllPaths(val, path, paths);
    }
  }
  return paths;
}

const tokenPaths = getAllPaths(json);

// Read markdown and check each path is mentioned
const mdContent = fs.readFileSync(mdPath, 'utf8');

const missing = [];
for (const path of tokenPaths) {
  // Check for literal text match (path as-is or with backticks)
  const regex = new RegExp(
    '(?:^|[^a-zA-Z0-9_.])' + path.replace(/\./g, '\\.') + '(?:$|[^a-zA-Z0-9_.])',
    'm',
  );
  if (!regex.test(mdContent)) {
    missing.push(path);
  }
}

if (missing.length > 0) {
  console.log('Missing token paths in design-tokens.md:');
  for (const m of missing) console.log('  ' + m);
  console.log('');
  console.log('Total paths: ' + tokenPaths.length);
  console.log('Missing: ' + missing.length);
  process.exit(1);
} else {
  console.log('All ' + tokenPaths.length + ' token paths are mentioned in design-tokens.md');
  process.exit(0);
}
