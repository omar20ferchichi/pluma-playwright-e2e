import { Page, test } from "@playwright/test";
import { TestPoint, TestPointPhase } from "../src/testpoint/TestPoint";
import { recordTestPoints } from "../src/testpoint/testCaseReport";

export type RunOptions = {
  /**
   * TestPoints that always run after the main ones, even when one failed — used to delete the
   * data an E2E test created. A teardown failure fails the test only if the main steps passed.
   */
  teardown?: TestPoint[];
};

async function runPhase(page: Page, points: TestPoint[], phase: TestPointPhase): Promise<void> {
  const info = test.info();
  try {
    for (const point of points) {
      const title = `${phase === "teardown" ? "[teardown] " : ""}${point.id} ${point.description}`;
      await test.step(title, async () => {
        await point.run(page);
      });
    }
  } finally {
    const report = recordTestPoints(info, points, phase);
    await info.attach("testcase-report", { body: JSON.stringify(report, null, 2), contentType: "application/json" });
  }
}

/**
 * Run TestPoints in order; the first failure stops the main steps.
 * Each TestPoint shows as a step in the HTML report, and the test case's JSON report
 * (reports/<run>/testcases/*.json) is written even when a TestPoint fails.
 */
export async function runTestPoints(page: Page, points: TestPoint[], options: RunOptions = {}): Promise<void> {
  let mainError: unknown;
  try {
    await runPhase(page, points, "test");
  } catch (error) {
    mainError = error;
  }
  if (options.teardown?.length) {
    try {
      await runPhase(page, options.teardown, "teardown");
    } catch (teardownError) {
      if (!mainError) throw teardownError;
    }
  }
  if (mainError) throw mainError;
}
