import { test as base, expect, Page } from "@playwright/test";
import path from "path";
import { createLoggedInPage } from "../configuration/login";
import { endTestLog, startTestLog, testCaseFileBase } from "../configuration/logger";

type TestFixtures = {
  /** Automatic: gives every test case its own reports/<run>/logs/<spec>__<title>.log */
  testLog: void;
};

type WorkerFixtures = {
  /** One logged-in page per worker, reused by every test of that worker (login happens once, only if a test uses it). */
  loggedInPage: Page;
};

/**
 * Every spec imports `test` from here (not from @playwright/test), so every test gets its log file.
 * A fixture is used instead of test.beforeEach: a hook in a shared module is only registered for the
 * first spec file that imports it.
 */
export const test = base.extend<TestFixtures, WorkerFixtures>({
  testLog: [
    async ({}, use, testInfo) => {
      const started = Date.now();
      startTestLog(
        testCaseFileBase(testInfo.file, testInfo.title, testInfo.retry),
        `Test case "${testInfo.titlePath.slice(1).join(" › ")}" (${path.relative(process.cwd(), testInfo.file)})`,
      );
      await use();
      const seconds = ((Date.now() - started) / 1000).toFixed(1);
      const status = testInfo.status === testInfo.expectedStatus ? testInfo.status : `${testInfo.status} (expected ${testInfo.expectedStatus})`;
      endTestLog(`Result: ${status ?? "unknown"} in ${seconds}s${testInfo.error?.message ? ` — ${testInfo.error.message.split("\n")[0]}` : ""}`);
    },
    { auto: true },
  ],
  loggedInPage: [
    async ({ browser }, use) => {
      const page = await createLoggedInPage(browser);
      await use(page);
      await page.context().close();
    },
    { scope: "worker" },
  ],
});

export { expect };
