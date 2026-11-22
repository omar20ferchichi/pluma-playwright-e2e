import { defineConfig, devices } from "@playwright/test";
import { config } from "./src/configuration/config";
import { reportPath } from "./src/configuration/reportRun";

export default defineConfig({
  testDir: "./tests",
  outputDir: reportPath("artifacts"),
  // One worker, run in order: the suite shares one logged-in session and one real account.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  timeout: 2 * 60 * 1000,
  expect: { timeout: 15_000 },
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: reportPath("html") }],
    ["json", { outputFile: reportPath("results.json") }],
    ["./src/configuration/plumaReporter.ts"],
  ],
  use: {
    baseURL: config.app.baseUrl,
    headless: config.app.headless,
    viewport: { width: 1920, height: 1080 },
    actionTimeout: 15_000,
    navigationTimeout: config.app.navigationTimeoutMs,
    launchOptions: { slowMo: config.app.slowMoMs },
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1920, height: 1080 } } }],
});
