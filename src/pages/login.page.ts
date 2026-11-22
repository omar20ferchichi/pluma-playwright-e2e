import { expect, Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { TestPoint } from "../testpoint/TestPoint";
import { actionId, OpenPage } from "../testpoint/pageTestPoints";
import { config } from "../configuration/config";

/** /login. Used by the login helper and tests/auth; not in the logged-in inventory. */
export class LoginPage extends BasePage {
  static readonly path = "/login";
  static readonly key = "LOGIN";

  readonly email: Locator;
  readonly password: Locator;
  readonly signIn: Locator;
  readonly forgotPassword: Locator;
  readonly signUp: Locator;

  constructor(page: Page) {
    super(page, LoginPage.path);
    this.email = page.locator('input[name="email"]');
    this.password = page.locator('input[name="password"]');
    this.signIn = this.button("Sign in");
    this.forgotPassword = this.button("Forgot password");
    this.signUp = this.link("Sign up");
  }

  async login(email: string, password: string): Promise<void> {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.signIn.click();
  }
}

const K = LoginPage.key;

export class OpenLoginPage extends OpenPage {
  constructor() {
    super(LoginPage);
  }
}

export class LoginAssertFormVisible extends TestPoint {
  constructor() {
    super(actionId(K, 1), "Login form shows email, password, Sign in, Forgot password and Sign up", async (page) => {
      const pom = new LoginPage(page);
      for (const [label, locator] of [
        ["email", pom.email],
        ["password", pom.password],
        ["Sign in", pom.signIn],
        ["Forgot password", pom.forgotPassword],
        ["Sign up", pom.signUp],
      ] as const) {
        await pom.expectVisible(locator, `login ${label}`);
      }
    });
  }
}

export class LoginWithCredentials extends TestPoint {
  constructor(email = config.auth.email, password = config.auth.password) {
    super(actionId(K, 2), "Fill email and password, then click Sign in", async (page) => {
      await new LoginPage(page).login(email, password);
    });
  }
}

export class LoginAssertLoggedIn extends TestPoint {
  constructor() {
    super(actionId(K, 3), `Land on an /app page after sign-in`, async (page) => {
      await expect(page).toHaveURL(/\/app\//, { timeout: 30_000 });
    });
  }
}

export class LoginAssertRejected extends TestPoint {
  constructor() {
    super(actionId(K, 4), "Stay on /login after wrong credentials", async (page) => {
      const pom = new LoginPage(page);
      // Give the app time to answer, then check it did not let us in.
      await page.waitForLoadState("networkidle").catch(() => undefined);
      await pom.expectOnPage();
      await pom.expectVisible(pom.signIn, "Sign in still shown");
    });
  }
}
