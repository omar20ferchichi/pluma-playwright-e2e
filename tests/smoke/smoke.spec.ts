import { test } from "../../src/fixtures/auth";
import { runTestPoints } from "../runTestPoints";
import { SidebarAssertLinksVisible } from "../../src/navigation/sidebar";
import { DashboardPage, OpenDashboardPage, OpenDocumentsPage, OpenSettingsPage } from "../../src/pages";

test.describe("Smoke", () => {
  test("logged-in user reaches the dashboard and sees the sidebar", async ({ loggedInPage }) => {
    await runTestPoints(loggedInPage, [new OpenDashboardPage(), new SidebarAssertLinksVisible()]);
  });

  test("core pages load", async ({ loggedInPage }) => {
    await runTestPoints(loggedInPage, [new OpenDocumentsPage(), new OpenSettingsPage(), new OpenDashboardPage()]);
  });

  test("dashboard inspect suite", async ({ loggedInPage }) => {
    await runTestPoints(loggedInPage, DashboardPage.testPoints());
  });
});
