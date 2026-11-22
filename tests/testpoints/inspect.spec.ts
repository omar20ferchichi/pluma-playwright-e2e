import { test } from "../../src/fixtures/auth";
import { runTestPoints } from "../runTestPoints";
import { inventorySuites } from "./suites";

// Live health check: open each page and check every control is visible. Nothing is clicked.
test.describe("Inspect every page", () => {
  for (const suite of inventorySuites()) {
    test(`${suite.key} ${suite.path}`, async ({ loggedInPage }) => {
      await runTestPoints(loggedInPage, suite.testpoints);
    });
  }
});
