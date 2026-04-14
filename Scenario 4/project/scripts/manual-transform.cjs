/**
 * Manual runner: load Scenario 4 JSON fixtures and call transformOrder from dist/.
 * Run from project/: npm run manual
 */

const fs = require('fs');
const path = require('path');
const { transformOrder, ValidationError } = require('../dist/index.js');

const scenarioDir = path.join(__dirname, '..', '..');

function parseArgs(argv) {
  let nameFilter = '';
  let includeEdges = false;
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--edges') includeEdges = true;
    else if (a === '--name' && argv[i + 1]) {
      nameFilter = argv[++i];
    }
  }
  return { nameFilter, includeEdges };
}

function matches(label, filter) {
  if (!filter) return true;
  return label.toLowerCase().includes(filter.toLowerCase());
}

function readJson(relPath) {
  const p = path.join(scenarioDir, relPath);
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function printBlock(title, body) {
  console.log('\n' + '='.repeat(72));
  console.log(title);
  console.log('='.repeat(72));
  console.log(body);
}

const { nameFilter, includeEdges } = parseArgs(process.argv);

const samples = readJson('scenario_4_sample_orders.json');
for (const entry of samples.sample_orders) {
  if (!entry.order) continue;
  if (!matches(entry.name || '', nameFilter)) continue;
  try {
    const out = transformOrder(entry.order);
    printBlock(`SAMPLE: ${entry.name}`, JSON.stringify(out, null, 2));
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    printBlock(`SAMPLE (error): ${entry.name}`, msg);
    if (!(e instanceof ValidationError)) console.error(e);
  }
}

if (includeEdges) {
  const edges = readJson('scenario_4_edge_cases.json');
  for (const entry of edges.edge_cases) {
    const label = entry.case_name || '';
    if (!entry.order) continue;
    if (!matches(label, nameFilter)) continue;
    try {
      const out = transformOrder(entry.order);
      printBlock(`EDGE (unexpected success): ${label}`, JSON.stringify(out, null, 2));
    } catch (e) {
      const kind = e instanceof ValidationError ? 'ValidationError' : e instanceof Error ? e.name : 'Error';
      const msg = e instanceof Error ? e.message : String(e);
      printBlock(`EDGE: ${label} [${kind}]`, msg);
      if (!(e instanceof ValidationError)) console.error(e);
    }
  }
}
