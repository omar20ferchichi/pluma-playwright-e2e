import { Browser, expect, Page } from "@playwright/test";
import { config } from "./config";
import { logger } from "./logger";
import { LoginPage } from "../pages/login.page";

export function assertCredentials(): void {
  if (!config.auth.email || !config.auth.password) {
    throw new Error("Set PLUMA_EMAIL and PLUMA_PASSWORD in .env before running UI tests");
  }
}

/** Sign in with the email/password form and wait for the app shell. */
export async function loginToPluma(page: Page): Promise<void> {
  assertCredentials();
  logger.info(`Logging in to ${config.app.baseUrl}${config.auth.loginPath}`);
  const login = new LoginPage(page);
  await login.goto();
  await login.login(config.auth.email, config.auth.password);
  await expect(page, "login should redirect into /app").toHaveURL(/\/app\//, { timeout: 30_000 });
  logger.info(`Logged in, landed on ${new URL(page.url()).pathname}`);
}

export async function createLoggedInPage(browser: Browser): Promise<Page> {
  const context = await browser.newContext({ baseURL: config.app.baseUrl, viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  await loginToPluma(page);
  return page;
}
