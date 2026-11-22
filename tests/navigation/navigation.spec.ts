import { test } from "../../src/fixtures/auth";
import { runTestPoints } from "../runTestPoints";
import { NavigateBySidebar, SIDEBAR_LINKS, SidebarLink } from "../../src/navigation/sidebar";
import { OpenDashboardPage, PAGE_INVENTORY } from "../../src/pages";
import { OpenPage } from "../../src/testpoint/pageTestPoints";

test.describe("Navigation by URL", () => {
  for (const PageCls of PAGE_INVENTORY) {
    test(`${PageCls.path} opens by URL`, async ({ loggedInPage }) => {
      await runTestPoints(loggedInPage, [new OpenPage(PageCls)]);
    });
  }
});

test.describe("Navigation by sidebar", () => {
  for (const name of Object.keys(SIDEBAR_LINKS) as SidebarLink[]) {
    test(`sidebar "${name}"`, async ({ loggedInPage }) => {
      await runTestPoints(loggedInPage, [new OpenDashboardPage(), new NavigateBySidebar(name)]);
    });
  }
});
