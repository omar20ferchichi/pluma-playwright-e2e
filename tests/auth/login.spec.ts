import { test } from "../../src/fixtures/auth";
import { runTestPoints } from "../runTestPoints";
import { assertCredentials } from "../../src/configuration/login";
import {
  LoginAssertFormVisible,
  LoginAssertLoggedIn,
  LoginAssertRejected,
  LoginWithCredentials,
  OpenLoginPage,
} from "../../src/pages/login.page";

// Each test gets a fresh, logged-out browser context (no saved session).
// AUTH-03 types the real password, and a trace records typed values: no trace for these tests.
test.use({ storageState: { cookies: [], origins: [] }, trace: "off" });

test.describe("Login", () => {
  test("AUTH-01 login form is shown", async ({ page }) => {
    await runTestPoints(page, [new OpenLoginPage(), new LoginAssertFormVisible()]);
  });

  test("AUTH-02 wrong password is rejected", async ({ page }) => {
    await runTestPoints(page, [
      new OpenLoginPage(),
      new LoginWithCredentials("qa.no-such-user@example.com", "wrong-password-123"),
      new LoginAssertRejected(),
    ]);
  });

  test("AUTH-03 valid credentials sign in", async ({ page }) => {
    assertCredentials();
    await runTestPoints(page, [new OpenLoginPage(), new LoginWithCredentials(), new LoginAssertLoggedIn()]);
  });
});
