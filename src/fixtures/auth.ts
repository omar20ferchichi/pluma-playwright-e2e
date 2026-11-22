import { test as base, expect, Page } from "@playwright/test";
import fs from "fs";
import path from "path";
import { config } from "../configuration/config";
import { LoggedInState, restoreSessionStorage, saveLoggedInState } from "../configuration/login";
import { endTestLog, logger, startTestLog, testCaseFileBase } from "../configuration/logger";
import { reportPath } from "../configuration/reportRun";

type TestFixtures = {
  /** Automatic: gives every test case its own reports/<run>/logs/<spec>__<title>.log */
  testLog: void;
  /** A logged-in page in the test's own browser context, so each test gets its own trace. */
  loggedInPage: Page;
};

type WorkerFixtures = {
  /** The saved session. Login happens once per worker, and only if a test needs it. */
  authState: LoggedInState;
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

  authState: [
    async ({ browser }, use, workerInfo) => {
      const file = reportPath(".auth", `worker-${workerInfo.workerIndex}.json`);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      await use(await saveLoggedInState(browser, file));
      fs.rmSync(file, { force: true }); // holds session tokens: don't leave it in the report
    },
    { scope: "worker" },
  ],

  // Every `page` starts logged in from the saved session. Playwright's own `page` fixture records
  // the trace, so each test gets its own. tests/auth resets this to a logged-out state.
  storageState: async ({ authState }, use) => {
    await use(authState.storageFile);
  },

  loggedInPage: async ({ page, authState }, use) => {
    await restoreSessionStorage(page, authState);
    await page.goto(config.auth.homePath);
    if (/\/login\b/.test(new URL(page.url()).pathname)) {
      throw new Error(`The saved session was not accepted: ${page.url()} is the login page`);
    }
    logger.info(`Session restored, on ${new URL(page.url()).pathname}`);
    await use(page);
  },
});

export { expect };
