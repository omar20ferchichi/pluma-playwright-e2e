import { expect, Locator, Page } from "@playwright/test";
import { pathMatches } from "../pages/BasePage";
import { TestPoint } from "../testpoint/TestPoint";

type SidebarEntry = { section: SidebarSection | null; path: string | RegExp };
export type SidebarSection = "WORKSPACE" | "SEO & GEO" | "LIBRARY";

/** Sidebar links (shared layout of every /app/* and /settings page) and where each one lands. */
export const SIDEBAR_LINKS = {
  Dashboard: { section: null, path: "/app/dashboard" },
  "Article Generator": { section: "WORKSPACE", path: "/app/documents" },
  "Brand Voice": { section: "WORKSPACE", path: "/app/brand-voice" },
  "Topical Map": { section: "WORKSPACE", path: "/app/tools/topical_map" },
  Calendar: { section: "WORKSPACE", path: "/app/calendar" },
  "LLM Brand Ranking": { section: "WORKSPACE", path: "/app/llm-rank" },
  "Pluma Art": { section: "WORKSPACE", path: "/app/pluma-Art" },
  "Pluma Humanize": { section: "WORKSPACE", path: "/app/pluma-humanize" },
  "Link Network": { section: "SEO & GEO", path: "/app/interlink" },
  "Backlinks Analytics": { section: "SEO & GEO", path: "/app/backlinks-analytics" },
  "Keyword Intelligence": { section: "SEO & GEO", path: "/app/tools/keyword_intelligence" },
  Templates: { section: "LIBRARY", path: "/app/templates" },
  Settings: { section: null, path: /^\/settings/ },
  Rewards: { section: null, path: "/app/rewards" },
} satisfies Record<string, SidebarEntry>;
export type SidebarLink = keyof typeof SIDEBAR_LINKS;

/** Shared sidebar + header component. */
export class Sidebar {
  readonly logo: Locator;
  /** ⚠ no label: "Main Workspace" switcher. Ask devs for a test id. */
  readonly workspaceSwitcher: Locator;
  /** ⚠ no label: user/profile button at the bottom of the sidebar. */
  readonly userButton: Locator;
  readonly upgradeNow: Locator;

  constructor(private readonly page: Page) {
    this.logo = page.getByRole("link", { name: "BETA" });
    this.workspaceSwitcher = page.locator("button").nth(2);
    this.userButton = page.locator("button").nth(6);
    this.upgradeNow = page.getByRole("button", { name: "Upgrade Now" });
  }

  link(name: SidebarLink): Locator {
    return this.page.getByRole("link", { name, exact: true }).first();
  }

  section(name: SidebarSection): Locator {
    return this.page.getByRole("button", { name, exact: true }).first();
  }

  /**
   * Make a sidebar link visible: wait for it first, and only click the section header if it is
   * really collapsed. (Checking isVisible() right after a navigation can see the sidebar mid-render;
   * clicking the header then collapses an open section.)
   */
  async reveal(name: SidebarLink): Promise<Locator> {
    const entry: SidebarEntry = SIDEBAR_LINKS[name];
    const link = this.link(name);
    await this.logo.waitFor({ state: "visible" });
    const shown = await link
      .waitFor({ state: "visible", timeout: 3_000 })
      .then(() => true)
      .catch(() => false);
    if (!shown && entry.section) {
      await this.section(entry.section).click();
      await link.waitFor({ state: "visible" });
    }
    return link;
  }

  /** Click a sidebar link, opening its collapsible section first if needed. */
  async goTo(name: SidebarLink): Promise<void> {
    const entry: SidebarEntry = SIDEBAR_LINKS[name];
    await (await this.reveal(name)).click();
    await expect(this.page).toHaveURL((url) => pathMatches(url, entry.path));
  }
}

// ---- TestPoints -------------------------------------------------------------

export class NavigateBySidebar extends TestPoint {
  constructor(name: SidebarLink) {
    super("TP-NAV-SIDEBAR", `Click "${name}" in the sidebar and land on ${String(SIDEBAR_LINKS[name].path)}`, async (page) => {
      await new Sidebar(page).goTo(name);
    });
  }
}

export class NavigateByUrl extends TestPoint {
  constructor(path: string) {
    super("TP-NAV-URL", `Go to ${path} by URL`, async (page) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expect(page).toHaveURL((url) => pathMatches(url, path));
    });
  }
}

export class SidebarAssertLinksVisible extends TestPoint {
  constructor() {
    super("TP-NAV-SIDEBAR-LINKS", "Every sidebar link is reachable (opening sections when needed)", async (page) => {
      const sidebar = new Sidebar(page);
      for (const name of Object.keys(SIDEBAR_LINKS) as SidebarLink[]) {
        await expect(await sidebar.reveal(name), `sidebar link ${name}`).toBeVisible();
      }
    });
  }
}

export class SidebarOpenWorkspaceMenu extends TestPoint {
  constructor() {
    super("TP-NAV-WORKSPACE-MENU", 'Open the workspace switcher and see "Create a workspace"', async (page) => {
      await new Sidebar(page).workspaceSwitcher.click();
      await expect(page.getByRole("menu")).toBeVisible();
      await expect(page.getByRole("button", { name: "Create a workspace" })).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(page.getByRole("menu")).toBeHidden();
    });
  }
}

export class SidebarOpenUserMenu extends TestPoint {
  constructor() {
    super("TP-NAV-USER-MENU", "Open the user menu and see Dark mode and Logout (nothing clicked)", async (page) => {
      await new Sidebar(page).userButton.click();
      await expect(page.getByRole("menuitem", { name: "Dark mode" })).toBeVisible();
      await expect(page.getByRole("menuitem", { name: "Logout" })).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(page.getByRole("menuitem", { name: "Logout" })).toBeHidden();
    });
  }
}
