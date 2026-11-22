/**
 * Generate tests/scenarios/<ID>.spec.ts from docs/test_scenarios/pluma_test_scenarios.csv.
 * Run: npm run scenarios:generate
 * Fails if a row names a TestPoint class that src/catalog.ts does not export, or if the ID in the
 * CSV does not match the ID the class really produces.
 */
import fs from "fs";
import path from "path";
import * as catalog from "../src/catalog";
import { TestPoint } from "../src/testpoint/TestPoint";
import { loadScenarios, renderSpec } from "../tests/scenarios/catalog";

const outDir = path.resolve(__dirname, "../tests/scenarios");
const exported = catalog as unknown as Record<string, unknown>;
const problems: string[] = [];

const scenarios = loadScenarios();
for (const scenario of scenarios) {
  for (const step of scenario.steps) {
    const Cls = exported[step.testpointClass] as (new (...args: string[]) => TestPoint) | undefined;
    if (typeof Cls !== "function") {
      problems.push(`${scenario.id} step ${step.step}: unknown TestPoint class ${step.testpointClass}`);
      continue;
    }
    const id = new Cls(...step.args).id;
    if (id !== step.testpointId) {
      problems.push(`${scenario.id} step ${step.step}: CSV says ${step.testpointId} but ${step.testpointClass} has ${id}`);
    }
  }
}
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}

// Remove specs whose scenario is gone, then write the current ones.
const wanted = new Set(scenarios.map((s) => `${s.id}.spec.ts`));
for (const file of fs.readdirSync(outDir)) {
  if (file.endsWith(".spec.ts") && !wanted.has(file)) fs.rmSync(path.join(outDir, file));
}
for (const scenario of scenarios) {
  fs.writeFileSync(path.join(outDir, `${scenario.id}.spec.ts`), renderSpec(scenario));
}
console.log(`Wrote ${scenarios.length} scenario specs to tests/scenarios/`);
