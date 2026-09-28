/**
 * print-kvi.mjs — KVI oracle recomputation script
 *
 * Usage: node tools/oracles/print-kvi.mjs
 *
 * Reads docs/design/oracles/kvi.json and recomputes:
 * - categoryCompliance = Σ(min(compliancePct,100)·weightPct)/Σ weightPct per category
 * - global = Σ(categoryCompliance·categoryWeightPct/100)
 * - reto = same structure over retoPct WITHOUT the 100 cap
 * - uncapped = Σ(compliancePct·weightPct)/100 over all weighted rows
 *
 * Prints 4 category values and 3 totals to 2 decimals, compares to expected block
 * (tolerance 0.01), exits 1 on any mismatch.
 */

import { readFileSync } from 'node:fs';

// Read the KVI JSON oracle file
const jsonPath = 'docs/design/oracles/kvi.json';
let data;
try {
  const content = readFileSync(jsonPath, 'utf8');
  data = JSON.parse(content);
} catch (err) {
  console.error(`Error reading ${jsonPath}: ${err.message}`);
  process.exit(1);
}

const { rows, expected } = data;

// Filter rows with valid weights (weightPct !== null)
const weightedRows = rows.filter((r) => r.weightPct !== null);

// Helper: compute weighted average per category for a given metric
function computeCategoryCompliance(metric) {
  // Group by category
  const byCategory = {};
  for (const row of weightedRows) {
    const cat = row.category;
    if (!byCategory[cat]) {
      byCategory[cat] = { sumWeighted: 0, sumWeights: 0, categoryWeightPct: row.categoryWeightPct };
    }
    // Apply min(100, metric) for compliance, raw for reto
    const cappedValue = metric === 'compliancePct' ? Math.min(row[metric], 100) : row[metric];
    byCategory[cat].sumWeighted += cappedValue * row.weightPct;
    byCategory[cat].sumWeights += row.weightPct;
  }

  // Compute per-category average
  const result = {};
  for (const [cat, data] of Object.entries(byCategory)) {
    if (data.sumWeights > 0) {
      result[cat] = data.sumWeighted / data.sumWeights;
    } else {
      result[cat] = 0;
    }
  }
  return result;
}

// Helper: compute global from category averages weighted by category weights
function computeGlobal(categoryCompliance) {
  let globalSum = 0;
  let weightSum = 0;
  for (const row of weightedRows) {
    const cat = row.category;
    if (row.categoryWeightPct !== null) {
      globalSum += categoryCompliance[cat] * row.categoryWeightPct;
      weightSum += row.categoryWeightPct;
    }
  }
  return weightSum > 0 ? globalSum / weightSum : 0;
}

// Helper: compute uncapped weighted average over all weighted rows
function computeUncapped() {
  let sumWeighted = 0;
  let weightSum = 0;
  for (const row of weightedRows) {
    sumWeighted += row.compliancePct * row.weightPct;
    weightSum += row.weightPct;
  }
  return weightSum > 0 ? sumWeighted / weightSum : 0;
}

// Helper: format number to 2 decimals
function fmt2(n) {
  return Number(n.toFixed(2));
}

// Compute results
const categoryCompliance = computeCategoryCompliance('compliancePct');
const categoryReto = computeCategoryCompliance('retoPct');
const global = fmt2(computeGlobal(categoryCompliance));
const reto = fmt2(computeGlobal(categoryReto));
const uncapped = fmt2(computeUncapped());

// Print category values (Financiero, Mercado, Estratégico, Grupos de Interés)
const categories = ['Financiero', 'Mercado', 'Estratégico', 'Grupos de Interés'];
for (const cat of categories) {
  const val = categoryCompliance[cat] ?? 0;
  console.log(`${cat} ${fmt2(val)}`);
}

// Print totals
console.log(`global ${global}`);
console.log(`reto ${reto}`);
console.log(`uncapped ${uncapped}`);

// Compare to expected (tolerance 0.01)
const tolerance = 0.01;
let exitCode = 0;

// Check categories
for (const cat of categories) {
  const expectedVal = expected.categories[cat];
  const actualVal = categoryCompliance[cat] ?? 0;
  if (Math.abs(actualVal - expectedVal) > tolerance) {
    console.error(`❌ Mismatch ${cat}: expected ${expectedVal}, got ${fmt2(actualVal)}`);
    exitCode = 1;
  }
}

// Check global
if (Math.abs(global - expected.global) > tolerance) {
  console.error(`❌ Mismatch global: expected ${expected.global}, got ${global}`);
  exitCode = 1;
}

// Check reto
if (Math.abs(reto - expected.reto) > tolerance) {
  console.error(`❌ Mismatch reto: expected ${expected.reto}, got ${reto}`);
  exitCode = 1;
}

// Check uncapped
if (Math.abs(uncapped - expected.uncapped) > tolerance) {
  console.error(`❌ Mismatch uncapped: expected ${expected.uncapped}, got ${uncapped}`);
  exitCode = 1;
}

if (exitCode === 0) {
  console.log('✅ All values match expected (tolerance 0.01)');
}

process.exit(exitCode);
