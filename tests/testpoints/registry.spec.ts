import { expect, test } from "../../src/fixtures/auth";
import { allInventoryTestPoints, inventorySuites } from "./suites";

test.describe("TestPoint registry (no login)", () => {
  test("every page exposes an inspect suite", () => {
    const suites = inventorySuites();
    expect(suites.length).toBeGreaterThan(0);

    for (const suite of suites) {
      expect(suite.path, "page is missing a path").toMatch(/^\//);
      expect(suite.key, `${suite.path} key`).toMatch(/^[A-Z_]+$/);

      const [open, ...controls] = suite.testpoints;
      expect(open.id, `${suite.path} first TestPoint should open the page`).toBe(`TP-OPEN-${suite.key}`);
      expect(open.description).toContain(suite.path);
      expect(controls.length, `${suite.path} has no control TestPoints`).toBeGreaterThan(0);

      controls.forEach((point, i) => {
        expect(point.id).toBe(`TP-BTN-${suite.key}-${String(i + 1).padStart(2, "0")}`);
        expect(point.description.trim(), `${point.id} has an empty description`).not.toBe("");
        expect(typeof point.func, `${point.id} has no run function`).toBe("function");
      });
    }
  });

  test("page keys and paths are unique", () => {
    const suites = inventorySuites();
    expect(new Set(suites.map((s) => s.key)).size).toBe(suites.length);
    expect(new Set(suites.map((s) => s.path)).size).toBe(suites.length);
  });

  test("TestPoint IDs are unique across every page", () => {
    const ids = allInventoryTestPoints().map((p) => p.id);
    const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect(duplicates).toEqual([]);
  });
});
