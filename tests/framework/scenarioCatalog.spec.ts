import fs from "fs";
import path from "path";
import { expect, test } from "../../src/fixtures/auth";
import * as catalog from "../../src/catalog";
import { TestPoint } from "../../src/testpoint/TestPoint";
import { loadScenarios, parseCsv, renderSpec } from "../scenarios/catalog";

const exported = catalog as unknown as Record<string, unknown>;

test.describe("Scenario catalog (no login)", () => {
  test("CSV parser handles quotes, commas and doubled quotes", () => {
    expect(parseCsv('a,b\n"x, y","say ""hi"""\n')).toEqual([
      ["a", "b"],
      ["x, y", 'say "hi"'],
    ]);
  });

  test("every CSV step names an exported TestPoint class with the right ID", () => {
    const problems: string[] = [];
    for (const scenario of loadScenarios()) {
      for (const step of scenario.steps) {
        const Cls = exported[step.testpointClass] as (new (...args: string[]) => TestPoint) | undefined;
        if (typeof Cls !== "function") {
          problems.push(`${scenario.id}#${step.step} unknown class ${step.testpointClass}`);
          continue;
        }
        const point = new Cls(...step.args);
        if (!(point instanceof TestPoint)) problems.push(`${scenario.id}#${step.step} ${step.testpointClass} is not a TestPoint`);
        if (point.id !== step.testpointId) problems.push(`${scenario.id}#${step.step} CSV ${step.testpointId} ≠ class ${point.id}`);
      }
    }
    expect(problems).toEqual([]);
  });

  test("step numbers are 1..n in every scenario", () => {
    for (const scenario of loadScenarios()) {
      expect(scenario.steps.map((s) => s.step), scenario.id).toEqual(scenario.steps.map((_, i) => i + 1));
    }
  });

  test("generated specs are up to date (run npm run scenarios:generate)", () => {
    for (const scenario of loadScenarios()) {
      const file = path.resolve(__dirname, "../scenarios", `${scenario.id}.spec.ts`);
      expect(fs.existsSync(file), `${scenario.id}.spec.ts is missing`).toBe(true);
      expect(fs.readFileSync(file, "utf8"), `${scenario.id}.spec.ts is stale`).toBe(renderSpec(scenario));
    }
  });
});
