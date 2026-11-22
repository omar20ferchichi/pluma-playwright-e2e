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

/** A saved login: Playwright's storage state file plus the app's sessionStorage (Pluma keeps its token there). */
export type LoggedInState = { storageFile: string; sessionStorage: Record<string, string> };

/**
 * Log in once in a context that is not recorded, and save the session to `file`.
 * Tests then open their own recorded context from it, so the password never appears in a trace or video.
 * Playwright's storageState() has cookies and localStorage but not sessionStorage, so that is saved separately.
 */
export async function saveLoggedInState(browser: Browser, file: string): Promise<LoggedInState> {
  const context = await browser.newContext({ baseURL: config.app.baseUrl, viewport: { width: 1920, height: 1080 } });
  try {
    const page = await context.newPage();
    await loginToPluma(page);
    await context.storageState({ path: file });
    const sessionStorage = await page.evaluate(() => Object.fromEntries(Object.entries(window.sessionStorage)));
    return { storageFile: file, sessionStorage };
  } finally {
    await context.close();
  }
}

/** Put the saved sessionStorage back before any page script runs (only on the app's own origin). */
export async function restoreSessionStorage(page: Page, state: LoggedInState): Promise<void> {
  await page.context().addInitScript(
    ({ origin, entries }) => {
      if (window.location.origin !== origin) return;
      for (const [key, value] of Object.entries(entries)) {
        if (window.sessionStorage.getItem(key) === null) window.sessionStorage.setItem(key, value);
      }
    },
    { origin: new URL(config.app.baseUrl).origin, entries: state.sessionStorage },
  );
}
