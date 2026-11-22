import { expect, Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { TestPoint } from "../testpoint/TestPoint";
import { actionId, inspectSuite, OpenPage } from "../testpoint/pageTestPoints";

/** Settings tabs and the URL each one opens. */
export const SETTINGS_TABS = {
  "Account profile": "/settings/account-profile",
  Settings: "/settings",
  Workspace: "/settings/workspace",
  Integrations: "/settings/integrations",
  Billing: "/settings/billing",
  "Help center": "/settings/help-center",
  Trash: "/settings/trash",
} as const;
export type SettingsTab = keyof typeof SETTINGS_TABS;

/** Shared by every /settings/* page: the tab strip. */
export class SettingsBasePage extends BasePage {
  settingsTab(name: SettingsTab): Locator {
    return this.tab(name);
  }
}

/** /settings — the "Settings" tab (theme, notifications, language). */
export class SettingsPage extends SettingsBasePage {
  static readonly path = "/settings";
  static readonly key = "SETTINGS";
  static testPoints(): TestPoint[] {
    return inspectSuite(SettingsPage, [
      ["Account profile tab", (p) => p.settingsTab("Account profile")],
      ["Workspace tab", (p) => p.settingsTab("Workspace")],
      ["Integrations tab", (p) => p.settingsTab("Integrations")],
      ["Billing tab", (p) => p.settingsTab("Billing")],
      ["Help center tab", (p) => p.settingsTab("Help center")],
      ["Trash tab", (p) => p.settingsTab("Trash")],
      ["Dark theme switch", (p) => p.darkTheme],
      ["Allow notifications switch", (p) => p.notifications],
      ["Language", (p) => p.language],
      ["Save changes", (p) => p.saveChanges],
    ]);
  }

  /** The id is "airplane-mode" but it controls the dark theme. Never toggled by the suite. */
  readonly darkTheme: Locator;
  readonly notifications: Locator;
  readonly language: Locator;
  /** Persists settings — inspect only, never click. */
  readonly saveChanges: Locator;

  constructor(page: Page) {
    super(page, SettingsPage.path);
    this.darkTheme = page.locator("#airplane-mode");
    this.notifications = page.locator("#notification");
    // The combobox has no accessible name; the current language is text inside it.
    this.language = page.getByRole("combobox").filter({ hasText: "English" });
    this.saveChanges = this.button("Save changes");
  }
}

export class AccountProfilePage extends SettingsBasePage {
  static readonly path = "/settings/account-profile";
  static readonly key = "ACCOUNT_PROFILE";
  static testPoints(): TestPoint[] {
    return inspectSuite(AccountProfilePage, [
      ["Full name", (p) => p.fullName],
      ["Phone number", (p) => p.phoneNumber],
      ["Change password", (p) => p.changePassword],
      ["Update photo", (p) => p.updatePhoto],
      ["Logout", (p) => p.logout],
    ]);
  }

  readonly deletePhoto: Locator;
  readonly updatePhoto: Locator;
  readonly fullName: Locator;
  readonly phoneNumber: Locator;
  /** ⚠ no name/label on the email field. */
  readonly email: Locator;
  readonly changePassword: Locator;
  /** Ends the shared session — inspect only, never click. */
  readonly logout: Locator;
  // Change password dialog
  readonly oldPassword: Locator;
  readonly newPassword: Locator;
  readonly confirmPassword: Locator;
  readonly savePassword: Locator;

  constructor(page: Page) {
    super(page, AccountProfilePage.path);
    this.deletePhoto = this.button("Delete");
    this.updatePhoto = this.button("Update");
    this.fullName = page.locator('input[name="username"]');
    this.phoneNumber = page.locator('input[name="phoneNumber"]');
    this.email = page.locator("input.flex.h-10").nth(2);
    this.changePassword = this.nestedButton("Change password");
    this.logout = this.button("Logout");
    this.oldPassword = page.locator('input[name="oldPassword"]');
    this.newPassword = page.locator('input[name="newPassword"]');
    this.confirmPassword = page.locator('input[name="confirmPassword"]');
    this.savePassword = this.button("Save Changes");
  }
}

export class WorkspaceSettingsPage extends SettingsBasePage {
  static readonly path = "/settings/workspace";
  static readonly key = "WORKSPACE_SETTINGS";
  static testPoints(): TestPoint[] {
    return inspectSuite(WorkspaceSettingsPage, [
      ["Create a workspace", (p) => p.createWorkspace],
      ["Search", (p) => p.search],
      ["Sort by creation date", (p) => p.sortByCreationDate],
    ]);
  }

  readonly createWorkspace: Locator;
  readonly search: Locator;
  readonly sortByCreationDate: Locator;

  constructor(page: Page) {
    super(page, WorkspaceSettingsPage.path);
    this.createWorkspace = this.button("Create a workspace");
    this.search = this.placeholder("Search...");
    this.sortByCreationDate = this.button("Creation date");
  }
}

export const INTEGRATION_TABS = ["Publish", "SEO", "Plagiarism", "Workflow", "BYOK"] as const;
export type IntegrationTab = (typeof INTEGRATION_TABS)[number];

export class IntegrationsPage extends SettingsBasePage {
  static readonly path = "/settings/integrations";
  static readonly key = "INTEGRATIONS";
  static testPoints(): TestPoint[] {
    return inspectSuite(
      IntegrationsPage,
      INTEGRATION_TABS.map((t) => [`${t} sub-tab`, (p: IntegrationsPage) => p.subTab(t)] as [string, (p: IntegrationsPage) => Locator]),
    );
  }

  constructor(page: Page) {
    super(page, IntegrationsPage.path);
  }

  subTab(name: IntegrationTab): Locator {
    return this.tab(name);
  }

  /** Connect button of one integration card. Every Connect has the same name, so scope by card text. Never clicked. */
  connectButton(card: string): Locator {
    return this.page
      .locator("div")
      .filter({ hasText: new RegExp(`^${card}`) })
      .getByRole("button", { name: "Connect" })
      .first();
  }
}

export class BillingPage extends SettingsBasePage {
  static readonly path = "/settings/billing";
  static readonly key = "BILLING";
  static testPoints(): TestPoint[] {
    return inspectSuite(BillingPage, [["Plan & Billing", (p) => p.planAndBilling]]);
  }

  /** Opens the payment portal — inspect only, never click. */
  readonly planAndBilling: Locator;

  constructor(page: Page) {
    super(page, BillingPage.path);
    this.planAndBilling = this.button("Plan & Billing");
  }
}

export class HelpCenterPage extends SettingsBasePage {
  static readonly path = "/settings/help-center";
  static readonly key = "HELP_CENTER";
  static testPoints(): TestPoint[] {
    return inspectSuite(HelpCenterPage, [["Contact us", (p) => p.contactUs]]);
  }

  readonly contactUs: Locator;
  // Contact Pluma Support dialog
  readonly subject: Locator;
  readonly ticketTitle: Locator;
  readonly message: Locator;
  /** Sends a real support ticket — inspect only, never click. */
  readonly sendMessage: Locator;

  constructor(page: Page) {
    super(page, HelpCenterPage.path);
    this.contactUs = this.nestedButton("Contact us");
    // No accessible name; the placeholder is text inside the combobox.
    this.subject = this.dialog().getByRole("combobox").filter({ hasText: "Select a subject" });
    this.ticketTitle = this.placeholder("Ticket title...");
    this.message = this.placeholder("Write here...");
    this.sendMessage = this.button("Send Message");
  }
}

export class TrashPage extends SettingsBasePage {
  static readonly path = "/settings/trash";
  static readonly key = "TRASH";
  static testPoints(): TestPoint[] {
    return inspectSuite(TrashPage, [
      ["Search", (p) => p.search],
      ["Restore all", (p) => p.restoreAll],
      ["Delete", (p) => p.deleteButton],
    ]);
  }

  readonly search: Locator;
  /** Restores data — inspect only, never click. */
  readonly restoreAll: Locator;
  /** Deletes data permanently — inspect only, never click. */
  readonly deleteButton: Locator;
  readonly selectAll: Locator;

  constructor(page: Page) {
    super(page, TrashPage.path);
    this.search = this.placeholder("Search...");
    this.restoreAll = this.button("Restore all");
    this.deleteButton = this.button("Delete");
    this.selectAll = page.getByRole("checkbox", { name: "Select all" });
  }
}

// ---- TestPoints -------------------------------------------------------------

export class OpenSettingsPage extends OpenPage {
  constructor() {
    super(SettingsPage);
  }
}
export class OpenAccountProfilePage extends OpenPage {
  constructor() {
    super(AccountProfilePage);
  }
}
export class OpenWorkspaceSettingsPage extends OpenPage {
  constructor() {
    super(WorkspaceSettingsPage);
  }
}
export class OpenIntegrationsPage extends OpenPage {
  constructor() {
    super(IntegrationsPage);
  }
}
export class OpenBillingPage extends OpenPage {
  constructor() {
    super(BillingPage);
  }
}
export class OpenHelpCenterPage extends OpenPage {
  constructor() {
    super(HelpCenterPage);
  }
}
export class OpenTrashPage extends OpenPage {
  constructor() {
    super(TrashPage);
  }
}

const K = SettingsPage.key;

export class SettingsSwitchTab extends TestPoint {
  constructor(tab: SettingsTab) {
    super(actionId(K, 1), `Click the "${tab}" settings tab and land on ${SETTINGS_TABS[tab]}`, async (page) => {
      const pom = new SettingsBasePage(page, SETTINGS_TABS[tab]);
      await pom.settingsTab(tab).click();
      await pom.expectOnPage();
      await expect(pom.settingsTab(tab)).toHaveAttribute("aria-selected", "true");
    });
  }
}

export class AccountProfileOpenChangePassword extends TestPoint {
  constructor() {
    super(actionId(K, 2), "Open the Change password dialog and check its fields", async (page) => {
      const pom = new AccountProfilePage(page);
      await pom.changePassword.click();
      await pom.expectDialogOpen();
      for (const [label, field] of [
        ["old password", pom.oldPassword],
        ["new password", pom.newPassword],
        ["confirm password", pom.confirmPassword],
        ["Save Changes", pom.savePassword],
      ] as const) {
        await pom.expectVisible(field, label);
      }
    });
  }
}

export class SettingsCancelDialog extends TestPoint {
  constructor() {
    super(actionId(K, 3), "Cancel the open settings dialog without saving or sending", async (page) => {
      await new SettingsBasePage(page, /^\/settings/).cancelDialog();
    });
  }
}

export class HelpCenterOpenContactUs extends TestPoint {
  constructor() {
    super(actionId(K, 4), 'Open "Contact Pluma Support" and check its fields', async (page) => {
      const pom = new HelpCenterPage(page);
      await pom.contactUs.click();
      await pom.expectDialogOpen();
      await pom.expectVisible(pom.subject, "subject");
      await pom.expectVisible(pom.ticketTitle, "ticket title");
      await pom.expectVisible(pom.message, "message");
      await pom.expectVisible(pom.sendMessage, "Send Message");
    });
  }
}

export class HelpCenterFillTicketTitle extends TestPoint {
  constructor(title: string) {
    super(actionId(K, 5), "Type a ticket title (not sent)", async (page) => {
      const pom = new HelpCenterPage(page);
      await pom.ticketTitle.fill(title);
      await expect(pom.ticketTitle).toHaveValue(title);
    });
  }
}

export class IntegrationsSwitchSubTab extends TestPoint {
  constructor(tab: IntegrationTab, expectedCard?: string) {
    super(actionId(K, 6), `Open the "${tab}" integrations sub-tab${expectedCard ? ` and see ${expectedCard}` : ""}`, async (page) => {
      const pom = new IntegrationsPage(page);
      await pom.subTab(tab).click();
      await expect(pom.subTab(tab)).toHaveAttribute("aria-selected", "true");
      if (expectedCard) await pom.expectVisible(page.getByText(expectedCard, { exact: true }), expectedCard);
    });
  }
}

export class TrashSearch extends TestPoint {
  constructor(text: string) {
    super(actionId(K, 7), `Type "${text}" in the trash search`, async (page) => {
      const pom = new TrashPage(page);
      await pom.search.fill(text);
      await expect(pom.search).toHaveValue(text);
    });
  }
}
